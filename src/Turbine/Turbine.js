var T = require('@funkia/turbine');

exports._runComponent = T.runComponent;

exports._map = function(f, c) {
  return c.map(f);
}

exports._pure = function(a) {
  return T.Component.of(a);
}

exports._apply = function(f, c) {
  return c.ap(f);
}

exports._bind = function(c, f) {
  return c.chain(f);
}

exports._merge = function() {
  return T.merge;
}

exports._output = function() {
  return function(c, r) {
    return T.output(r, c);
  }
}

exports._list = T.list;

exports._modelView = T.modelView;

exports.dynamic = T.dynamic;
