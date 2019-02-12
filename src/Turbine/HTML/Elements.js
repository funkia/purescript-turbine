var T = require('@funkia/turbine');

// Function for class descriptions

function arrayOf(a) {
  return [a];
}

exports.staticClass = arrayOf;

exports.dynamicClass = arrayOf;

exports.toggleClass = function() {
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

exports._table = function() {
    return T.elements.table;
};

exports._th = function() {
    return T.elements.th;
};

exports._tr = function() {
    return T.elements.tr;
};

exports._td = function() {
    return T.elements.td;
};


exports._text = T.text;

exports._textB = T.dynamic;

exports.br = T.elements.br;

exports.empty = T.emptyComponent;
