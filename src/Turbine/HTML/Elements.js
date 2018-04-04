var T = require('@funkia/turbine');

exports._noProps = {};

exports.mkProps = function() {
  return {};
}

exports.handleAttribute = function(name, value, props) {
  if (props.attrs === undefined) {
    props.attrs = {};
  }
  props.attrs[name] = value;
  return props;
}

exports.handleClass = function(value, props) {
  props.class = value;
  console.log(props);
  return props;
}

exports._h1 = T.elements.h1;

exports._span = T.elements.span;

exports._div = T.elements.div;

exports._input = T.elements.input;

exports._a = T.elements.a;

exports._button = T.elements.button;

exports._text = T.text;

exports._textB = T.dynamic;

exports.br = T.elements.br;
