var app = require('cantina');

app.boot(function (err) {
  if (err) throw err;

  require('../');

  app.start();
});