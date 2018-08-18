var T = require('@funkia/turbine');

exports._h1 = function() {
    return T.elements.h1;
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

exports._section = function() {
    return T.elements.section;
};

exports._text = T.text;

exports._textB = T.dynamic;

exports.br = T.elements.br;
