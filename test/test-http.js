var Application = require('raffaello').Application,
    app = new Application;

var request = require('request'),
    expect = require('expect.js');

var http = require('../lib');

before(function() {
  app.use(http);

  app.plugins.get('/test', function(req, res) {
    res.end('test');
  });

  app.plugins.get('/test/:test', function(req, res) {
    res.end(req.params.test);
  });

  app.plugins.listen(3000);
});

describe('raffaello-http', function() {
  it('should answer connections correctly', function(done) {
    request('http://localhost:3000/test', function(err, res, body) {
      expect(err).not.to.be.ok();
      expect(body).to.be('test');
      done();
    });
  });

  it('should handle params correctly', function(done) {
    var random = Math.random().toString();

    request('http://localhost:3000/test/' + random, function(err, res, body) {
      expect(err).not.to.be.ok();
      expect(body).to.be(random);
      done();
    });
  });
});