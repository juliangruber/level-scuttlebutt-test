var spawn = require('child_process').spawn;
var rimraf = require('rimraf').sync;

var parties = Number(process.argv[2]);
if (!parties) {
  console.error('usage: node test.js [number of parties]');
  process.exit(1);
}

var processes = [];
var delay = 2000;

(function next(i) {
  rimraf(__dirname + '/db-' + i);
  var ps = spawn('node', [__dirname + '/index', i]);
  var ch = String.fromCharCode(64 + i);
  ps.stdout.on('data', log(' ' + ch));
  processes.push(ps);
  if (i < parties) setTimeout(next.bind(null, i + 1), delay);
  else write();
})(1);

function write() {
  var i = 0;
  setInterval(function() {
    var idx = i % parties;
    console.log('!' + String.fromCharCode(65 + idx) + ' ' + i);
    processes[idx].stdin.write(String(i));
    i++;
  }, delay);
}


function log(pre) {
  return function(d) {
    process.stdout.write(pre + ' ' + d.toString());
  }
}
