describe('basic', function () {
  var proc
    , socket
    , onData
    , connectProc

  it('opens a repl on app start', function (done) {
    proc = spawn('node', ['example/app.js'], {cwd: path.resolve(__dirname, '../')});
    process.on('exit', function () {
      proc.kill();
    });
    proc.stdout.on('data', function (data) {
      var message = data.toString();
      if (!socket) {
        var match = /Started REPL on socket ([^']+)' \}/.exec(message);
        assert(match);
        socket = match[1];
        done();
      }
      else {
        onData(message);
      }
    });
  });

  it('can connect to the repl', function (done) {
    onData = function (message) {
      assert(message.match(new RegExp('connected: socket ' + socket)));
      done();
    };
    connectProc = exec('node node_modules/repl-client/repl-client.js ' + socket, function (err, stdout, stderr) {
      assert.ifError(err);
      assert.ifError(stderr);
    });
  });
});