var PluginFactory = require('raffaello').PluginFactory,
    factory = new PluginFactory(),
    connect = require('connect'),
    assert = require('assert');

function deepEqual() {
  try {
    assert.deepEqual.apply(assert, arguments);
    return true;
  } catch(_) {
    return false;
  }
}

factory.extend({
  _constructor: function() {
    var self = this;

    this.server = connect().use(connect.bodyParser());;

    ['get', 'post', 'put', 'delete'].forEach(function(method) {
      self.addMethod(method, self.route.bind(self, method));
    });
  },

  use: function(middleware) {
    this.server.use(middleware);
  },

  listen: function(port) {
    var plugins = this.listeners('req').concat( this.app.listeners('req') ),
        self = this;

    plugins.forEach(function(x) {
      self.server.use(x);
    });

    this.server.listen(port || 1337);
  },

  pathSplit: function(path) {
    return path.split('/').filter(function(piece) {
      return piece.length;
    }); // removes ''
  },

  pathParams: function(fpath, spath) {
    var params = {}, deletedEntries = -1;

    fpath = this.pathSplit(fpath);
    spath = this.pathSplit(spath);

    if (fpath.length !== spath.length) return false;

    fpath = fpath.filter(function(x, idx) {
      if (x.charAt(0) === ':') {
        params[x.slice(1)] = spath.splice(idx - (++deletedEntries), 1).shift();

        return false;
      }

      return true;
    });

    return (deepEqual(fpath, spath)) ? params : false;
  },

  route: function(method, path, fn) {
    var self = this;

    this.on('req', function(req, res, next) {
      var params = self.pathParams(path, req.url);

      if (params && req.method.toLowerCase() === method.toLowerCase()) {
        req.params = params;
        return fn(req, res, next);
      }

      next();
    });
  },
});

factory.setName('http');

module.exports = factory.plugin();