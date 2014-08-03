var app = require('cantina').createApp();

app.boot(function (err) {
  if (err) throw err;

  app.require('../');

  app.start();
});