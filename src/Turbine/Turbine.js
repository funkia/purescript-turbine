var T = require('@funkia/turbine');

exports._runComponent = T.runComponent;

exports._text = T.text;

exports._textB = T.dynamic;

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

exports._modelView = T.modelView;

exports.dynamic = T.dynamic;
