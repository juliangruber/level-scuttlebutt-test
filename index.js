var net = require('net');
var level = require('level');
var crdt = require('crdt');
var levelScuttlebutt = require('level-scuttlebutt');
var sub = require('level-sublevel');
var noop = function(){};

var id = Number(process.argv[2]);
if (isNaN(id)) throw new Error('id required');
console.log('id: %s', id);

var db = sub(level(__dirname + '/db-' + id));
var scDb = db.sublevel('butt');

levelScuttlebutt(scDb, String(id), function() {
  return new crdt.Doc;
});

scDb.open('doc', function(err, doc) {
  if (err) throw err;
  var seq = doc.createSeq('type', 'msg');

  process.stdin.on('data', function(buf) {
    seq.push({
      type: 'msg',
      value: buf.toString().replace(/\n/, '')
    });
  });

  seq.onEach(function(row) {
    console.log('%s: %s', row.id.substr(1, 13), row.state.value);
  });

  net.createServer(function(con) {
    con.pipe(doc.createStream()).pipe(con);
  }).listen(8000 + id);

  var con = net.connect(8000 + id - 1);
  con.on('error', noop);
  con.pipe(doc.createStream()).pipe(con);
});


