var T = require('@funkia/turbine');

// Function for class descriptions

exports.staticClass = function(a) {
  return [a];
};

exports.toggleClass = function() {
  return function(o) { return [o]; };
};

exports.dynamicClass = function() {
  return function(o) { return [o]; };
};

exports._h1 = function() {
    return T.elements.h1;
};

exports._ul = function() {
    return T.elements.ul;
};

exports._li = function() {
    return T.elements.li;
};

exports._span = function() {
    return T.elements.span;
};

exports._div = function() {
    return T.elements.div;
};

exports._input = function() {
  return T.elements.input;
};

exports._textarea = function() {
    return T.elements.textarea;
};

exports._checkbox = function() {
  return T.elements.checkbox;
};

exports._a = function() {
    return T.elements.a;
};

exports._p = function() {
    return T.elements.p;
};

exports._button = function() {
    return T.elements.button;
};

exports._label = function() {
    return T.elements.label;
};

exports._header = function() {
    return T.elements.header;
};

exports._footer = function() {
  return T.elements.footer;
};

exports._section = function() {
    return T.elements.section;
};

exports._text = T.text;

exports._textB = T.dynamic;

exports.br = T.elements.br;
