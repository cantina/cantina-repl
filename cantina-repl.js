var net = require('net')
  , repl = require('repl')
  , fs = require('fs')
  , mkdirp = require('mkdirp')
  , format = require('util').format
  , idgen = require('idgen')
  , extend = require('underscore').extend
  , defaults = require('underscore').defaults;

module.exports = function (app) {
  var conf, id;

  app.conf.add({
    repl: {
      enable: true,
      options: {
        prompt: 'cantina> '
      }
    }
  });

  conf = app.conf.get('repl');
  id = app.conf.get('amino') ? app.amino.id : idgen();

  if (conf.enable) {
    var handle = conf.port || conf.socket || '/tmp/node-repl-' + id + '.sock'
      , pid = app.root + '/pids/repl-' + id + '.pid';

    app.hook('started').add(function (next) {
      app.repl = net.createServer();
      app.repl.on('connection', function (socket) {
        app.log.info('repl', {msg: format('connected: %s', getStringFromAddress(socket.server.address()))});
        var options = defaults(conf.options || {}, {
          prompt: 'app> ',
          terminal: true,
          ignoreUndefined: true
        });
        var repli = repl.start(extend({}, options, { input: socket, output: socket }));
        repli.on('exit', function() {
          app.log.info('repl', {msg: format('disconnected: %s', getStringFromAddress(socket.server.address()))});
          socket.end();
        });
        repli.on('error', function (err) {
          try {
            err.repl = getStringFromAddress(socket.server.address());
          } catch (e) {}
          app.log.error('repl', err);
        });
        // expose the app
        repli.context.app = app;
        // expose options and socket
        repli.context.options = options;
        repli.context.socket = socket;
      });
      app.repl.on('error', function (err) {
        app.log.error('repl', err);
      });
      app.repl.on('close', function () {
        fs.unlinkSync(pid);
        app.log.info('repl', {msg: format('Closed REPL on %s', getStringFromAddress(app.repl.address()))});
      });
      app.repl.listen(handle, function () {
        app.log.info('repl', {msg: format('Started REPL on %s', getStringFromAddress(app.repl.address()))});
        mkdirp(app.root + '/pids', function (err) {
          if (err) app.emit('error', err);
          fs.writeFile(pid, getStringFromAddress(app.repl.address()).replace(/^(tcp:\/\/|socket )/, ''), function (err) {
            if (err) app.emit('error', err);
          });
        });
      });
      next();
    });
  }
};

function getStringFromAddress (addr) {
  if (addr.address && addr.port) {
    return format('tcp://%s:%s', addr.address, addr.port);
  }
  else {
    return format('socket %s', addr);
  }
}
