var T = require('@funkia/turbine');

exports._runComponent = T.runComponent;

exports._map = function(f, c) {
  return c.map(f);
};

exports._apply = function(f, c) {
  return c.ap(f);
};

exports._bind = function(c, f) {
  return c.chain(f);
};

exports._merge = function() {
  return T.merge;
};

exports.component = T.component;

exports._use = function() {
  return function(c, r) {
    return T.use(r, c);
  };
};

exports._list = function() {
  return T.list;
}

exports._modelView = function(model, view) {
  return T.modelView(model, view)();
}

exports.dynamic = T.dynamic;
