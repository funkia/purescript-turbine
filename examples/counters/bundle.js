(function(){function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s}return e})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jabz_1 = require("@funkia/jabz");
var _1 = require("./");
function transitionBehavior(config, initial, triggerStream, timeB) {
    if (timeB === void 0) { timeB = _1.time; }
    return jabz_1.go(function () {
        var rangeValueB, initialStartTime, startTimeB, transition;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, _1.scan(function (newV, prev) { return ({ from: prev.to, to: newV }); }, { from: initial, to: initial }, triggerStream)];
                case 1:
                    rangeValueB = _a.sent();
                    return [4 /*yield*/, timeB];
                case 2:
                    initialStartTime = _a.sent();
                    return [4 /*yield*/, _1.stepper(initialStartTime, _1.snapshot(timeB, triggerStream))];
                case 3:
                    startTimeB = _a.sent();
                    transition = jabz_1.lift(function (range, startTime, now) {
                        var endTime = startTime + config.duration;
                        var scaled = interpolate(startTime, endTime, 0, 1, capToRange(startTime, endTime, now - config.delay));
                        return interpolate(0, 1, range.from, range.to, config.timingFunction(scaled));
                    }, rangeValueB, startTimeB, timeB);
                    return [2 /*return*/, transition];
            }
        });
    });
}
exports.transitionBehavior = transitionBehavior;
function interpolate(fromA, toA, fromB, toB, a) {
    if (a < fromA || a > toA) {
        throw "The number " + a + " is not between the bounds [" + fromA + ", " + toA + "]";
    }
    var spanA = toA - fromA;
    var spanB = toB - fromB;
    var relationA = (a - fromA) / spanA;
    return relationA * spanB + fromB;
}
exports.interpolate = interpolate;
function capToRange(lower, upper, a) {
    return Math.min(Math.max(lower, a), upper);
}
exports.capToRange = capToRange;
exports.linear = function (t) { return t; };
exports.easeIn = function (p) { return function (t) { return Math.pow(t, p); }; };
exports.easeOut = function (p) { return function (t) { return 1 - (Math.pow((1 - t), p)); }; };
exports.easeInOut = function (p) { return function (t) { return (t < .5) ? exports.easeIn(p)(t * 2) / 2
    : exports.easeOut(p)(t * 2 - 1) / 2 + .5; }; };

},{"./":6,"@funkia/jabz":21,"tslib":32}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var linkedlist_1 = require("./linkedlist");
var jabz_1 = require("@funkia/jabz");
var common_1 = require("./common");
var future_1 = require("./future");
var F = require("./future");
var Behavior = /** @class */ (function (_super) {
    tslib_1.__extends(Behavior, _super);
    function Behavior() {
        var _this = _super.call(this) || this;
        _this.multi = true;
        _this.nrOfPullers = 0;
        return _this;
    }
    Behavior.is = function (a) {
        return isBehavior(a);
    };
    Behavior.prototype.map = function (fn) {
        return new MapBehavior(this, fn);
    };
    Behavior.prototype.mapTo = function (v) {
        return new ConstantBehavior(v);
    };
    Behavior.of = function (v) {
        return new ConstantBehavior(v);
    };
    Behavior.prototype.of = function (v) {
        return new ConstantBehavior(v);
    };
    Behavior.prototype.ap = function (f) {
        return new ApBehavior(f, this);
    };
    Behavior.prototype.lift = function () {
        // TODO: Experiment with faster specialized `lift` implementation
        var f = arguments[0];
        switch (arguments.length - 1) {
            case 1:
                return arguments[1].map(f);
            case 2:
                return arguments[2].ap(arguments[1].map(function (a) { return function (b) { return f(a, b); }; }));
            case 3:
                return arguments[3].ap(arguments[2].ap(arguments[1].map(function (a) { return function (b) { return function (c) { return f(a, b, c); }; }; })));
        }
    };
    Behavior.prototype.chain = function (fn) {
        return new ChainBehavior(this, fn);
    };
    Behavior.prototype.at = function () {
        return this.state === 0 /* Push */ ? this.last : this.pull();
    };
    Behavior.prototype.push = function (a) {
        this.last = this.pull();
        this.child.push(this.last);
    };
    Behavior.prototype.pull = function () {
        return this.last;
    };
    Behavior.prototype.activate = function () {
        _super.prototype.activate.call(this);
        if (this.state === 0 /* Push */) {
            this.last = this.pull();
        }
    };
    Behavior.prototype.changePullers = function (n) {
        this.nrOfPullers += n;
        common_1.changePullersParents(n, this.parents);
    };
    Behavior.prototype.semantic = function () {
        throw new Error("The behavior does not have a semantic representation");
    };
    Behavior.prototype.log = function (prefix) {
        this.subscribe(function (a) { return console.log((prefix || "") + " ", a); });
        return this;
    };
    Behavior.multi = true;
    Behavior = tslib_1.__decorate([
        jabz_1.monad
    ], Behavior);
    return Behavior;
}(common_1.Reactive));
exports.Behavior = Behavior;
function isBehavior(b) {
    return typeof b === "object" && ("at" in b);
}
exports.isBehavior = isBehavior;
var ProducerBehavior = /** @class */ (function (_super) {
    tslib_1.__extends(ProducerBehavior, _super);
    function ProducerBehavior() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ProducerBehavior.prototype.push = function (a) {
        var changed = a !== this.last;
        this.last = a;
        if (this.state === 0 /* Push */ && changed) {
            this.child.push(a);
        }
    };
    ProducerBehavior.prototype.changePullers = function (n) {
        this.nrOfPullers += n;
        if (this.nrOfPullers > 0 && this.state === 3 /* Inactive */) {
            this.state = 1 /* Pull */;
            this.activateProducer();
        }
        else if (this.nrOfPullers === 0 && this.state === 1 /* Pull */) {
            this.deactivateProducer();
        }
    };
    ProducerBehavior.prototype.activate = function () {
        if (this.state === 3 /* Inactive */) {
            this.activateProducer();
        }
        this.state = 0 /* Push */;
    };
    ProducerBehavior.prototype.deactivate = function () {
        if (this.nrOfPullers === 0) {
            this.state = 3 /* Inactive */;
            this.deactivateProducer();
        }
        else {
            this.state = 1 /* Pull */;
        }
    };
    return ProducerBehavior;
}(Behavior));
exports.ProducerBehavior = ProducerBehavior;
var ProducerBehaviorFromFunction = /** @class */ (function (_super) {
    tslib_1.__extends(ProducerBehaviorFromFunction, _super);
    function ProducerBehaviorFromFunction(activateFn, initial) {
        var _this = _super.call(this) || this;
        _this.activateFn = activateFn;
        _this.initial = initial;
        _this.last = initial;
        return _this;
    }
    ProducerBehaviorFromFunction.prototype.activateProducer = function () {
        this.state = 0 /* Push */;
        this.deactivateFn = this.activateFn(this.push.bind(this));
    };
    ProducerBehaviorFromFunction.prototype.deactivateProducer = function () {
        this.state = 3 /* Inactive */;
        this.deactivateFn();
    };
    return ProducerBehaviorFromFunction;
}(ProducerBehavior));
function producerBehavior(activate, initial) {
    return new ProducerBehaviorFromFunction(activate, initial);
}
exports.producerBehavior = producerBehavior;
var SinkBehavior = /** @class */ (function (_super) {
    tslib_1.__extends(SinkBehavior, _super);
    function SinkBehavior(last) {
        var _this = _super.call(this) || this;
        _this.last = last;
        return _this;
    }
    SinkBehavior.prototype.activateProducer = function () { };
    SinkBehavior.prototype.deactivateProducer = function () { };
    return SinkBehavior;
}(ProducerBehavior));
exports.SinkBehavior = SinkBehavior;
/**
 * Creates a behavior for imperative pushing.
 */
function sinkBehavior(initial) {
    return new SinkBehavior(initial);
}
exports.sinkBehavior = sinkBehavior;
/**
 * Impure function that gets the current value of a behavior. For a
 * pure variant see `sample`.
 */
function at(b) {
    return b.at();
}
exports.at = at;
var MapBehavior = /** @class */ (function (_super) {
    tslib_1.__extends(MapBehavior, _super);
    function MapBehavior(parent, f) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
        _this.f = f;
        _this.parents = linkedlist_1.cons(parent);
        return _this;
    }
    MapBehavior.prototype.push = function (a) {
        this.last = this.f(a);
        this.child.push(this.last);
    };
    MapBehavior.prototype.pull = function () {
        var newVal = this.parent.at();
        if (this.oldVal !== newVal) {
            this.oldVal = newVal;
            this.cached = this.f(newVal);
        }
        return this.cached;
    };
    MapBehavior.prototype.semantic = function () {
        var _this = this;
        var g = this.parent.semantic();
        return function (t) { return _this.f(g(t)); };
    };
    return MapBehavior;
}(Behavior));
exports.MapBehavior = MapBehavior;
var ApBehavior = /** @class */ (function (_super) {
    tslib_1.__extends(ApBehavior, _super);
    function ApBehavior(fn, val) {
        var _this = _super.call(this) || this;
        _this.fn = fn;
        _this.val = val;
        _this.parents = linkedlist_1.cons(fn, linkedlist_1.cons(val));
        return _this;
    }
    ApBehavior.prototype.push = function () {
        var fn = at(this.fn);
        var val = at(this.val);
        this.last = fn(val);
        this.child.push(this.last);
    };
    ApBehavior.prototype.pull = function () {
        return this.fn.at()(this.val.at());
    };
    return ApBehavior;
}(Behavior));
/**
 * Apply a function valued behavior to a value behavior.
 *
 * @param fnB behavior of functions from `A` to `B`
 * @param valB A behavior of `A`
 * @returns Behavior of the function in `fnB` applied to the value in `valB`
 */
function ap(fnB, valB) {
    return valB.ap(fnB);
}
exports.ap = ap;
var ChainOuter = /** @class */ (function (_super) {
    tslib_1.__extends(ChainOuter, _super);
    function ChainOuter(child, parent) {
        var _this = _super.call(this) || this;
        _this.child = child;
        _this.parent = parent;
        _this.parents = linkedlist_1.cons(parent);
        return _this;
    }
    ChainOuter.prototype.push = function (a) {
        this.child.pushOuter(a);
    };
    return ChainOuter;
}(Behavior));
var ChainBehavior = /** @class */ (function (_super) {
    tslib_1.__extends(ChainBehavior, _super);
    function ChainBehavior(outer, fn) {
        var _this = _super.call(this) || this;
        _this.outer = outer;
        _this.fn = fn;
        // Create the outer consumer
        _this.outerConsumer = new ChainOuter(_this, outer);
        _this.parents = linkedlist_1.cons(_this.outerConsumer);
        return _this;
    }
    ChainBehavior.prototype.activate = function () {
        // Make the consumers listen to inner and outer behavior
        this.outer.addListener(this.outerConsumer);
        if (this.outer.state === 0 /* Push */) {
            this.innerB = this.fn(this.outer.at());
            this.innerB.addListener(this);
            this.state = this.innerB.state;
            this.last = at(this.innerB);
        }
    };
    ChainBehavior.prototype.pushOuter = function (a) {
        // The outer behavior has changed. This means that we will have to
        // call our function, which will result in a new inner behavior.
        // We therefore stop listening to the old inner behavior and begin
        // listening to the new one.
        if (this.innerB !== undefined) {
            this.innerB.removeListener(this);
        }
        var newInner = this.innerB = this.fn(a);
        newInner.addListener(this);
        this.state = newInner.state;
        this.changeStateDown(this.state);
        if (this.state === 0 /* Push */) {
            this.push(newInner.at());
        }
    };
    ChainBehavior.prototype.push = function (b) {
        this.last = b;
        this.child.push(b);
    };
    ChainBehavior.prototype.pull = function () {
        return this.fn(this.outer.at()).at();
    };
    return ChainBehavior;
}(Behavior));
/** @private */
var WhenBehavior = /** @class */ (function (_super) {
    tslib_1.__extends(WhenBehavior, _super);
    function WhenBehavior(parent) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
        _this.push(at(parent));
        return _this;
    }
    WhenBehavior.prototype.push = function (val) {
        if (val === true) {
            this.last = future_1.Future.of({});
        }
        else {
            this.last = new future_1.BehaviorFuture(this.parent);
        }
    };
    WhenBehavior.prototype.pull = function () {
        return this.last;
    };
    return WhenBehavior;
}(Behavior));
function when(b) {
    return new WhenBehavior(b);
}
exports.when = when;
// FIXME: This can probably be made less ugly.
/** @private */
var SnapshotBehavior = /** @class */ (function (_super) {
    tslib_1.__extends(SnapshotBehavior, _super);
    function SnapshotBehavior(parent, future) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
        if (future.state === 4 /* Done */) {
            // Future has occurred at some point in the past
            _this.afterFuture = true;
            _this.state = parent.state;
            parent.addListener(_this);
            _this.last = future_1.Future.of(at(parent));
        }
        else {
            _this.afterFuture = false;
            _this.state = 0 /* Push */;
            _this.last = F.sinkFuture();
            future.addListener(_this);
        }
        return _this;
    }
    SnapshotBehavior.prototype.push = function (val) {
        if (this.afterFuture === false) {
            // The push is coming from the Future, it has just occurred.
            this.afterFuture = true;
            this.last.resolve(at(this.parent));
            this.parent.addListener(this);
        }
        else {
            // We are receiving an update from `parent` after `future` has
            // occurred.
            this.last = future_1.Future.of(val);
        }
    };
    SnapshotBehavior.prototype.pull = function () {
        return this.last;
    };
    return SnapshotBehavior;
}(Behavior));
function snapshotAt(b, f) {
    return new SnapshotBehavior(b, f);
}
exports.snapshotAt = snapshotAt;
/** Behaviors that are always active */
var ActiveBehavior = /** @class */ (function (_super) {
    tslib_1.__extends(ActiveBehavior, _super);
    function ActiveBehavior() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    // noop methods, behavior is always active
    ActiveBehavior.prototype.activate = function () { };
    ActiveBehavior.prototype.deactivate = function () { };
    ActiveBehavior.prototype.changePullers = function () { };
    return ActiveBehavior;
}(Behavior));
exports.ActiveBehavior = ActiveBehavior;
var StatefulBehavior = /** @class */ (function (_super) {
    tslib_1.__extends(StatefulBehavior, _super);
    function StatefulBehavior(a, b, c) {
        var _this = _super.call(this) || this;
        _this.a = a;
        _this.b = b;
        _this.c = c;
        _this.state = 2 /* OnlyPull */;
        return _this;
    }
    return StatefulBehavior;
}(ActiveBehavior));
exports.StatefulBehavior = StatefulBehavior;
var ConstantBehavior = /** @class */ (function (_super) {
    tslib_1.__extends(ConstantBehavior, _super);
    function ConstantBehavior(last) {
        var _this = _super.call(this) || this;
        _this.last = last;
        _this.state = 0 /* Push */;
        return _this;
    }
    ConstantBehavior.prototype.semantic = function () {
        var _this = this;
        return function (_) { return _this.last; };
    };
    return ConstantBehavior;
}(ActiveBehavior));
exports.ConstantBehavior = ConstantBehavior;
/** @private */
var FunctionBehavior = /** @class */ (function (_super) {
    tslib_1.__extends(FunctionBehavior, _super);
    function FunctionBehavior(fn) {
        var _this = _super.call(this) || this;
        _this.fn = fn;
        _this.state = 2 /* OnlyPull */;
        return _this;
    }
    FunctionBehavior.prototype.pull = function () {
        return this.fn();
    };
    return FunctionBehavior;
}(ActiveBehavior));
exports.FunctionBehavior = FunctionBehavior;
function fromFunction(fn) {
    return new FunctionBehavior(fn);
}
exports.fromFunction = fromFunction;
/** @private */
var SwitcherBehavior = /** @class */ (function (_super) {
    tslib_1.__extends(SwitcherBehavior, _super);
    function SwitcherBehavior(b, next) {
        var _this = _super.call(this) || this;
        _this.b = b;
        b.addListener(_this);
        _this.state = b.state;
        if (_this.state === 0 /* Push */) {
            _this.last = at(b);
        }
        // FIXME: Using `bind` is hardly optimal for performance.
        next.subscribe(_this.doSwitch.bind(_this));
        return _this;
    }
    SwitcherBehavior.prototype.push = function (val) {
        this.last = val;
        if (this.child !== undefined) {
            this.child.push(val);
        }
    };
    SwitcherBehavior.prototype.pull = function () {
        return at(this.b);
    };
    SwitcherBehavior.prototype.doSwitch = function (newB) {
        this.b.removeListener(this);
        this.b = newB;
        newB.addListener(this);
        var newState = newB.state;
        if (newState === 0 /* Push */) {
            this.push(newB.at());
        }
        this.state = newState;
        if (this.child !== undefined) {
            this.child.changeStateDown(this.state);
        }
    };
    return SwitcherBehavior;
}(ActiveBehavior));
/**
 * From an initial behavior and a future of a behavior, `switcher`
 * creates a new behavior that acts exactly like `initial` until
 * `next` occurs, after which it acts like the behavior it contains.
 */
function switchTo(init, next) {
    return new SwitcherBehavior(init, next);
}
exports.switchTo = switchTo;
function switcher(init, stream) {
    return fromFunction(function () { return new SwitcherBehavior(init, stream); });
}
exports.switcher = switcher;
var TestBehavior = /** @class */ (function (_super) {
    tslib_1.__extends(TestBehavior, _super);
    function TestBehavior(semanticBehavior) {
        var _this = _super.call(this) || this;
        _this.semanticBehavior = semanticBehavior;
        return _this;
    }
    TestBehavior.prototype.semantic = function () {
        return this.semanticBehavior;
    };
    return TestBehavior;
}(Behavior));
function testBehavior(b) {
    return new TestBehavior(b);
}
exports.testBehavior = testBehavior;
/** @private */
var ActiveScanBehavior = /** @class */ (function (_super) {
    tslib_1.__extends(ActiveScanBehavior, _super);
    function ActiveScanBehavior(f, last, parent) {
        var _this = _super.call(this) || this;
        _this.f = f;
        _this.last = last;
        _this.parent = parent;
        _this.state = 0 /* Push */;
        parent.addListener(_this);
        return _this;
    }
    ActiveScanBehavior.prototype.push = function (val) {
        this.last = this.f(val, this.last);
        if (this.child) {
            this.child.push(this.last);
        }
    };
    return ActiveScanBehavior;
}(ActiveBehavior));
var ScanBehavior = /** @class */ (function (_super) {
    tslib_1.__extends(ScanBehavior, _super);
    function ScanBehavior() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ScanBehavior.prototype.pull = function () {
        return new ActiveScanBehavior(this.a, this.b, this.c);
    };
    ScanBehavior.prototype.semantic = function () {
        var _this = this;
        var stream = this.c.semantic();
        return function (t1) { return testBehavior(function (t2) {
            return stream
                .filter(function (_a) {
                var time = _a.time;
                return t1 <= time && time <= t2;
            })
                .map(function (o) { return o.value; })
                .reduce(function (acc, cur) { return _this.a(cur, acc); }, _this.b);
        }); };
    };
    return ScanBehavior;
}(StatefulBehavior));
function scan(f, initial, source) {
    return new ScanBehavior(f, initial, source);
}
exports.scan = scan;
var IndexReactive = /** @class */ (function (_super) {
    tslib_1.__extends(IndexReactive, _super);
    function IndexReactive(index, parent) {
        var _this = _super.call(this) || this;
        _this.index = index;
        _this.parents = linkedlist_1.cons(parent);
        return _this;
    }
    IndexReactive.prototype.push = function (a) {
        this.child.pushIdx(a, this.index);
    };
    return IndexReactive;
}(common_1.Reactive));
var ActiveScanCombineBehavior = /** @class */ (function (_super) {
    tslib_1.__extends(ActiveScanCombineBehavior, _super);
    function ActiveScanCombineBehavior(streams, last) {
        var _this = _super.call(this) || this;
        _this.last = last;
        _this.state = 0 /* Push */;
        _this.accumulators = [];
        for (var i = 0; i < streams.length; ++i) {
            var _a = streams[i], s = _a[0], f = _a[1];
            _this.accumulators.push(f);
            var indexReactive = new IndexReactive(i, s);
            indexReactive.addListener(_this);
            _this.parents = linkedlist_1.cons(indexReactive, _this.parents);
        }
        return _this;
    }
    ActiveScanCombineBehavior.prototype.pushIdx = function (a, index) {
        this.last = this.accumulators[index](a, this.last);
        if (this.child) {
            this.child.push(this.last);
        }
    };
    return ActiveScanCombineBehavior;
}(ActiveBehavior));
var ScanCombineBehavior = /** @class */ (function (_super) {
    tslib_1.__extends(ScanCombineBehavior, _super);
    function ScanCombineBehavior() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ScanCombineBehavior.prototype.pull = function () {
        return new ActiveScanCombineBehavior(this.a, this.b);
    };
    return ScanCombineBehavior;
}(StatefulBehavior));
function scanCombine(pairs, initial) {
    return new ScanCombineBehavior(pairs, initial);
}
exports.scanCombine = scanCombine;
var firstArg = function (a, b) { return a; };
/**
 * Creates a Behavior whose value is the last occurrence in the stream.
 * @param initial - the initial value that the behavior has
 * @param steps - the stream that will change the value of the behavior
 */
function stepper(initial, steps) {
    return scan(firstArg, initial, steps);
}
exports.stepper = stepper;
/**
 *
 * @param initial the initial value
 * @param turnOn the streams that turn the behavior on
 * @param turnOff the streams that turn the behavior off
 */
function toggle(initial, turnOn, turnOff) {
    return stepper(initial, turnOn.mapTo(true).combine(turnOff.mapTo(false)));
}
exports.toggle = toggle;
var MomentBehavior = /** @class */ (function (_super) {
    tslib_1.__extends(MomentBehavior, _super);
    function MomentBehavior(f) {
        var _this = _super.call(this) || this;
        _this.f = f;
        _this.sampleBound = function (b) { return _this.sample(b); };
        return _this;
    }
    MomentBehavior.prototype.activate = function () {
        try {
            this.last = this.f(this.sampleBound);
            this.state = 0 /* Push */;
        }
        catch (error) {
            if ("placeholder" in error) {
                var placeholder = error.placeholder;
                common_1.removeListenerParents(this, this.parents);
                placeholder.addListener(this);
                this.parents = linkedlist_1.cons(placeholder);
            }
            else {
                throw error;
            }
        }
    };
    MomentBehavior.prototype.push = function () {
        common_1.removeListenerParents(this, this.parents);
        this.parents = undefined;
        this.child.push(this.last = this.f(this.sampleBound));
    };
    MomentBehavior.prototype.sample = function (b) {
        b.addListener(this);
        this.parents = linkedlist_1.cons(b, this.parents);
        return b.at();
    };
    return MomentBehavior;
}(Behavior));
function moment(f) {
    return new MomentBehavior(f);
}
exports.moment = moment;

},{"./common":3,"./future":5,"./linkedlist":7,"@funkia/jabz":21,"tslib":32}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function isBehavior(b) {
    return typeof b === "object" && ("at" in b);
}
var PushOnlyObserver = /** @class */ (function () {
    function PushOnlyObserver(callback, source) {
        this.callback = callback;
        this.source = source;
        source.addListener(this);
        if (isBehavior(source) && source.state === 0 /* Push */) {
            callback(source.at());
        }
    }
    PushOnlyObserver.prototype.push = function (a) {
        this.callback(a);
    };
    PushOnlyObserver.prototype.deactivate = function () {
        this.source.removeListener(this);
    };
    PushOnlyObserver.prototype.changeStateDown = function (state) { };
    return PushOnlyObserver;
}());
exports.PushOnlyObserver = PushOnlyObserver;
var MultiObserver = /** @class */ (function () {
    function MultiObserver(c1, c2) {
        this.listeners = [c1, c2];
    }
    MultiObserver.prototype.push = function (a) {
        for (var i = this.listeners.length - 1; 0 <= i; --i) {
            this.listeners[i].push(a);
        }
    };
    MultiObserver.prototype.changeStateDown = function (state) {
        for (var i = this.listeners.length - 1; 0 <= i; --i) {
            this.listeners[i].changeStateDown(state);
        }
    };
    return MultiObserver;
}());
exports.MultiObserver = MultiObserver;
function addListenerParents(child, parents, state) {
    var parentState = parents.value.addListener(child);
    var newState = parentState !== 0 /* Push */ ? parentState : state;
    if (parents.tail !== undefined) {
        return addListenerParents(child, parents.tail, newState);
    }
    else {
        return newState;
    }
}
exports.addListenerParents = addListenerParents;
function removeListenerParents(child, parents) {
    parents.value.removeListener(child);
    if (parents.tail !== undefined) {
        removeListenerParents(child, parents.tail);
    }
}
exports.removeListenerParents = removeListenerParents;
function changePullersParents(n, parents) {
    if (parents === undefined) {
        return;
    }
    if (isBehavior(parents.value)) {
        parents.value.changePullers(n);
    }
    changePullersParents(n, parents.tail);
}
exports.changePullersParents = changePullersParents;
var Reactive = /** @class */ (function () {
    function Reactive() {
        this.state = 3 /* Inactive */;
        this.nrOfListeners = 0;
    }
    Reactive.prototype.addListener = function (c) {
        var nr = ++this.nrOfListeners;
        if (nr === 1) {
            this.child = c;
            this.activate();
        }
        else if (nr === 2) {
            this.child = new MultiObserver(this.child, c);
        }
        else {
            this.child.listeners.push(c);
        }
        return this.state;
    };
    Reactive.prototype.removeListener = function (listener) {
        var nr = --this.nrOfListeners;
        if (nr === 0) {
            this.child = undefined;
            if (this.state !== 4 /* Done */) {
                this.deactivate();
            }
        }
        else if (nr === 1) {
            var l = this.child.listeners;
            this.child = l[l[0] === listener ? 1 : 0];
        }
        else {
            var l = this.child.listeners;
            // The indexOf here is O(n), where n is the number of listeners,
            // if using a linked list it should be possible to perform the
            // unsubscribe operation in constant time.
            var idx = l.indexOf(listener);
            if (idx !== -1) {
                if (idx !== l.length - 1) {
                    l[idx] = l[l.length - 1];
                }
                l.length--; // remove the last element of the list
            }
        }
    };
    Reactive.prototype.changeStateDown = function (state) {
        if (this.child !== undefined) {
            this.child.changeStateDown(state);
        }
    };
    Reactive.prototype.subscribe = function (callback) {
        return new PushOnlyObserver(callback, this);
    };
    Reactive.prototype.observe = function (push, beginPulling, endPulling) {
        return new CbObserver(push, beginPulling, endPulling, this);
    };
    Reactive.prototype.activate = function () {
        this.state = addListenerParents(this, this.parents, 0 /* Push */);
    };
    Reactive.prototype.deactivate = function (done) {
        if (done === void 0) { done = false; }
        removeListenerParents(this, this.parents);
        this.state = done === true ? 4 /* Done */ : 3 /* Inactive */;
    };
    return Reactive;
}());
exports.Reactive = Reactive;
var CbObserver = /** @class */ (function () {
    function CbObserver(_push, _beginPulling, _endPulling, source) {
        this._push = _push;
        this._beginPulling = _beginPulling;
        this._endPulling = _endPulling;
        this.source = source;
        source.addListener(this);
        if (source.state === 1 /* Pull */ || source.state === 2 /* OnlyPull */) {
            _beginPulling();
        }
        else if (isBehavior(source) && source.state === 0 /* Push */) {
            _push(source.last);
        }
    }
    CbObserver.prototype.push = function (a) {
        this._push(a);
    };
    CbObserver.prototype.changeStateDown = function (state) {
        if (state === 1 /* Pull */ || state === 2 /* OnlyPull */) {
            this._beginPulling();
        }
        else {
            this._endPulling();
        }
    };
    return CbObserver;
}());
exports.CbObserver = CbObserver;
/**
 * Observe a behavior for the purpose of running side-effects based on
 * the value of the behavior.
 * @param push Called with all values that the behavior pushes
 * through.
 * @param beginPulling Called when the consumer should begin pulling
 * values from the behavior.
 * @param endPulling Called when the consumer should stop pulling.
 * @param behavior The behavior to consume.
 */
function observe(push, beginPulling, endPulling, behavior) {
    return behavior.observe(push, beginPulling, endPulling);
}
exports.observe = observe;

},{}],4:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var stream_1 = require("./stream");
var behavior_1 = require("./behavior");
var DomEventStream = /** @class */ (function (_super) {
    tslib_1.__extends(DomEventStream, _super);
    function DomEventStream(target, eventName, extractor) {
        var _this = _super.call(this) || this;
        _this.target = target;
        _this.eventName = eventName;
        _this.extractor = extractor;
        return _this;
    }
    DomEventStream.prototype.handleEvent = function (event) {
        this.push(this.extractor(event, this.target));
    };
    DomEventStream.prototype.activate = function () {
        this.target.addEventListener(this.eventName, this);
    };
    DomEventStream.prototype.deactivate = function () {
        this.target.removeEventListener(this.eventName, this);
    };
    return DomEventStream;
}(stream_1.ProducerStream));
function id(a) {
    return a;
}
function streamFromEvent(target, eventName, extractor) {
    if (extractor === void 0) { extractor = id; }
    return new DomEventStream(target, eventName, extractor);
}
exports.streamFromEvent = streamFromEvent;
var DomEventBehavior = /** @class */ (function (_super) {
    tslib_1.__extends(DomEventBehavior, _super);
    function DomEventBehavior(target, eventName, initial, extractor) {
        var _this = _super.call(this) || this;
        _this.target = target;
        _this.eventName = eventName;
        _this.extractor = extractor;
        _this.last = initial;
        return _this;
    }
    DomEventBehavior.prototype.handleEvent = function (event) {
        this.push(this.extractor(event, this.target));
    };
    DomEventBehavior.prototype.activateProducer = function () {
        this.target.addEventListener(this.eventName, this);
    };
    DomEventBehavior.prototype.deactivateProducer = function () {
        this.target.removeEventListener(this.eventName, this);
    };
    return DomEventBehavior;
}(behavior_1.ProducerBehavior));
function behaviorFromEvent(target, eventName, initial, extractor) {
    if (extractor === void 0) { extractor = id; }
    return new DomEventBehavior(target, eventName, initial, extractor);
}
exports.behaviorFromEvent = behaviorFromEvent;

},{"./behavior":2,"./stream":10,"tslib":32}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jabz_1 = require("@funkia/jabz");
var common_1 = require("./common");
var linkedlist_1 = require("./linkedlist");
/**
 * A future is a thing that occurs at some point in time with a value.
 * It can be understood as a pair consisting of the time the future
 * occurs and its associated value. It is quite like a JavaScript
 * promise.
 */
var Future = /** @class */ (function (_super) {
    tslib_1.__extends(Future, _super);
    function Future() {
        var _this = _super.call(this) || this;
        _this.multi = false;
        return _this;
    }
    Future.prototype.resolve = function (val) {
        this.deactivate(true);
        this.value = val;
        if (this.child !== undefined) {
            this.child.push(val);
        }
    };
    Future.prototype.addListener = function (c) {
        if (this.state === 4 /* Done */) {
            c.push(this.value);
            return 4 /* Done */;
        }
        else {
            return _super.prototype.addListener.call(this, c);
        }
    };
    Future.prototype.combine = function (future) {
        return new CombineFuture(this, future);
    };
    // A future is a functor, when the future occurs we can feed its
    // result through the mapping function
    Future.prototype.map = function (f) {
        return new MapFuture(f, this);
    };
    Future.prototype.mapTo = function (b) {
        return new MapToFuture(b, this);
    };
    // A future is an applicative. `of` gives a future that has always
    // occurred at all points in time.
    Future.of = function (b) {
        return new OfFuture(b);
    };
    Future.prototype.of = function (b) {
        return new OfFuture(b);
    };
    Future.prototype.lift = function (f) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return f.length === 1 ? new MapFuture(f, args[0])
            : new LiftFuture(f, args);
    };
    // A future is a monad. Once the first future occurs `chain` passes
    // its value through the chain function and the future it returns is
    // the one returned by `chain`.
    Future.prototype.chain = function (f) {
        return new ChainFuture(f, this);
    };
    Future = tslib_1.__decorate([
        jabz_1.monad
    ], Future);
    return Future;
}(common_1.Reactive));
exports.Future = Future;
var CombineFuture = /** @class */ (function (_super) {
    tslib_1.__extends(CombineFuture, _super);
    function CombineFuture(future1, future2) {
        var _this = _super.call(this) || this;
        _this.future1 = future1;
        _this.future2 = future2;
        _this.parents = linkedlist_1.cons(future1, linkedlist_1.cons(future2));
        return _this;
    }
    CombineFuture.prototype.push = function (val) {
        this.resolve(val);
    };
    return CombineFuture;
}(Future));
var MapFuture = /** @class */ (function (_super) {
    tslib_1.__extends(MapFuture, _super);
    function MapFuture(f, parent) {
        var _this = _super.call(this) || this;
        _this.f = f;
        _this.parents = linkedlist_1.cons(parent);
        return _this;
    }
    MapFuture.prototype.push = function (val) {
        this.resolve(this.f(val));
    };
    return MapFuture;
}(Future));
var MapToFuture = /** @class */ (function (_super) {
    tslib_1.__extends(MapToFuture, _super);
    function MapToFuture(value, parent) {
        var _this = _super.call(this) || this;
        _this.value = value;
        _this.parents = linkedlist_1.cons(parent);
        return _this;
    }
    MapToFuture.prototype.push = function (_) {
        this.resolve(this.value);
    };
    return MapToFuture;
}(Future));
var OfFuture = /** @class */ (function (_super) {
    tslib_1.__extends(OfFuture, _super);
    function OfFuture(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        _this.state = 4 /* Done */;
        return _this;
    }
    /* istanbul ignore next */
    OfFuture.prototype.push = function (_) {
        throw new Error("A PureFuture should never be pushed to.");
    };
    return OfFuture;
}(Future));
var LiftFuture = /** @class */ (function (_super) {
    tslib_1.__extends(LiftFuture, _super);
    function LiftFuture(f, futures) {
        var _this = _super.call(this) || this;
        _this.f = f;
        _this.futures = futures;
        _this.missing = futures.length;
        _this.parents = linkedlist_1.fromArray(futures);
        return _this;
    }
    LiftFuture.prototype.push = function (_) {
        if (--this.missing === 0) {
            // All the dependencies have occurred.
            for (var i = 0; i < this.futures.length; ++i) {
                this.futures[i] = this.futures[i].value;
            }
            this.resolve(this.f.apply(undefined, this.futures));
        }
    };
    return LiftFuture;
}(Future));
var ChainFuture = /** @class */ (function (_super) {
    tslib_1.__extends(ChainFuture, _super);
    function ChainFuture(f, parent) {
        var _this = _super.call(this) || this;
        _this.f = f;
        _this.parent = parent;
        _this.parentOccurred = false;
        _this.parents = linkedlist_1.cons(parent);
        return _this;
    }
    ChainFuture.prototype.push = function (val) {
        if (this.parentOccurred === false) {
            // The first future occurred. We can now call `f` with its value
            // and listen to the future it returns.
            this.parentOccurred = true;
            var newFuture = this.f(val);
            newFuture.addListener(this);
        }
        else {
            this.resolve(val);
        }
    };
    return ChainFuture;
}(Future));
/**
 * A Sink is a producer that one can imperatively resolve.
 * @private
 */
var SinkFuture = /** @class */ (function (_super) {
    tslib_1.__extends(SinkFuture, _super);
    function SinkFuture() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /* istanbul ignore next */
    SinkFuture.prototype.push = function (val) {
        throw new Error("A sink should not be pushed to.");
    };
    SinkFuture.prototype.activate = function () { };
    SinkFuture.prototype.deactivate = function () { };
    return SinkFuture;
}(Future));
exports.SinkFuture = SinkFuture;
function sinkFuture() {
    return new SinkFuture();
}
exports.sinkFuture = sinkFuture;
function fromPromise(p) {
    var future = sinkFuture();
    p.then(future.resolve.bind(future));
    return future;
}
exports.fromPromise = fromPromise;
/**
 * Create a future from a pushing behavior. The future occurs when the
 * behavior pushes its next value. Constructing a BehaviorFuture is
 * impure and should not be done directly.
 * @private
 */
var BehaviorFuture = /** @class */ (function (_super) {
    tslib_1.__extends(BehaviorFuture, _super);
    function BehaviorFuture(b) {
        var _this = _super.call(this) || this;
        _this.b = b;
        b.addListener(_this);
        return _this;
    }
    /* istanbul ignore next */
    BehaviorFuture.prototype.changeStateDown = function () {
        throw new Error("Behavior future does not support pushing behavior");
    };
    BehaviorFuture.prototype.push = function (a) {
        this.b.removeListener(this);
        this.resolve(a);
    };
    return BehaviorFuture;
}(SinkFuture));
exports.BehaviorFuture = BehaviorFuture;

},{"./common":3,"./linkedlist":7,"@funkia/jabz":21,"tslib":32}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
tslib_1.__exportStar(require("./common"), exports);
tslib_1.__exportStar(require("./behavior"), exports);
tslib_1.__exportStar(require("./stream"), exports);
tslib_1.__exportStar(require("./future"), exports);
tslib_1.__exportStar(require("./now"), exports);
tslib_1.__exportStar(require("./dom"), exports);
tslib_1.__exportStar(require("./time"), exports);
tslib_1.__exportStar(require("./placeholder"), exports);
tslib_1.__exportStar(require("./animation"), exports);
tslib_1.__exportStar(require("./test"), exports);
function map(fn, b) {
    return b.map(fn);
}
exports.map = map;
function publish(a, stream) {
    stream.push(a);
}
exports.publish = publish;

},{"./animation":1,"./behavior":2,"./common":3,"./dom":4,"./future":5,"./now":8,"./placeholder":9,"./stream":10,"./test":11,"./time":12,"tslib":32}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Cons = /** @class */ (function () {
    function Cons(value, tail) {
        this.value = value;
        this.tail = tail;
    }
    return Cons;
}());
exports.Cons = Cons;
function cons(value, tail) {
    return new Cons(value, tail);
}
exports.cons = cons;
function fromArray(values) {
    var list = cons(values[0]);
    for (var i = 1; i < values.length; ++i) {
        list = cons(values[i], list);
    }
    return list;
}
exports.fromArray = fromArray;
/**
 * A doubly linked list. Updates are done by mutating. Prepend, append
 * and remove all run in O(1) time.
 */
/* Not used yet. The plan is to use it to keep track of subscribed children.
export class LinkedList<A> {
  size: number;
  head: Node<A> | undefined;
  tail: Node<A> | undefined;
  constructor() {
    this.size = 0;
  }
  append(a: A): LinkedList<A> {
    const tail = this.tail;
    const newNode = new Node(a, tail, undefined);
    tail.next = newNode;
    this.tail = newNode;
    this.size++;
    return this;
  }
  remove(node: Node<A>): LinkedList<A> {
    if (node.next !== undefined) {
      node.next.prev = node.prev;
    }
    if (node.prev !== undefined) {
      node.prev.next = node.next;
    }
    if (this.head === node) {
      this.head = node.next;
    }
    if (this.tail === node) {
      this.tail = node.prev;
    }
    return this;
  }
}

export class Node<A> {
  constructor(
    public value: A,
    public prev: Node<A> | undefined,
    public next: Node<A> | undefined
  ) { }
}
*/ 

},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var jabz_1 = require("@funkia/jabz");
var placeholder_1 = require("./placeholder");
var future_1 = require("./future");
var behavior_1 = require("./behavior");
var stream_1 = require("./stream");
var Now = /** @class */ (function () {
    function Now() {
        this.multi = false;
        this.isNow = true;
    }
    Now.is = function (a) {
        return typeof a === "object" && a.isNow === true;
    };
    Now.prototype.of = function (b) {
        return new OfNow(b);
    };
    Now.of = function (b) {
        return new OfNow(b);
    };
    Now.prototype.chain = function (f) {
        return new ChainNow(this, f);
    };
    Now.prototype.test = function (t) {
        throw new Error("The Now computation does not support testing yet");
    };
    Now.multi = false;
    Now = tslib_1.__decorate([
        jabz_1.monad
    ], Now);
    return Now;
}());
exports.Now = Now;
var OfNow = /** @class */ (function (_super) {
    tslib_1.__extends(OfNow, _super);
    function OfNow(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        return _this;
    }
    OfNow.prototype.run = function () {
        return this.value;
    };
    OfNow.prototype.test = function (_) {
        return this.value;
    };
    return OfNow;
}(Now));
var ChainNow = /** @class */ (function (_super) {
    tslib_1.__extends(ChainNow, _super);
    function ChainNow(first, f) {
        var _this = _super.call(this) || this;
        _this.first = first;
        _this.f = f;
        return _this;
    }
    ChainNow.prototype.run = function () {
        return this.f(this.first.run()).run();
    };
    ChainNow.prototype.test = function (t) {
        return this.f(this.first.test(t)).test(t);
    };
    return ChainNow;
}(Now));
var SampleNow = /** @class */ (function (_super) {
    tslib_1.__extends(SampleNow, _super);
    function SampleNow(b) {
        var _this = _super.call(this) || this;
        _this.b = b;
        return _this;
    }
    SampleNow.prototype.run = function () {
        return behavior_1.at(this.b);
    };
    SampleNow.prototype.test = function (t) {
        return this.b.semantic()(t);
    };
    return SampleNow;
}(Now));
function sample(b) {
    return new SampleNow(b);
}
exports.sample = sample;
var PerformNow = /** @class */ (function (_super) {
    tslib_1.__extends(PerformNow, _super);
    function PerformNow(comp) {
        var _this = _super.call(this) || this;
        _this.comp = comp;
        return _this;
    }
    PerformNow.prototype.run = function () {
        return future_1.fromPromise(jabz_1.runIO(this.comp));
    };
    return PerformNow;
}(Now));
function perform(comp) {
    return new PerformNow(comp);
}
exports.perform = perform;
var PerformIOStream = /** @class */ (function (_super) {
    tslib_1.__extends(PerformIOStream, _super);
    function PerformIOStream(s) {
        var _this = _super.call(this) || this;
        s.addListener(_this);
        _this.state = 0 /* Push */;
        return _this;
    }
    PerformIOStream.prototype.push = function (io) {
        var _this = this;
        jabz_1.runIO(io).then(function (a) {
            if (_this.child !== undefined) {
                _this.child.push(a);
            }
        });
    };
    return PerformIOStream;
}(stream_1.ActiveStream));
var PerformStreamNow = /** @class */ (function (_super) {
    tslib_1.__extends(PerformStreamNow, _super);
    function PerformStreamNow(s) {
        var _this = _super.call(this) || this;
        _this.s = s;
        return _this;
    }
    PerformStreamNow.prototype.run = function () {
        return new PerformIOStream(this.s);
    };
    return PerformStreamNow;
}(Now));
function performStream(s) {
    return new PerformStreamNow(s);
}
exports.performStream = performStream;
var PerformIOStreamLatest = /** @class */ (function (_super) {
    tslib_1.__extends(PerformIOStreamLatest, _super);
    function PerformIOStreamLatest(s) {
        var _this = _super.call(this) || this;
        _this.next = 0;
        _this.newest = 0;
        _this.running = 0;
        s.addListener(_this);
        return _this;
    }
    PerformIOStreamLatest.prototype.push = function (io) {
        var _this = this;
        var time = ++this.next;
        this.running++;
        jabz_1.runIO(io).then(function (a) {
            _this.running--;
            if (time > _this.newest) {
                if (_this.running === 0) {
                    _this.next = 0;
                    _this.newest = 0;
                }
                else {
                    _this.newest = time;
                }
                if (_this.child !== undefined) {
                    _this.child.push(a);
                }
            }
        });
    };
    return PerformIOStreamLatest;
}(stream_1.ActiveStream));
var PerformStreamNowLatest = /** @class */ (function (_super) {
    tslib_1.__extends(PerformStreamNowLatest, _super);
    function PerformStreamNowLatest(s) {
        var _this = _super.call(this) || this;
        _this.s = s;
        return _this;
    }
    PerformStreamNowLatest.prototype.run = function () {
        return new PerformIOStreamLatest(this.s);
    };
    return PerformStreamNowLatest;
}(Now));
function performStreamLatest(s) {
    return new PerformStreamNowLatest(s);
}
exports.performStreamLatest = performStreamLatest;
var PerformIOStreamOrdered = /** @class */ (function (_super) {
    tslib_1.__extends(PerformIOStreamOrdered, _super);
    function PerformIOStreamOrdered(s) {
        var _this = _super.call(this) || this;
        _this.nextId = 0;
        _this.next = 0;
        _this.buffer = []; // Object-wrapper to support a result as undefined
        s.addListener(_this);
        return _this;
    }
    PerformIOStreamOrdered.prototype.push = function (io) {
        var _this = this;
        var id = this.nextId++;
        jabz_1.runIO(io).then(function (a) {
            if (id === _this.next) {
                _this.buffer[0] = { value: a };
                _this.pushFromBuffer();
            }
            else {
                _this.buffer[id - _this.next] = { value: a };
            }
        });
    };
    PerformIOStreamOrdered.prototype.pushFromBuffer = function () {
        while (this.buffer[0] !== undefined) {
            var value = this.buffer.shift().value;
            if (this.child !== undefined) {
                this.child.push(value);
            }
            this.next++;
        }
    };
    return PerformIOStreamOrdered;
}(stream_1.ActiveStream));
var PerformStreamNowOrdered = /** @class */ (function (_super) {
    tslib_1.__extends(PerformStreamNowOrdered, _super);
    function PerformStreamNowOrdered(s) {
        var _this = _super.call(this) || this;
        _this.s = s;
        return _this;
    }
    PerformStreamNowOrdered.prototype.run = function () {
        return new PerformIOStreamOrdered(this.s);
    };
    return PerformStreamNowOrdered;
}(Now));
function performStreamOrdered(s) {
    return new PerformStreamNowOrdered(s);
}
exports.performStreamOrdered = performStreamOrdered;
function run(now) {
    return now.run();
}
var PlanNow = /** @class */ (function (_super) {
    tslib_1.__extends(PlanNow, _super);
    function PlanNow(future) {
        var _this = _super.call(this) || this;
        _this.future = future;
        return _this;
    }
    PlanNow.prototype.run = function () {
        return this.future.map(run);
    };
    return PlanNow;
}(Now));
function plan(future) {
    return new PlanNow(future);
}
exports.plan = plan;
function runNow(now) {
    return new Promise(function (resolve, reject) {
        now.run().subscribe(resolve);
    });
}
exports.runNow = runNow;
/**
 * Test run a now computation without executing its side-effects.
 * @param now The now computation to test.
 * @param time The point in time at which the now computation should
 * be run. Defaults to 0.
 */
function testNow(now, time) {
    if (time === void 0) { time = 0; }
    return now.test(time);
}
exports.testNow = testNow;
var placeholderProxyHandler = {
    get: function (target, name) {
        if (!(name in target)) {
            target[name] = placeholder_1.placeholder();
        }
        return target[name];
    }
};
var LoopNow = /** @class */ (function (_super) {
    tslib_1.__extends(LoopNow, _super);
    function LoopNow(fn, placeholderNames) {
        var _this = _super.call(this) || this;
        _this.fn = fn;
        _this.placeholderNames = placeholderNames;
        return _this;
    }
    LoopNow.prototype.run = function () {
        var placeholderObject;
        if (this.placeholderNames === undefined) {
            placeholderObject = new Proxy({}, placeholderProxyHandler);
        }
        else {
            placeholderObject = {};
            for (var _i = 0, _a = this.placeholderNames; _i < _a.length; _i++) {
                var name_1 = _a[_i];
                placeholderObject[name_1] = placeholder_1.placeholder();
            }
        }
        var result = this.fn(placeholderObject).run();
        var returned = Object.keys(result);
        for (var _b = 0, returned_1 = returned; _b < returned_1.length; _b++) {
            var name_2 = returned_1[_b];
            placeholderObject[name_2].replaceWith(result[name_2]);
        }
        return result;
    };
    return LoopNow;
}(Now));
function loopNow(fn, names) {
    return new LoopNow(fn, names);
}
exports.loopNow = loopNow;

},{"./behavior":2,"./future":5,"./placeholder":9,"./stream":10,"@funkia/jabz":21,"tslib":32}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var behavior_1 = require("./behavior");
var stream_1 = require("./stream");
var SamplePlaceholderError = /** @class */ (function () {
    function SamplePlaceholderError(placeholder) {
        this.placeholder = placeholder;
        this.message = "Attempt to sample non-replaced placeholder";
    }
    SamplePlaceholderError.prototype.toString = function () {
        return this.message;
    };
    return SamplePlaceholderError;
}());
var Placeholder = /** @class */ (function (_super) {
    tslib_1.__extends(Placeholder, _super);
    function Placeholder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Placeholder.prototype.replaceWith = function (parent) {
        this.source = parent;
        if (this.child !== undefined) {
            this.activate();
            if (behavior_1.isBehavior(parent) && this.state === 0 /* Push */) {
                this.push(parent.at());
            }
        }
        if (behavior_1.isBehavior(parent)) {
            parent.changePullers(this.nrOfPullers);
        }
    };
    Placeholder.prototype.push = function (a) {
        this.last = a;
        this.child.push(a);
    };
    Placeholder.prototype.pull = function () {
        if (this.source === undefined) {
            throw new SamplePlaceholderError(this);
        }
        return this.source.pull();
    };
    Placeholder.prototype.activate = function () {
        if (this.source !== undefined) {
            this.source.addListener(this);
            this.state = this.source.state;
            this.changeStateDown(this.state);
        }
    };
    Placeholder.prototype.deactivate = function (done) {
        if (done === void 0) { done = false; }
        this.state = 3 /* Inactive */;
        if (this.source !== undefined) {
            this.source.removeListener(this);
        }
    };
    Placeholder.prototype.changePullers = function (n) {
        this.nrOfPullers += n;
        if (this.source !== undefined) {
            this.source.changePullers(n);
        }
    };
    Placeholder.prototype.map = function (fn) {
        return new MapPlaceholder(this, fn);
    };
    Placeholder.prototype.mapTo = function (b) {
        return (new MapToPlaceholder(this, b));
    };
    return Placeholder;
}(behavior_1.Behavior));
exports.Placeholder = Placeholder;
var MapPlaceholder = /** @class */ (function (_super) {
    tslib_1.__extends(MapPlaceholder, _super);
    function MapPlaceholder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MapPlaceholder;
}(behavior_1.MapBehavior));
var MapToPlaceholder = /** @class */ (function (_super) {
    tslib_1.__extends(MapToPlaceholder, _super);
    function MapToPlaceholder() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return MapToPlaceholder;
}(stream_1.MapToStream));
function install(target, source) {
    for (var _i = 0, _a = Object.getOwnPropertyNames(source.prototype); _i < _a.length; _i++) {
        var key = _a[_i];
        if (target.prototype[key] === undefined) {
            target.prototype[key] = source.prototype[key];
        }
    }
}
function installMethods() {
    install(Placeholder, stream_1.Stream);
    MapPlaceholder.prototype.map = Placeholder.prototype.map;
    MapPlaceholder.prototype.mapTo = Placeholder.prototype.mapTo;
    MapToPlaceholder.prototype.map = Placeholder.prototype.map;
    MapToPlaceholder.prototype.mapTo = Placeholder.prototype.mapTo;
    install(MapPlaceholder, stream_1.Stream);
    install(MapToPlaceholder, behavior_1.Behavior);
}
function placeholder() {
    if (Placeholder.prototype.scanS === undefined) {
        // The methods are installed lazily when the placeholder is first
        // used. This avoids a top-level impure expression that would
        // prevent tree-shaking.
        installMethods();
    }
    return new Placeholder();
}
exports.placeholder = placeholder;

},{"./behavior":2,"./stream":10,"tslib":32}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var common_1 = require("./common");
var linkedlist_1 = require("./linkedlist");
var behavior_1 = require("./behavior");
/**
 * A stream is a list of occurrences over time. Each occurrence
 * happens at a point in time and has an associated value.
 */
var Stream = /** @class */ (function (_super) {
    tslib_1.__extends(Stream, _super);
    function Stream() {
        return _super.call(this) || this;
    }
    Stream.prototype.combine = function (stream) {
        return new CombineStream(stream, this);
    };
    Stream.prototype.map = function (f) {
        return new MapStream(this, f);
    };
    Stream.prototype.mapTo = function (b) {
        return new MapToStream(this, b);
    };
    Stream.prototype.filter = function (fn) {
        return new FilterStream(this, fn);
    };
    Stream.prototype.scanS = function (fn, startingValue) {
        var _this = this;
        return behavior_1.fromFunction(function () { return new ScanStream(fn, startingValue, _this); });
    };
    Stream.prototype.scan = function (fn, init) {
        return behavior_1.scan(fn, init, this);
    };
    Stream.prototype.log = function (prefix) {
        this.subscribe(function (a) { return console.log((prefix || "") + " ", a); });
        return this;
    };
    /* istanbul ignore next */
    Stream.prototype.semantic = function () {
        throw new Error("The stream does not have a semantic representation");
    };
    return Stream;
}(common_1.Reactive));
exports.Stream = Stream;
var MapStream = /** @class */ (function (_super) {
    tslib_1.__extends(MapStream, _super);
    function MapStream(parent, f) {
        var _this = _super.call(this) || this;
        _this.f = f;
        _this.parents = linkedlist_1.cons(parent);
        return _this;
    }
    MapStream.prototype.semantic = function () {
        var _this = this;
        var s = this.parents.value.semantic();
        return s.map(function (_a) {
            var time = _a.time, value = _a.value;
            return ({ time: time, value: _this.f(value) });
        });
    };
    MapStream.prototype.push = function (a) {
        this.child.push(this.f(a));
    };
    return MapStream;
}(Stream));
exports.MapStream = MapStream;
var MapToStream = /** @class */ (function (_super) {
    tslib_1.__extends(MapToStream, _super);
    function MapToStream(parent, b) {
        var _this = _super.call(this) || this;
        _this.b = b;
        _this.parents = linkedlist_1.cons(parent);
        return _this;
    }
    MapToStream.prototype.semantic = function () {
        var _this = this;
        var s = this.parents.value.semantic();
        return s.map(function (_a) {
            var time = _a.time;
            return ({ time: time, value: _this.b });
        });
    };
    MapToStream.prototype.push = function (a) {
        this.child.push(this.b);
    };
    return MapToStream;
}(Stream));
exports.MapToStream = MapToStream;
var FilterStream = /** @class */ (function (_super) {
    tslib_1.__extends(FilterStream, _super);
    function FilterStream(parent, fn) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
        _this.fn = fn;
        _this.parents = linkedlist_1.cons(parent);
        return _this;
    }
    FilterStream.prototype.semantic = function () {
        var _this = this;
        var s = this.parent.semantic();
        return s.filter(function (_a) {
            var value = _a.value;
            return _this.fn(value);
        });
    };
    FilterStream.prototype.push = function (a) {
        if (this.fn(a) === true) {
            this.child.push(a);
        }
    };
    return FilterStream;
}(Stream));
function apply(behavior, stream) {
    return stream.map(function (a) { return behavior.at()(a); });
}
exports.apply = apply;
/**
 * @param fn A predicate function that returns a boolean for `A`.
 * @param stream The stream to filter.
 * @returns Stream that only contains the occurrences from `stream`
 * for which `fn` returns true.
 */
function filter(predicate, s) {
    return s.filter(predicate);
}
exports.filter = filter;
function split(predicate, stream) {
    // It should be possible to implement this in a faster way where
    // `predicate` is only called once for each occurrence
    return [stream.filter(predicate), stream.filter(function (a) { return !predicate(a); })];
}
exports.split = split;
function filterApply(predicate, stream) {
    return stream.filter(function (a) { return predicate.at()(a); });
}
exports.filterApply = filterApply;
function keepWhen(stream, behavior) {
    return stream.filter(function (_) { return behavior.at(); });
}
exports.keepWhen = keepWhen;
/** For stateful streams that are always active */
var ActiveStream = /** @class */ (function (_super) {
    tslib_1.__extends(ActiveStream, _super);
    function ActiveStream() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    ActiveStream.prototype.activate = function () { };
    ActiveStream.prototype.deactivate = function () { };
    return ActiveStream;
}(Stream));
exports.ActiveStream = ActiveStream;
var EmptyStream = /** @class */ (function (_super) {
    tslib_1.__extends(EmptyStream, _super);
    function EmptyStream() {
        return _super.call(this) || this;
    }
    EmptyStream.prototype.semantic = function () {
        return [];
    };
    /* istanbul ignore next */
    EmptyStream.prototype.push = function (a) {
        throw new Error("You cannot push to an empty stream");
    };
    return EmptyStream;
}(ActiveStream));
exports.empty = new EmptyStream();
var ScanStream = /** @class */ (function (_super) {
    tslib_1.__extends(ScanStream, _super);
    function ScanStream(fn, last, parent) {
        var _this = _super.call(this) || this;
        _this.fn = fn;
        _this.last = last;
        _this.parent = parent;
        parent.addListener(_this);
        return _this;
    }
    ScanStream.prototype.semantic = function () {
        var _this = this;
        var s = this.parent.semantic();
        var acc = this.last;
        return s.map(function (_a) {
            var time = _a.time, value = _a.value;
            acc = _this.fn(value, acc);
            return { time: time, value: acc };
        });
    };
    ScanStream.prototype.push = function (a) {
        var val = this.last = this.fn(a, this.last);
        this.child.push(val);
    };
    return ScanStream;
}(ActiveStream));
/**
 * The returned  initially has the initial value, on each occurrence
 * in `source` the function is applied to the current value of the
 * behavior and the value of the occurrence, the returned value
 * becomes the next value of the behavior.
 */
function scanS(fn, startingValue, stream) {
    return stream.scanS(fn, startingValue);
}
exports.scanS = scanS;
/** @private */
var SwitchOuter = /** @class */ (function () {
    function SwitchOuter(s) {
        this.s = s;
    }
    SwitchOuter.prototype.changeStateDown = function (state) { };
    SwitchOuter.prototype.push = function (a) {
        this.s.doSwitch(a);
    };
    return SwitchOuter;
}());
var SwitchBehaviorStream = /** @class */ (function (_super) {
    tslib_1.__extends(SwitchBehaviorStream, _super);
    function SwitchBehaviorStream(b) {
        var _this = _super.call(this) || this;
        _this.b = b;
        return _this;
    }
    SwitchBehaviorStream.prototype.activate = function () {
        this.outerConsumer = new SwitchOuter(this);
        this.b.addListener(this.outerConsumer);
        this.currentSource = this.b.at();
        this.currentSource.addListener(this);
    };
    SwitchBehaviorStream.prototype.deactivate = function () {
        this.currentSource.removeListener(this);
        this.b.removeListener(this.outerConsumer);
    };
    SwitchBehaviorStream.prototype.push = function (a) {
        this.child.push(a);
    };
    SwitchBehaviorStream.prototype.doSwitch = function (newStream) {
        this.currentSource.removeListener(this);
        newStream.addListener(this);
        this.currentSource = newStream;
    };
    return SwitchBehaviorStream;
}(Stream));
function switchStream(b) {
    return new SwitchBehaviorStream(b);
}
exports.switchStream = switchStream;
var ChangesStream = /** @class */ (function (_super) {
    tslib_1.__extends(ChangesStream, _super);
    function ChangesStream(parent) {
        var _this = _super.call(this) || this;
        _this.parents = linkedlist_1.cons(parent);
        return _this;
    }
    ChangesStream.prototype.push = function (a) {
        this.child.push(a);
    };
    return ChangesStream;
}(Stream));
function changes(b) {
    return new ChangesStream(b);
}
exports.changes = changes;
var CombineStream = /** @class */ (function (_super) {
    tslib_1.__extends(CombineStream, _super);
    function CombineStream(s1, s2) {
        var _this = _super.call(this) || this;
        _this.s1 = s1;
        _this.s2 = s2;
        _this.parents = linkedlist_1.cons(s1, linkedlist_1.cons(s2));
        return _this;
    }
    CombineStream.prototype.semantic = function () {
        var result = [];
        var a = this.s1.semantic();
        var b = this.s2.semantic();
        for (var i = 0, j = 0; i < a.length || j < b.length;) {
            if (j === b.length || (i < a.length && a[i].time <= b[j].time)) {
                result.push(a[i]);
                i++;
            }
            else {
                result.push(b[j]);
                j++;
            }
        }
        return result;
    };
    CombineStream.prototype.push = function (a) {
        this.child.push(a);
    };
    return CombineStream;
}(Stream));
var ProducerStream = /** @class */ (function (_super) {
    tslib_1.__extends(ProducerStream, _super);
    function ProducerStream() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /* istanbul ignore next */
    ProducerStream.prototype.semantic = function () {
        throw new Error("A producer stream does not have a semantic representation");
    };
    ProducerStream.prototype.push = function (a) {
        this.child.push(a);
    };
    return ProducerStream;
}(Stream));
exports.ProducerStream = ProducerStream;
var ProducerStreamFromFunction = /** @class */ (function (_super) {
    tslib_1.__extends(ProducerStreamFromFunction, _super);
    function ProducerStreamFromFunction(activateFn) {
        var _this = _super.call(this) || this;
        _this.activateFn = activateFn;
        return _this;
    }
    ProducerStreamFromFunction.prototype.activate = function () {
        this.state = 0 /* Push */;
        this.deactivateFn = this.activateFn(this.push.bind(this));
    };
    ProducerStreamFromFunction.prototype.deactivate = function () {
        this.state = 3 /* Inactive */;
        this.deactivateFn();
    };
    return ProducerStreamFromFunction;
}(ProducerStream));
function producerStream(activate) {
    return new ProducerStreamFromFunction(activate);
}
exports.producerStream = producerStream;
var SinkStream = /** @class */ (function (_super) {
    tslib_1.__extends(SinkStream, _super);
    function SinkStream() {
        var _this = _super.call(this) || this;
        _this.pushing = false;
        return _this;
    }
    SinkStream.prototype.push = function (a) {
        if (this.pushing === true) {
            this.child.push(a);
        }
    };
    SinkStream.prototype.activate = function () {
        this.pushing = true;
    };
    SinkStream.prototype.deactivate = function () {
        this.pushing = false;
    };
    return SinkStream;
}(ProducerStream));
exports.SinkStream = SinkStream;
function sinkStream() {
    return new SinkStream();
}
exports.sinkStream = sinkStream;
function subscribe(fn, stream) {
    stream.subscribe(fn);
}
exports.subscribe = subscribe;
var SnapshotStream = /** @class */ (function (_super) {
    tslib_1.__extends(SnapshotStream, _super);
    function SnapshotStream(behavior, stream) {
        var _this = _super.call(this) || this;
        _this.behavior = behavior;
        _this.stream = stream;
        return _this;
    }
    SnapshotStream.prototype.push = function (a) {
        this.child.push(this.behavior.at());
    };
    SnapshotStream.prototype.activate = function () {
        this.behavior.changePullers(1);
        this.stream.addListener(this);
    };
    SnapshotStream.prototype.deactivate = function () {
        this.behavior.changePullers(-1);
        this.stream.removeListener(this);
    };
    SnapshotStream.prototype.semantic = function () {
        var b = this.behavior.semantic();
        return this.stream.semantic().map(function (_a) {
            var time = _a.time;
            return ({ time: time, value: b(time) });
        });
    };
    return SnapshotStream;
}(Stream));
function snapshot(b, s) {
    return new SnapshotStream(b, s);
}
exports.snapshot = snapshot;
var SnapshotWithStream = /** @class */ (function (_super) {
    tslib_1.__extends(SnapshotWithStream, _super);
    function SnapshotWithStream(fn, behavior, stream) {
        var _this = _super.call(this) || this;
        _this.fn = fn;
        _this.behavior = behavior;
        _this.stream = stream;
        return _this;
    }
    SnapshotWithStream.prototype.push = function (a) {
        this.child.push(this.fn(a, this.behavior.at()));
    };
    SnapshotWithStream.prototype.activate = function () {
        this.stream.addListener(this);
    };
    SnapshotWithStream.prototype.deactivate = function () {
        this.stream.removeListener(this);
    };
    return SnapshotWithStream;
}(Stream));
function snapshotWith(f, b, s) {
    return new SnapshotWithStream(f, b, s);
}
exports.snapshotWith = snapshotWith;
function combine() {
    var streams = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        streams[_i] = arguments[_i];
    }
    // FIXME: More performant implementation with benchmark
    return streams.reduce(function (s1, s2) { return s1.combine(s2); }, exports.empty);
}
exports.combine = combine;
function isStream(s) {
    return typeof s === "object" && ("scanS" in s);
}
exports.isStream = isStream;

},{"./behavior":2,"./common":3,"./linkedlist":7,"tslib":32}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var stream_1 = require("./stream");
var TestStream = /** @class */ (function (_super) {
    tslib_1.__extends(TestStream, _super);
    function TestStream(semanticStream) {
        var _this = _super.call(this) || this;
        _this.semanticStream = semanticStream;
        return _this;
    }
    TestStream.prototype.semantic = function () {
        return this.semanticStream;
    };
    /* istanbul ignore next */
    TestStream.prototype.activate = function () {
        throw new Error("You cannot activate a TestStream");
    };
    /* istanbul ignore next */
    TestStream.prototype.deactivate = function () {
        throw new Error("You cannot deactivate a TestStream");
    };
    /* istanbul ignore next */
    TestStream.prototype.push = function (a) {
        throw new Error("You cannot push to a TestStream");
    };
    return TestStream;
}(stream_1.Stream));
function testStreamFromArray(array) {
    var semanticStream = array.map(function (value, time) { return ({ value: value, time: time }); });
    return new TestStream(semanticStream);
}
exports.testStreamFromArray = testStreamFromArray;
function testStreamFromObject(object) {
    var semanticStream = Object.keys(object).map(function (key) { return ({ time: parseFloat(key), value: object[key] }); });
    return new TestStream(semanticStream);
}
exports.testStreamFromObject = testStreamFromObject;

},{"./stream":10,"tslib":32}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var linkedlist_1 = require("./linkedlist");
var stream_1 = require("./stream");
var behavior_1 = require("./behavior");
/*
 * Time related behaviors and functions
 */
var DelayStream = /** @class */ (function (_super) {
    tslib_1.__extends(DelayStream, _super);
    function DelayStream(parent, ms) {
        var _this = _super.call(this) || this;
        _this.ms = ms;
        _this.parents = linkedlist_1.cons(parent);
        return _this;
    }
    DelayStream.prototype.semantic = function () {
        var _this = this;
        var s = this.parents.value.semantic();
        return s.map(function (_a) {
            var time = _a.time, value = _a.value;
            return ({ time: time + _this.ms, value: value });
        });
    };
    DelayStream.prototype.push = function (a) {
        var _this = this;
        setTimeout(function () { return _this.child.push(a); }, this.ms);
    };
    return DelayStream;
}(stream_1.Stream));
exports.DelayStream = DelayStream;
function delay(ms, stream) {
    return new DelayStream(stream, ms);
}
exports.delay = delay;
var ThrottleStream = /** @class */ (function (_super) {
    tslib_1.__extends(ThrottleStream, _super);
    function ThrottleStream(parent, ms) {
        var _this = _super.call(this) || this;
        _this.ms = ms;
        _this.isSilenced = false;
        _this.parents = linkedlist_1.cons(parent);
        return _this;
    }
    ThrottleStream.prototype.push = function (a) {
        var _this = this;
        if (!this.isSilenced) {
            this.child.push(a);
            this.isSilenced = true;
            setTimeout(function () {
                _this.isSilenced = false;
            }, this.ms);
        }
    };
    return ThrottleStream;
}(stream_1.Stream));
function throttle(ms, stream) {
    return new ThrottleStream(stream, ms);
}
exports.throttle = throttle;
var DebounceStream = /** @class */ (function (_super) {
    tslib_1.__extends(DebounceStream, _super);
    function DebounceStream(parent, ms) {
        var _this = _super.call(this) || this;
        _this.ms = ms;
        _this.timer = undefined;
        _this.parents = linkedlist_1.cons(parent);
        return _this;
    }
    DebounceStream.prototype.push = function (a) {
        var _this = this;
        clearTimeout(this.timer);
        this.timer = setTimeout(function () {
            _this.child.push(a);
        }, this.ms);
    };
    return DebounceStream;
}(stream_1.Stream));
function debounce(ms, stream) {
    return new DebounceStream(stream, ms);
}
exports.debounce = debounce;
var TimeFromBehavior = /** @class */ (function (_super) {
    tslib_1.__extends(TimeFromBehavior, _super);
    function TimeFromBehavior() {
        var _this = _super.call(this) || this;
        _this.startTime = Date.now();
        _this.state = 1 /* Pull */;
        return _this;
    }
    TimeFromBehavior.prototype.pull = function () {
        return Date.now() - this.startTime;
    };
    return TimeFromBehavior;
}(behavior_1.Behavior));
var TimeBehavior = /** @class */ (function (_super) {
    tslib_1.__extends(TimeBehavior, _super);
    function TimeBehavior() {
        return _super.call(this, Date.now) || this;
    }
    TimeBehavior.prototype.semantic = function () {
        return function (time) { return time; };
    };
    return TimeBehavior;
}(behavior_1.FunctionBehavior));
/**
 * A behavior whose value is the number of milliseconds elapsed in
 * UNIX epoch. I.e. its current value is equal to the value got by
 * calling `Date.now`.
 */
exports.time = new TimeBehavior();
/**
 * A behavior giving access to continuous time. When sampled the outer
 * behavior gives a behavior with values that contain the difference
 * between the current sample time and the time at which the outer
 * behavior was sampled.
 */
exports.timeFrom = behavior_1.fromFunction(function () { return new TimeFromBehavior(); });
var IntegrateBehavior = /** @class */ (function (_super) {
    tslib_1.__extends(IntegrateBehavior, _super);
    function IntegrateBehavior(parent) {
        var _this = _super.call(this) || this;
        _this.parent = parent;
        _this.lastPullTime = Date.now();
        _this.state = 1 /* Pull */;
        _this.value = 0;
        return _this;
    }
    IntegrateBehavior.prototype.pull = function () {
        var currentPullTime = Date.now();
        var deltaSeconds = (currentPullTime - this.lastPullTime) / 1000;
        this.value += deltaSeconds * this.parent.at();
        this.lastPullTime = currentPullTime;
        return this.value;
    };
    return IntegrateBehavior;
}(behavior_1.Behavior));
function integrate(behavior) {
    return behavior_1.fromFunction(function () { return new IntegrateBehavior(behavior); });
}
exports.integrate = integrate;

},{"./behavior":2,"./linkedlist":7,"./stream":10,"tslib":32}],13:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var functor_1 = require("./functor");
var utils_1 = require("./utils");
var AbstractApplicative = /** @class */ (function (_super) {
    tslib_1.__extends(AbstractApplicative, _super);
    function AbstractApplicative() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AbstractApplicative.prototype.ap = function (f) {
        return this.lift(utils_1.apply, f, this);
    };
    AbstractApplicative.prototype.lift = function () {
        var f = arguments[0];
        switch (arguments.length - 1) {
            case 1:
                return arguments[1].map(f);
            case 2:
                return arguments[2].ap(arguments[1].map(utils_1.curry2(f)));
            case 3:
                return arguments[3].ap(arguments[2].ap(arguments[1].map(utils_1.curry3(f))));
        }
    };
    AbstractApplicative.prototype.map = function (f) {
        return this.ap(this.of(f));
    };
    return AbstractApplicative;
}(functor_1.AbstractFunctor));
exports.AbstractApplicative = AbstractApplicative;
function applicative(constructor) {
    var prototype = constructor.prototype;
    if (!("of" in prototype)) {
        throw new TypeError("Can't derive applicative. `of` method missing.");
    }
    if (!("ap" in prototype) && !("lift" in prototype)) {
        throw new TypeError("Can't derive applicative. Either `lift` or `ap` method must be defined.");
    }
    utils_1.mixin(constructor, [functor_1.AbstractFunctor, AbstractApplicative]);
}
exports.applicative = applicative;
function isArrayConstructor(a) {
    return a === Array;
}
function of(d, a) {
    if (isArrayConstructor(d)) {
        return [a];
    }
    else {
        return d.of(a);
    }
}
exports.of = of;
function arrayLift(f, args, indices) {
    if (args.length === indices.length) {
        var values = [];
        for (var i = 0; i < args.length; ++i) {
            values[i] = args[i][indices[i]];
        }
        return [f.apply(undefined, values)];
    }
    else {
        var results = [];
        for (var i = 0; i < args[indices.length].length; ++i) {
            results = results.concat(arrayLift(f, args, indices.concat(i)));
        }
        return results;
    }
}
function ap(fa, ba) {
    return ba.ap(fa);
}
exports.ap = ap;
// implementation
function lift(f) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    if (Array.isArray(args[0])) {
        return arrayLift(f, args, []);
    }
    else {
        return (_a = args[0]).lift.apply(_a, [f].concat(args));
    }
    var _a;
}
exports.lift = lift;
function seq(a, b) {
    return ap(functor_1.mapTo(utils_1.id, a), b);
}
exports.seq = seq;

},{"./functor":19,"./utils":30,"tslib":32}],14:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var applicative_1 = require("./applicative");
var traversable_1 = require("./traversable");
var monad_1 = require("./monad");
var Cons = /** @class */ (function () {
    function Cons(val, tail) {
        this.val = val;
        this.tail = tail;
    }
    Cons.prototype.combine = function (c) {
        return this === exports.nil ? c : cons(this.val, this.tail.combine(c));
    };
    Cons.prototype.identity = function () {
        return exports.nil;
    };
    Cons.prototype.of = function (b) {
        return cons(b, exports.nil);
    };
    Cons.prototype.chain = function (f) {
        return this === exports.nil ? exports.nil : f(this.val).combine(this.tail.chain(f));
    };
    Cons.prototype.traverse = function (a, f) {
        return this === exports.nil
            ? a.of(exports.nil)
            : applicative_1.lift(cons, f(this.val), this.tail.traverse(a, f));
    };
    Cons = tslib_1.__decorate([
        monad_1.monad,
        traversable_1.traversable
    ], Cons);
    return Cons;
}());
exports.Cons = Cons;
exports.nil = new Cons(undefined, undefined);
function cons(a, as) {
    return new Cons(a, as);
}
exports.cons = cons;
function fromArray(as) {
    return as.length === 0 ? exports.nil : cons(as[0], fromArray(as.slice(1)));
}
exports.fromArray = fromArray;

},{"./applicative":13,"./monad":25,"./traversable":29,"tslib":32}],15:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var applicative_1 = require("./applicative");
var endo_1 = require("./monoids/endo");
var ConstEndo = /** @class */ (function (_super) {
    tslib_1.__extends(ConstEndo, _super);
    function ConstEndo(m) {
        var _this = _super.call(this) || this;
        _this.m = m;
        return _this;
    }
    ConstEndo.prototype.map = function (f) {
        return this;
    };
    ConstEndo.of = function (b) {
        return new ConstEndo(endo_1.default.identity());
    };
    ConstEndo.prototype.of = function (b) {
        return new ConstEndo(endo_1.default.identity());
    };
    ConstEndo.prototype.ap = function (a) {
        return new ConstEndo(a.m.combine(this.m));
    };
    ConstEndo.prototype.get = function () {
        return this.m;
    };
    return ConstEndo;
}(applicative_1.AbstractApplicative));
exports.ConstEndo = ConstEndo;

},{"./applicative":13,"./monoids/endo":27,"tslib":32}],16:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var EitherTag;
(function (EitherTag) {
    EitherTag[EitherTag["Left"] = 0] = "Left";
    EitherTag[EitherTag["Right"] = 1] = "Right";
})(EitherTag = exports.EitherTag || (exports.EitherTag = {}));
var Either = /** @class */ (function () {
    function Either() {
    }
    Either.of = function (b) {
        return new Right(b);
    };
    Either.prototype.of = function (b) {
        return new Right(b);
    };
    Either.prototype.ap = function (a) {
        if (a.tag === EitherTag.Left) {
            return a;
        }
        else {
            return this.map(a.val);
        }
    };
    Either.prototype.lift = function (f) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        for (var i = 0; i < args.length; i++) {
            if (args[i].tag === EitherTag.Left) {
                return args[i];
            }
        }
        var rights = [];
        for (var i = 0; i < args.length; i++) {
            rights.push(args[i].val);
        }
        return new Right(f.apply(void 0, rights));
    };
    return Either;
}());
exports.Either = Either;
var Left = /** @class */ (function (_super) {
    tslib_1.__extends(Left, _super);
    function Left(a) {
        var _this = _super.call(this) || this;
        _this.tag = EitherTag.Left;
        _this.val = a;
        return _this;
    }
    Left.prototype.match = function (m) {
        return m.left(this.val);
    };
    Left.prototype.map = function (f) {
        // return this as Left<A, C>;
        return new Left(this.val);
    };
    Left.prototype.mapTo = function (c) {
        return new Left(this.val);
    };
    return Left;
}(Either));
exports.Left = Left;
var Right = /** @class */ (function (_super) {
    tslib_1.__extends(Right, _super);
    function Right(b) {
        var _this = _super.call(this) || this;
        _this.tag = EitherTag.Right;
        _this.val = b;
        return _this;
    }
    Right.prototype.match = function (m) {
        return m.right(this.val);
    };
    Right.prototype.map = function (f) {
        // return this as Left<A, C>;
        return new Right(f(this.val));
    };
    Right.prototype.mapTo = function (c) {
        return new Right(c);
    };
    return Right;
}(Either));
exports.Right = Right;
function left(a) {
    return new Left(a);
}
exports.left = left;
function right(b) {
    return new Right(b);
}
exports.right = right;
function isLeft(a) {
    return a.tag === EitherTag.Left;
}
exports.isLeft = isLeft;
function isRight(a) {
    return a.tag === EitherTag.Right;
}
exports.isRight = isRight;
function fromEither(e) {
    return e.val;
}
exports.fromEither = fromEither;

},{"tslib":32}],17:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var applicative_1 = require("./applicative");
var maybe_1 = require("./maybe");
var either_1 = require("./either");
var utils_1 = require("./utils");
function incr(_, acc) {
    return acc + 1;
}
var AbstractFoldable = /** @class */ (function () {
    function AbstractFoldable() {
    }
    AbstractFoldable.prototype.foldl = function (f, init) {
        return this.foldr(function (a, r) { return function (acc) { return r(f(acc, a)); }; }, utils_1.id)(init);
    };
    AbstractFoldable.prototype.shortFoldr = function (f, acc) {
        return either_1.fromEither(this.foldr(function (a, eb) { return (either_1.isRight(eb) ? f(a, either_1.fromEither(eb)) : eb); }, either_1.right(acc)));
    };
    AbstractFoldable.prototype.shortFoldl = function (f, acc) {
        return either_1.fromEither(this.foldl(function (eb, a) { return (either_1.isRight(eb) ? f(either_1.fromEither(eb), a) : eb); }, either_1.right(acc)));
    };
    AbstractFoldable.prototype.size = function () {
        return this.foldr(incr, 0);
    };
    AbstractFoldable.prototype.maximum = function () {
        return this.foldr(Math.max, -Infinity);
    };
    AbstractFoldable.prototype.minimum = function () {
        return this.foldr(Math.min, Infinity);
    };
    AbstractFoldable.prototype.sum = function () {
        return this.foldr(utils_1.add, 0);
    };
    return AbstractFoldable;
}());
exports.AbstractFoldable = AbstractFoldable;
function foldable(constructor) {
    var p = constructor.prototype;
    if (!("foldr" in p)) {
        throw new TypeError("Can't derive foldable. `foldr` method missing.");
    }
    utils_1.mixin(constructor, [AbstractFoldable]);
}
exports.foldable = foldable;
function foldMap(f, a) {
    return foldr(function (a, b) { return f.create(a).combine(b); }, f.identity(), a);
}
exports.foldMap = foldMap;
function foldr(f, init, a) {
    if (a instanceof Array) {
        for (var i = a.length - 1; 0 <= i; --i) {
            init = f(a[i], init);
        }
        return init;
    }
    else {
        return a.foldr(f, init);
    }
}
exports.foldr = foldr;
function foldl(f, init, a) {
    if (a instanceof Array) {
        for (var i = 0; i < a.length; ++i) {
            init = f(init, a[i]);
        }
        return init;
    }
    else {
        return a.foldl(f, init);
    }
}
exports.foldl = foldl;
function size(a) {
    if (a instanceof Array) {
        return a.length;
    }
    else {
        return a.size();
    }
}
exports.size = size;
function isEmpty(a) {
    if (a instanceof Array) {
        return a.length === 0;
    }
    else {
        return a.shortFoldl(function (_, a) { return either_1.left(false); }, true);
    }
}
exports.isEmpty = isEmpty;
function take(n, t) {
    var list = [];
    if (n === 0) {
        return list;
    }
    else {
        return t.shortFoldl(function (list, a) {
            list.push(a);
            return (list.length === n ? either_1.left : either_1.right)(list);
        }, list);
    }
}
exports.take = take;
function find(f, t) {
    return t.shortFoldl(function (acc, a) { return (f(a) ? either_1.left(maybe_1.just(a)) : either_1.right(acc)); }, maybe_1.nothing);
}
exports.find = find;
function findLast(f, t) {
    return t.shortFoldr(function (a, acc) { return (f(a) ? either_1.left(maybe_1.just(a)) : either_1.right(acc)); }, maybe_1.nothing);
}
exports.findLast = findLast;
function findIndex(f, t) {
    var idx = t.shortFoldl(function (idx, a) { return (f(a) ? either_1.left(-idx) : either_1.right(idx - 1)); }, 0);
    return idx >= 0 ? maybe_1.just(idx) : maybe_1.nothing;
}
exports.findIndex = findIndex;
function findLastIndex(f, t) {
    var idx = t.shortFoldr(function (a, idx) { return (f(a) ? either_1.left(-idx) : either_1.right(idx - 1)); }, -1);
    return idx >= 0 ? maybe_1.just(t.size() - idx) : maybe_1.nothing;
}
exports.findLastIndex = findLastIndex;
function shortFoldl(f, acc, l) {
    return l.shortFoldl(f, acc);
}
exports.shortFoldl = shortFoldl;
function all(pred, foldable) {
    return shortFoldl(function (_, val) { return (pred(val) === true ? either_1.right(true) : either_1.left(false)); }, true, foldable);
}
exports.all = all;
function any(pred, foldable) {
    return shortFoldl(function (_, val) { return (pred(val) === true ? either_1.left(true) : either_1.right(false)); }, false, foldable);
}
exports.any = any;
function toArray(t) {
    if (Array.isArray(t)) {
        return t;
    }
    else {
        return t.foldl(utils_1.impurePush, []);
    }
}
exports.toArray = toArray;
function sequence_(d, t) {
    return foldr(applicative_1.seq, applicative_1.of(d, undefined), t);
}
exports.sequence_ = sequence_;
function foldrM(f, mb, t) {
    return foldr(function (a, mb) { return mb.chain(function (b) { return f(a, b); }); }, mb, t);
}
exports.foldrM = foldrM;
function maximum(t) {
    return t.maximum();
}
exports.maximum = maximum;
function minimum(t) {
    return t.minimum();
}
exports.minimum = minimum;
function sum(t) {
    return t.sum();
}
exports.sum = sum;

},{"./applicative":13,"./either":16,"./maybe":24,"./utils":30}],18:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var monad_1 = require("./monad");
var Freer = /** @class */ (function (_super) {
    tslib_1.__extends(Freer, _super);
    function Freer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    Freer.of = function (b) {
        return new Pure(b);
    };
    Freer.prototype.of = function (b) {
        return new Pure(b);
    };
    Freer.multi = false;
    return Freer;
}(monad_1.AbstractMonad));
exports.Freer = Freer;
var Pure = /** @class */ (function (_super) {
    tslib_1.__extends(Pure, _super);
    function Pure(a) {
        var _this = _super.call(this) || this;
        _this.a = a;
        return _this;
    }
    Pure_1 = Pure;
    Pure.prototype.match = function (m) {
        return m.pure(this.a);
    };
    Pure.prototype.map = function (f) {
        return new Pure_1(f(this.a));
    };
    Pure.prototype.chain = function (f) {
        return f(this.a);
    };
    Pure = Pure_1 = tslib_1.__decorate([
        monad_1.monad
    ], Pure);
    return Pure;
    var Pure_1;
}(Freer));
exports.Pure = Pure;
function pure(a) {
    return new Pure(a);
}
var Bind = /** @class */ (function (_super) {
    tslib_1.__extends(Bind, _super);
    function Bind(val, f) {
        var _this = _super.call(this) || this;
        _this.val = val;
        _this.f = f;
        return _this;
    }
    Bind_1 = Bind;
    Bind.prototype.match = function (m) {
        return m.bind(this.val, this.f);
    };
    Bind.prototype.map = function (f) {
        var _this = this;
        return new Bind_1(this.val, function (a) { return _this.f(a).map(f); });
    };
    Bind.prototype.chain = function (f) {
        var _this = this;
        return new Bind_1(this.val, function (a) { return _this.f(a).chain(f); });
    };
    Bind = Bind_1 = tslib_1.__decorate([
        monad_1.monad
    ], Bind);
    return Bind;
    var Bind_1;
}(Freer));
exports.Bind = Bind;
function liftF(fa) {
    return new Bind(fa, pure);
}
exports.liftF = liftF;

},{"./monad":25,"tslib":32}],19:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
function arrayMap(f, as) {
    var newArr = [];
    for (var _i = 0, as_1 = as; _i < as_1.length; _i++) {
        var a = as_1[_i];
        newArr.push(f(a));
    }
    return newArr;
}
function repeat(a, length) {
    var newArr = [];
    for (var i = 0; i < length; ++i) {
        newArr.push(a);
    }
    return newArr;
}
var AbstractFunctor = /** @class */ (function () {
    function AbstractFunctor() {
    }
    AbstractFunctor.prototype.mapTo = function (b) {
        return this.map(function (_) { return b; });
    };
    return AbstractFunctor;
}());
exports.AbstractFunctor = AbstractFunctor;
function functor(constructor) {
    if (!("map" in constructor.prototype)) {
        throw new TypeError("Can't derive functor. `map` method missing.");
    }
    utils_1.mixin(constructor, [AbstractFunctor]);
}
exports.functor = functor;
function map(f, functor) {
    if (Array.isArray(functor)) {
        return arrayMap(f, functor);
    }
    else {
        return functor.map(f);
    }
}
exports.map = map;
function mapTo(b, functor) {
    if (Array.isArray(functor)) {
        return repeat(b, functor.length);
    }
    else {
        return functor.mapTo(b);
    }
}
exports.mapTo = mapTo;
function mapMap(f, functor) {
    return map(function (fa) { return map(f, fa); }, functor);
}
exports.mapMap = mapMap;

},{"./utils":30}],20:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var monad_1 = require("./monad");
var Identity = /** @class */ (function () {
    function Identity(val) {
        this.val = val;
        this.multi = false;
    }
    Identity_1 = Identity;
    Identity.of = function (a) {
        return new Identity_1(a);
    };
    Identity.prototype.of = function (a) {
        return new Identity_1(a);
    };
    Identity.prototype.ap = function (f) {
        return new Identity_1(f.val(this.val));
    };
    Identity.prototype.extract = function () {
        return this.val;
    };
    Identity.prototype.map = function (f) {
        return new Identity_1(f(this.val));
    };
    Identity.prototype.mapTo = function (b) {
        return this.of(b);
    };
    Identity.prototype.flatten = function () {
        return this.val;
    };
    Identity.prototype.chain = function (f) {
        return f(this.val);
    };
    Identity.multi = false;
    Identity = Identity_1 = tslib_1.__decorate([
        monad_1.monad
    ], Identity);
    return Identity;
    var Identity_1;
}());
exports.default = Identity;

},{"./monad":25,"tslib":32}],21:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
tslib_1.__exportStar(require("./semigroup"), exports);
tslib_1.__exportStar(require("./monoid"), exports);
tslib_1.__exportStar(require("./functor"), exports);
tslib_1.__exportStar(require("./applicative"), exports);
tslib_1.__exportStar(require("./monad"), exports);
// Note: Maybe must be exported before foldable so that circular
// dependencies between foldable and maybe are resolved correctly
tslib_1.__exportStar(require("./maybe"), exports);
tslib_1.__exportStar(require("./foldable"), exports);
tslib_1.__exportStar(require("./traversable"), exports);
tslib_1.__exportStar(require("./either"), exports);
tslib_1.__exportStar(require("./conslist"), exports);
tslib_1.__exportStar(require("./infinitelist"), exports);
tslib_1.__exportStar(require("./io"), exports);
tslib_1.__exportStar(require("./writer"), exports);

},{"./applicative":13,"./conslist":14,"./either":16,"./foldable":17,"./functor":19,"./infinitelist":22,"./io":23,"./maybe":24,"./monad":25,"./monoid":26,"./semigroup":28,"./traversable":29,"./writer":31,"tslib":32}],22:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var either_1 = require("./either");
var InfiniteList = /** @class */ (function () {
    function InfiniteList(fn) {
        this.fn = fn;
    }
    InfiniteList.prototype.map = function (f) {
        return new InfiniteList(utils_1.compose(f, this.fn));
    };
    InfiniteList.prototype.mapTo = function (b) {
        return repeat(b);
    };
    InfiniteList.prototype.of = function (b) {
        return repeat(b);
    };
    InfiniteList.prototype.ap = function (a) {
        var _this = this;
        return new InfiniteList(function (i) { return a.fn(i)(_this.fn(i)); });
    };
    InfiniteList.prototype.lift = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return new InfiniteList(function (i) {
            var vals = [];
            for (var j = 1; j < args.length; ++j) {
                vals[j - 1] = args[j].fn(i);
            }
            return args[0].apply(undefined, vals);
        });
    };
    InfiniteList.prototype.foldr = function (f, init) {
        throw new Error("Cannot perform strict foldr on infinite list");
    };
    InfiniteList.prototype.foldl = function (f, init) {
        throw new Error("Cannot perform strict foldl on infinite list");
    };
    InfiniteList.prototype.shortFoldr = function (f, init) {
        throw new Error("Cannot call shortFoldr on infinite list");
    };
    InfiniteList.prototype.shortFoldl = function (f, init) {
        var acc = either_1.right(init);
        var idx = 0;
        while (either_1.isRight(acc)) {
            acc = f(either_1.fromEither(acc), this.fn(idx));
            idx++;
        }
        return either_1.fromEither(acc);
    };
    InfiniteList.prototype.size = function () {
        return Infinity;
    };
    InfiniteList.prototype.maximum = function () {
        return Infinity;
    };
    InfiniteList.prototype.minimum = function () {
        return 0;
    };
    InfiniteList.prototype.sum = function () {
        return Infinity;
    };
    return InfiniteList;
}());
exports.InfiniteList = InfiniteList;
function repeat(a) {
    return new InfiniteList(function (_) { return a; });
}
exports.repeat = repeat;
exports.naturals = new InfiniteList(utils_1.id);

},{"./either":16,"./utils":30}],23:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var freer_1 = require("./freer");
var utils_1 = require("./utils");
var Call = /** @class */ (function () {
    function Call(fn, args) {
        this.fn = fn;
        this.args = args;
        this.type = "call";
    }
    return Call;
}());
exports.Call = Call;
var CallP = /** @class */ (function () {
    function CallP(fn, args) {
        this.fn = fn;
        this.args = args;
        this.type = "callP";
    }
    return CallP;
}());
exports.CallP = CallP;
var ThrowE = /** @class */ (function () {
    function ThrowE(error) {
        this.error = error;
        this.type = "throwE";
    }
    return ThrowE;
}());
exports.ThrowE = ThrowE;
var CatchE = /** @class */ (function () {
    function CatchE(handler, io) {
        this.handler = handler;
        this.io = io;
        this.type = "catchE";
    }
    return CatchE;
}());
exports.CatchE = CatchE;
exports.IO = freer_1.Freer;
function withEffects(fn) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return freer_1.liftF(new Call(fn, args));
    };
}
exports.withEffects = withEffects;
function withEffectsP(fn) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return freer_1.liftF(new CallP(fn, args));
    };
}
exports.withEffectsP = withEffectsP;
function call(fn) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return freer_1.liftF(new Call(fn, args));
}
exports.call = call;
function callP(fn) {
    var args = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args[_i - 1] = arguments[_i];
    }
    return freer_1.liftF(new CallP(fn, args));
}
exports.callP = callP;
function throwE(error) {
    return freer_1.liftF(new ThrowE(error));
}
exports.throwE = throwE;
function catchE(errorHandler, io) {
    return freer_1.liftF(new CatchE(errorHandler, io));
}
exports.catchE = catchE;
function doRunIO(e) {
    return e.match({
        pure: function (a) { return Promise.resolve(a); },
        bind: function (io, cont) {
            switch (io.type) {
                case "call":
                    return runIO(cont(io.fn.apply(io, io.args)));
                case "callP":
                    return io.fn.apply(io, io.args).then(function (a) { return runIO(cont(a)); });
                case "catchE":
                    return doRunIO(io.io)
                        .then(function (a) { return runIO(cont(a)); })
                        .catch(function (err) { return doRunIO(io.handler(err)); });
                case "throwE":
                    return Promise.reject(io.error);
            }
        }
    });
}
exports.doRunIO = doRunIO;
function runIO(e) {
    return doRunIO(e);
}
exports.runIO = runIO;
function doTestIO(e, arr, ending, idx) {
    e.match({
        pure: function (a2) {
            if (ending !== a2) {
                throw new Error("Pure value invalid, expected " + ending + " but saw " + a2);
            }
        },
        bind: function (io, cont) {
            var _a = arr[idx], io2 = _a[0].val, a = _a[1];
            if (!utils_1.deepEqual(io, io2)) {
                throw new Error("Value invalid, expected " + io2 + " but saw " + io);
            }
            else {
                doTestIO(cont(a), arr, ending, idx + 1);
            }
        }
    });
}
function testIO(e, arr, a) {
    doTestIO(e, arr, a, 0);
}
exports.testIO = testIO;

},{"./freer":18,"./utils":30}],24:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var foldable_1 = require("./foldable");
var utils_1 = require("./utils");
var Maybe = /** @class */ (function () {
    function Maybe() {
        this.multi = false;
    }
    Maybe.prototype.of = function (v) {
        return just(v);
    };
    Maybe.of = function (v) {
        return just(v);
    };
    Maybe.is = function (a) {
        return typeof a === "object" && a.isMaybe === true;
    };
    Maybe.prototype.flatten = function () {
        return this.match({
            nothing: function () { return exports.nothing; },
            just: utils_1.id
        });
    };
    Maybe.prototype.lift = function () {
        var f = arguments[0];
        for (var i = 1; i < arguments.length; ++i) {
            if (isNothing(arguments[i])) {
                return exports.nothing;
            }
        }
        switch (arguments.length - 1) {
            case 1:
                return just(f(arguments[1].val));
            case 2:
                return just(f(arguments[1].val, arguments[2].val));
            case 3:
                return just(f(arguments[1].val, arguments[2].val, arguments[3].val));
        }
    };
    Maybe.prototype.sequence = function (a, m) {
        return m.match({
            nothing: function () { return a.of(exports.nothing); },
            just: function (v) { return v.map(just); }
        });
    };
    Maybe.multi = false;
    return Maybe;
}());
exports.Maybe = Maybe;
var Nothing = /** @class */ (function (_super) {
    tslib_1.__extends(Nothing, _super);
    function Nothing() {
        var _this = _super.call(this) || this;
        _this.isMaybe = true;
        return _this;
    }
    Nothing.prototype.match = function (m) {
        return m.nothing();
    };
    Nothing.prototype.chain = function (f) {
        return exports.nothing;
    };
    Nothing.prototype.map = function (f) {
        return exports.nothing;
    };
    Nothing.prototype.mapTo = function (b) {
        return exports.nothing;
    };
    Nothing.prototype.ap = function (a) {
        return exports.nothing;
    };
    Nothing.prototype.foldr = function (f, init) {
        return init;
    };
    Nothing.prototype.foldl = function (f, init) {
        return init;
    };
    Nothing.prototype.size = function () {
        return 0;
    };
    Nothing.prototype.traverse = function (a, f) {
        return a.of(exports.nothing);
    };
    Nothing = tslib_1.__decorate([
        foldable_1.foldable
    ], Nothing);
    return Nothing;
}(Maybe));
var Just = /** @class */ (function (_super) {
    tslib_1.__extends(Just, _super);
    function Just(val) {
        var _this = _super.call(this) || this;
        _this.isMaybe = true;
        _this.val = val;
        return _this;
    }
    Just_1 = Just;
    Just.prototype.match = function (m) {
        return m.just(this.val);
    };
    Just.prototype.chain = function (f) {
        return f(this.val);
    };
    Just.prototype.map = function (f) {
        return new Just_1(f(this.val));
    };
    Just.prototype.mapTo = function (b) {
        return new Just_1(b);
    };
    Just.prototype.ap = function (m) {
        var _this = this;
        return m.match({
            nothing: function () { return exports.nothing; },
            just: function (f) { return new Just_1(f(_this.val)); }
        });
    };
    Just.prototype.foldr = function (f, init) {
        return f(this.val, init);
    };
    Just.prototype.foldl = function (f, init) {
        return f(init, this.val);
    };
    Just.prototype.size = function () {
        return 1;
    };
    Just.prototype.traverse = function (a, f) {
        return f(this.val).map(just);
    };
    Just = Just_1 = tslib_1.__decorate([
        foldable_1.foldable
    ], Just);
    return Just;
    var Just_1;
}(Maybe));
function just(v) {
    return new Just(v);
}
exports.just = just;
exports.nothing = new Nothing();
function isNothing(m) {
    return m === exports.nothing;
}
exports.isNothing = isNothing;
function isJust(m) {
    return m !== exports.nothing;
}
exports.isJust = isJust;
function fromMaybe(a, m) {
    return m === exports.nothing ? a : m.val;
}
exports.fromMaybe = fromMaybe;
function maybe(b, f, m) {
    return m === exports.nothing ? b : f(m.val);
}
exports.maybe = maybe;

},{"./foldable":17,"./utils":30,"tslib":32}],25:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
var AbstractMonad = /** @class */ (function () {
    function AbstractMonad() {
    }
    AbstractMonad.prototype.chain = function (f) {
        return this.map(f).flatten();
    };
    AbstractMonad.prototype.flatten = function () {
        return this.chain(utils_1.id);
    };
    AbstractMonad.prototype.map = function (f) {
        var _this = this;
        return this.chain(function (a) { return _this.of(f(a)); });
    };
    AbstractMonad.prototype.mapTo = function (b) {
        var _this = this;
        return this.chain(function (_) { return _this.of(b); });
    };
    AbstractMonad.prototype.ap = function (m) {
        var _this = this;
        return m.chain(function (f) { return _this.chain(function (a) { return _this.of(f(a)); }); });
    };
    AbstractMonad.prototype.lift = function (f) {
        var ms = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            ms[_i - 1] = arguments[_i];
        }
        var of = ms[0].of;
        switch (f.length) {
            case 1:
                return ms[0].map(f);
            case 2:
                return ms[0].chain(function (a) { return ms[1].chain(function (b) { return of(f(a, b)); }); });
            case 3:
                return ms[0].chain(function (a) {
                    return ms[1].chain(function (b) { return ms[2].chain(function (c) { return of(f(a, b, c)); }); });
                });
        }
    };
    return AbstractMonad;
}());
exports.AbstractMonad = AbstractMonad;
function monad(constructor) {
    var p = constructor.prototype;
    if (!("of" in p)) {
        throw new TypeError("Can't derive monad. `of` method missing.");
    }
    if (!("chain" in p) && !("flatten" in p && "map" in p)) {
        throw new TypeError("Can't derive monad. Either `chain` or `flatten` and `map` method must be defined.");
    }
    if (!("multi" in p)) {
        p.multi = false;
    }
    if (!("multi" in constructor)) {
        constructor.multi = false;
    }
    utils_1.mixin(constructor, [AbstractMonad]);
}
exports.monad = monad;
function flatten(m) {
    if (Array.isArray(m)) {
        return utils_1.arrayFlatten(m);
    }
    else {
        return m.flatten();
    }
}
exports.flatten = flatten;
function arrayChain(f, m) {
    var result = [];
    for (var i = 0; i < m.length; ++i) {
        var added = f(m[i]);
        for (var j = 0; j < added.length; ++j) {
            result.push(added[j]);
        }
    }
    return result;
}
function chain(f, m) {
    if (Array.isArray(m)) {
        return arrayChain(f, m);
    }
    else {
        return m.chain(f);
    }
}
exports.chain = chain;
function reportErrorInGenerator(value) {
    throw new Error("An incorrect value was yielded inside a generator function: " +
        value.toString());
}
function singleGo(doing, m, check) {
    function doRec(v) {
        var result = doing.next(v);
        if (result.done === true) {
            return m.of(result.value);
        }
        else if (check(result.value) === true) {
            return result.value.chain(doRec);
        }
        else {
            reportErrorInGenerator(result.value);
        }
    }
    return m.chain(doRec);
}
function multiGo(gen, m, check, args) {
    var doRec = function (v, stateSoFar) {
        var doing = gen.apply(void 0, args);
        for (var _i = 0, stateSoFar_1 = stateSoFar; _i < stateSoFar_1.length; _i++) {
            var it_1 = stateSoFar_1[_i];
            doing.next(it_1);
        }
        var result = doing.next(v);
        if (result.done === true) {
            return m.of(result.value);
        }
        else if (check(result.value) === true) {
            var newStateSoFar_1 = stateSoFar.concat(v);
            return result.value.chain(function (vv) { return doRec(vv, newStateSoFar_1); });
        }
        else {
            reportErrorInGenerator(result.value);
        }
    };
    return m.chain(function (vv) { return doRec(vv, [undefined]); });
}
function hasChain(value) {
    return value.chain !== undefined;
}
function beginGo(gen, monad, args) {
    if (args === void 0) { args = []; }
    var iterator = gen.apply(void 0, args);
    var _a = iterator.next(), done = _a.done, value = _a.value;
    if (done === true) {
        if (monad !== undefined) {
            return monad.of(value);
        }
        else {
            throw new Error("The generator function never yielded a monad and no monad was specified.");
        }
    }
    var check = monad !== undefined && monad.is ? monad.is : hasChain;
    if (!check(value)) {
        reportErrorInGenerator(value);
    }
    if (value.multi === true) {
        return multiGo(gen, value, check, args);
    }
    else {
        return singleGo(iterator, value, check);
    }
}
exports.beginGo = beginGo;
function go(gen, monad) {
    return beginGo(gen, monad, []);
}
exports.go = go;
function fgo(gen, monad) {
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return beginGo(gen, monad, args);
    };
}
exports.fgo = fgo;

},{"./utils":30}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var semigroup_1 = require("./semigroup");
exports.combine = semigroup_1.combine;
function identity(m) {
    if (m === Array) {
        return [];
    }
    else if (m === String) {
        return "";
    }
    else {
        return m.identity();
    }
}
exports.identity = identity;

},{"./semigroup":28}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("../utils");
var Endo = /** @class */ (function () {
    function Endo(fn) {
        this.fn = fn;
    }
    Endo.identity = function () {
        return endoId;
    };
    Endo.prototype.identity = function () {
        return endoId;
    };
    Endo.prototype.combine = function (e) {
        return new Endo(utils_1.compose(this.fn, e.fn));
    };
    Endo.create = function (f) {
        return new Endo(f);
    };
    Endo.toFunction = function (e) {
        return e.fn;
    };
    return Endo;
}());
exports.default = Endo;
var endoId = new Endo(function (x) { return x; });

},{"../utils":30}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils_1 = require("./utils");
function combineTwo(a, b) {
    return a.combine(b);
}
function combine() {
    var a = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        a[_i] = arguments[_i];
    }
    if (Array.isArray(a[0])) {
        return utils_1.arrayFlatten(a);
    }
    else if (typeof a[0] === "string") {
        return a.join("");
    }
    else {
        return utils_1.foldlArray1(combineTwo, a);
    }
}
exports.combine = combine;

},{"./utils":30}],29:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var foldable_1 = require("./foldable");
var applicative_1 = require("./applicative");
var identity_1 = require("./identity");
var endo_1 = require("./monoids/endo");
var const_1 = require("./const");
var utils_1 = require("./utils");
var AbstractTraversable = /** @class */ (function (_super) {
    tslib_1.__extends(AbstractTraversable, _super);
    function AbstractTraversable() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AbstractTraversable.prototype.map = function (f) {
        return this.traverse(identity_1.default, function (a) {
            return identity_1.default.of(f(a));
        }).extract();
    };
    AbstractTraversable.prototype.mapTo = function (b) {
        return this.map(function (_) { return b; });
    };
    AbstractTraversable.prototype.traverse = function (a, f) {
        return this.sequence(a, this.map(f));
    };
    AbstractTraversable.prototype.sequence = function (a, t) {
        return t.traverse(a, utils_1.id);
    };
    AbstractTraversable.prototype.foldr = function (f, acc) {
        var f2 = function (a) { return new const_1.ConstEndo(new endo_1.default(function (b) { return f(a, b); })); };
        return endo_1.default.toFunction(this.traverse(const_1.ConstEndo, f2).get())(acc);
    };
    return AbstractTraversable;
}(foldable_1.AbstractFoldable));
exports.AbstractTraversable = AbstractTraversable;
function traversable(constructor) {
    var p = constructor.prototype;
    if (!("map" in p && "sequence" in p) && !("traverse" in p)) {
        throw new TypeError("Can't derive traversable. Either `traverse` or `map` and `sequence` must be defined.");
    }
    utils_1.mixin(constructor, [AbstractTraversable, foldable_1.AbstractFoldable]);
}
exports.traversable = traversable;
function arraySequence(a, t) {
    var result = a.of([]);
    var lift = result.lift;
    for (var i = t.length - 1; i >= 0; --i) {
        result = lift(utils_1.cons, t[i], result);
    }
    return result;
}
function arrayTraverse(a, f, t) {
    var result = a.of([]);
    var lift = result.lift;
    for (var i = t.length - 1; i >= 0; --i) {
        result = lift(utils_1.cons, f(t[i]), result);
    }
    return result;
}
function sequence(a, t) {
    if (t instanceof Array) {
        return arraySequence(a, t);
    }
    else {
        return t.sequence(a, t);
    }
}
exports.sequence = sequence;
function traverse(a, f, t) {
    if (t instanceof Array) {
        return arrayTraverse(a, f, t);
    }
    else {
        return t.traverse(a, f);
    }
}
exports.traverse = traverse;
var AnApplicative = /** @class */ (function (_super) {
    tslib_1.__extends(AnApplicative, _super);
    function AnApplicative(f) {
        var _this = _super.call(this) || this;
        _this.f = f;
        return _this;
    }
    AnApplicative.prototype.of = function (b) {
        return new AnApplicative(function (a) { return [a, b]; });
    };
    AnApplicative.of = function (b) {
        return new AnApplicative(function (a) { return [a, b]; });
    };
    AnApplicative.prototype.ap = function (fa) {
        var _this = this;
        return new AnApplicative(function (a) {
            var _a = _this.f(a), a1 = _a[0], b = _a[1];
            var _b = fa.f(a1), a2 = _b[0], f = _b[1];
            return [a2, f(b)];
        });
    };
    AnApplicative.prototype.run = function (a) {
        return this.f(a);
    };
    return AnApplicative;
}(applicative_1.AbstractApplicative));
function mapAccumR(f, init, t) {
    return t.traverse(AnApplicative, function (a) { return new AnApplicative(function (c) { return f(c, a); }); }).run(init);
}
exports.mapAccumR = mapAccumR;

},{"./applicative":13,"./const":15,"./foldable":17,"./identity":20,"./monoids/endo":27,"./utils":30,"tslib":32}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function id(a) {
    return a;
}
exports.id = id;
function apply(f, a) {
    return f(a);
}
exports.apply = apply;
function mixin(derivedCtor, baseCtors) {
    baseCtors.forEach(function (baseCtor) {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(function (name) {
            if (!(name in derivedCtor) && !(name in derivedCtor.prototype)) {
                derivedCtor.prototype[name] = baseCtor.prototype[name];
            }
        });
    });
}
exports.mixin = mixin;
function add(n, m) {
    return n + m;
}
exports.add = add;
function compose(f, g) {
    return function (a) { return f(g(a)); };
}
exports.compose = compose;
function impurePush(arr, a) {
    arr.push(a);
    return arr;
}
exports.impurePush = impurePush;
function cons(a, as) {
    return [a].concat(as);
}
exports.cons = cons;
function curry3(f) {
    return function (a) { return function (b) { return function (c) { return f(a, b, c); }; }; };
}
exports.curry3 = curry3;
function curry2(f) {
    return function (a) { return function (b) { return f(a, b); }; };
}
exports.curry2 = curry2;
function flip(f) {
    return function (b, a) { return f(a, b); };
}
exports.flip = flip;
function foldlArray(f, init, a) {
    for (var i = 0; i < a.length; ++i) {
        init = f(init, a[i]);
    }
    return init;
}
exports.foldlArray = foldlArray;
function foldlArray1(f, a) {
    var init = a[0];
    for (var i = 1; i < a.length; ++i) {
        init = f(init, a[i]);
    }
    return init;
}
exports.foldlArray1 = foldlArray1;
function arrayFlatten(m) {
    var result = [];
    for (var i = 0; i < m.length; ++i) {
        for (var j = 0; j < m[i].length; ++j) {
            result.push(m[i][j]);
        }
    }
    return result;
}
exports.arrayFlatten = arrayFlatten;
function deepEqual(a, b) {
    if (typeof a === "object" && typeof b === "object") {
        var aKeys = Object.keys(a);
        for (var _i = 0, aKeys_1 = aKeys; _i < aKeys_1.length; _i++) {
            var key = aKeys_1[_i];
            if (!deepEqual(a[key], b[key])) {
                return false;
            }
        }
        return true;
    }
    else {
        return a === b;
    }
}
exports.deepEqual = deepEqual;

},{}],31:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var monoid_1 = require("./monoid");
var monad_1 = require("./monad");
var Writer = /** @class */ (function (_super) {
    tslib_1.__extends(Writer, _super);
    function Writer(identity, state, value) {
        var _this = _super.call(this) || this;
        _this.identity = identity;
        _this.state = state;
        _this.value = value;
        _this.multi = false;
        return _this;
    }
    Writer.prototype.of = function (value) {
        return new Writer(this.identity, this.identity, value);
    };
    Writer.prototype.chain = function (f) {
        var _a = f(this.value), state = _a.state, value = _a.value;
        return new Writer(this.identity, monoid_1.combine(this.state, state), value);
    };
    return Writer;
}(monad_1.AbstractMonad));
exports.Writer = Writer;
function runWriter(w) {
    return [w.state, w.value];
}
exports.runWriter = runWriter;
function createWriter(mc) {
    var identityElm = monoid_1.identity(mc);
    return {
        tell: function (w) {
            return new Writer(identityElm, w, {});
        },
        listen: function (m) {
            var value = [m.value, m.state];
            return new Writer(identityElm, m.state, value);
        },
        of: function (a) {
            return new Writer(identityElm, identityElm, a);
        },
        multi: false
    };
}
exports.createWriter = createWriter;

},{"./monad":25,"./monoid":26,"tslib":32}],32:[function(require,module,exports){
(function (global){
/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global global, define, System, Reflect, Promise */
var __extends;
var __assign;
var __rest;
var __decorate;
var __param;
var __metadata;
var __awaiter;
var __generator;
var __exportStar;
var __values;
var __read;
var __spread;
var __await;
var __asyncGenerator;
var __asyncDelegator;
var __asyncValues;
var __makeTemplateObject;
var __importStar;
var __importDefault;
(function (factory) {
    var root = typeof global === "object" ? global : typeof self === "object" ? self : typeof this === "object" ? this : {};
    if (typeof define === "function" && define.amd) {
        define("tslib", ["exports"], function (exports) { factory(createExporter(root, createExporter(exports))); });
    }
    else if (typeof module === "object" && typeof module.exports === "object") {
        factory(createExporter(root, createExporter(module.exports)));
    }
    else {
        factory(createExporter(root));
    }
    function createExporter(exports, previous) {
        if (exports !== root) {
            if (typeof Object.create === "function") {
                Object.defineProperty(exports, "__esModule", { value: true });
            }
            else {
                exports.__esModule = true;
            }
        }
        return function (id, v) { return exports[id] = previous ? previous(id, v) : v; };
    }
})
(function (exporter) {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };

    __extends = function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };

    __assign = Object.assign || function (t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };

    __rest = function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
                t[p[i]] = s[p[i]];
        return t;
    };

    __decorate = function (decorators, target, key, desc) {
        var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };

    __param = function (paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    };

    __metadata = function (metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    };

    __awaiter = function (thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };

    __generator = function (thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [0, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    };

    __exportStar = function (m, exports) {
        for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
    };

    __values = function (o) {
        var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
        if (m) return m.call(o);
        return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
    };

    __read = function (o, n) {
        var m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        var i = m.call(o), r, ar = [], e;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            }
            finally { if (e) throw e.error; }
        }
        return ar;
    };

    __spread = function () {
        for (var ar = [], i = 0; i < arguments.length; i++)
            ar = ar.concat(__read(arguments[i]));
        return ar;
    };

    __await = function (v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    };

    __asyncGenerator = function (thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var g = generator.apply(thisArg, _arguments || []), i, q = [];
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
        function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);  }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    };

    __asyncDelegator = function (o) {
        var i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
        function verb(n, f) { if (o[n]) i[n] = function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; }; }
    };

    __asyncValues = function (o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        var m = o[Symbol.asyncIterator];
        return m ? m.call(o) : typeof __values === "function" ? __values(o) : o[Symbol.iterator]();
    };

    __makeTemplateObject = function (cooked, raw) {
        if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
        return cooked;
    };

    __importStar = function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result["default"] = mod;
        return result;
    };

    __importDefault = function (mod) {
        return (mod && mod.__esModule) ? mod : { "default": mod };
    };

    exporter("__extends", __extends);
    exporter("__assign", __assign);
    exporter("__rest", __rest);
    exporter("__decorate", __decorate);
    exporter("__param", __param);
    exporter("__metadata", __metadata);
    exporter("__awaiter", __awaiter);
    exporter("__generator", __generator);
    exporter("__exportStar", __exportStar);
    exporter("__values", __values);
    exporter("__read", __read);
    exporter("__spread", __spread);
    exporter("__await", __await);
    exporter("__asyncGenerator", __asyncGenerator);
    exporter("__asyncDelegator", __asyncDelegator);
    exporter("__asyncValues", __asyncValues);
    exporter("__makeTemplateObject", __makeTemplateObject);
    exporter("__importStar", __importStar);
    exporter("__importDefault", __importDefault);
});

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],33:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Data_Functor = require("../Data.Functor");
var Data_Semigroup = require("../Data.Semigroup");
var Alt = function (Functor0, alt) {
    this.Functor0 = Functor0;
    this.alt = alt;
};
var altArray = new Alt(function () {
    return Data_Functor.functorArray;
}, Data_Semigroup.append(Data_Semigroup.semigroupArray));
var alt = function (dict) {
    return dict.alt;
};
module.exports = {
    Alt: Alt,
    alt: alt,
    altArray: altArray
};

},{"../Data.Functor":98,"../Data.Semigroup":130}],34:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Alt = require("../Control.Alt");
var Control_Applicative = require("../Control.Applicative");
var Control_Apply = require("../Control.Apply");
var Control_Plus = require("../Control.Plus");
var Data_Functor = require("../Data.Functor");
var Alternative = function (Applicative0, Plus1) {
    this.Applicative0 = Applicative0;
    this.Plus1 = Plus1;
};
var alternativeArray = new Alternative(function () {
    return Control_Applicative.applicativeArray;
}, function () {
    return Control_Plus.plusArray;
});
module.exports = {
    Alternative: Alternative,
    alternativeArray: alternativeArray
};

},{"../Control.Alt":33,"../Control.Applicative":35,"../Control.Apply":37,"../Control.Plus":60,"../Data.Functor":98}],35:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Apply = require("../Control.Apply");
var Data_Functor = require("../Data.Functor");
var Data_Unit = require("../Data.Unit");
var Applicative = function (Apply0, pure) {
    this.Apply0 = Apply0;
    this.pure = pure;
};
var pure = function (dict) {
    return dict.pure;
};
var unless = function (dictApplicative) {
    return function (v) {
        return function (v1) {
            if (!v) {
                return v1;
            };
            if (v) {
                return pure(dictApplicative)(Data_Unit.unit);
            };
            throw new Error("Failed pattern match at Control.Applicative line 62, column 1 - line 62, column 65: " + [ v.constructor.name, v1.constructor.name ]);
        };
    };
};
var when = function (dictApplicative) {
    return function (v) {
        return function (v1) {
            if (v) {
                return v1;
            };
            if (!v) {
                return pure(dictApplicative)(Data_Unit.unit);
            };
            throw new Error("Failed pattern match at Control.Applicative line 57, column 1 - line 57, column 63: " + [ v.constructor.name, v1.constructor.name ]);
        };
    };
};
var liftA1 = function (dictApplicative) {
    return function (f) {
        return function (a) {
            return Control_Apply.apply(dictApplicative.Apply0())(pure(dictApplicative)(f))(a);
        };
    };
};
var applicativeFn = new Applicative(function () {
    return Control_Apply.applyFn;
}, function (x) {
    return function (v) {
        return x;
    };
});
var applicativeArray = new Applicative(function () {
    return Control_Apply.applyArray;
}, function (x) {
    return [ x ];
});
module.exports = {
    Applicative: Applicative,
    pure: pure,
    liftA1: liftA1,
    unless: unless,
    when: when,
    applicativeFn: applicativeFn,
    applicativeArray: applicativeArray
};

},{"../Control.Apply":37,"../Data.Functor":98,"../Data.Unit":145}],36:[function(require,module,exports){
"use strict";

exports.arrayApply = function (fs) {
  return function (xs) {
    var l = fs.length;
    var k = xs.length;
    var result = new Array(l*k);
    var n = 0;
    for (var i = 0; i < l; i++) {
      var f = fs[i];
      for (var j = 0; j < k; j++) {
        result[n++] = f(xs[j]);
      }
    }
    return result;
  };
};

},{}],37:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var $foreign = require("./foreign");
var Control_Category = require("../Control.Category");
var Data_Function = require("../Data.Function");
var Data_Functor = require("../Data.Functor");
var Apply = function (Functor0, apply) {
    this.Functor0 = Functor0;
    this.apply = apply;
};
var applyFn = new Apply(function () {
    return Data_Functor.functorFn;
}, function (f) {
    return function (g) {
        return function (x) {
            return f(x)(g(x));
        };
    };
});
var applyArray = new Apply(function () {
    return Data_Functor.functorArray;
}, $foreign.arrayApply);
var apply = function (dict) {
    return dict.apply;
};
var applyFirst = function (dictApply) {
    return function (a) {
        return function (b) {
            return apply(dictApply)(Data_Functor.map(dictApply.Functor0())(Data_Function["const"])(a))(b);
        };
    };
};
var applySecond = function (dictApply) {
    return function (a) {
        return function (b) {
            return apply(dictApply)(Data_Functor.map(dictApply.Functor0())(Data_Function["const"](Control_Category.id(Control_Category.categoryFn)))(a))(b);
        };
    };
};
var lift2 = function (dictApply) {
    return function (f) {
        return function (a) {
            return function (b) {
                return apply(dictApply)(Data_Functor.map(dictApply.Functor0())(f)(a))(b);
            };
        };
    };
};
var lift3 = function (dictApply) {
    return function (f) {
        return function (a) {
            return function (b) {
                return function (c) {
                    return apply(dictApply)(apply(dictApply)(Data_Functor.map(dictApply.Functor0())(f)(a))(b))(c);
                };
            };
        };
    };
};
var lift4 = function (dictApply) {
    return function (f) {
        return function (a) {
            return function (b) {
                return function (c) {
                    return function (d) {
                        return apply(dictApply)(apply(dictApply)(apply(dictApply)(Data_Functor.map(dictApply.Functor0())(f)(a))(b))(c))(d);
                    };
                };
            };
        };
    };
};
var lift5 = function (dictApply) {
    return function (f) {
        return function (a) {
            return function (b) {
                return function (c) {
                    return function (d) {
                        return function (e) {
                            return apply(dictApply)(apply(dictApply)(apply(dictApply)(apply(dictApply)(Data_Functor.map(dictApply.Functor0())(f)(a))(b))(c))(d))(e);
                        };
                    };
                };
            };
        };
    };
};
module.exports = {
    Apply: Apply,
    apply: apply,
    applyFirst: applyFirst,
    applySecond: applySecond,
    lift2: lift2,
    lift3: lift3,
    lift4: lift4,
    lift5: lift5,
    applyFn: applyFn,
    applyArray: applyArray
};

},{"../Control.Category":42,"../Data.Function":95,"../Data.Functor":98,"./foreign":36}],38:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Biapply = require("../Control.Biapply");
var Biapplicative = function (Biapply0, bipure) {
    this.Biapply0 = Biapply0;
    this.bipure = bipure;
};
var bipure = function (dict) {
    return dict.bipure;
};
module.exports = {
    bipure: bipure,
    Biapplicative: Biapplicative
};

},{"../Control.Biapply":39}],39:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Category = require("../Control.Category");
var Data_Bifunctor = require("../Data.Bifunctor");
var Data_Function = require("../Data.Function");
var Biapply = function (Bifunctor0, biapply) {
    this.Bifunctor0 = Bifunctor0;
    this.biapply = biapply;
};
var biapply = function (dict) {
    return dict.biapply;
};
var biapplyFirst = function (dictBiapply) {
    return function (a) {
        return function (b) {
            return biapply(dictBiapply)(Control_Category.id(Control_Category.categoryFn)(Data_Bifunctor.bimap(dictBiapply.Bifunctor0())(Data_Function["const"](Control_Category.id(Control_Category.categoryFn)))(Data_Function["const"](Control_Category.id(Control_Category.categoryFn))))(a))(b);
        };
    };
};
var biapplySecond = function (dictBiapply) {
    return function (a) {
        return function (b) {
            return biapply(dictBiapply)(Control_Category.id(Control_Category.categoryFn)(Data_Bifunctor.bimap(dictBiapply.Bifunctor0())(Data_Function["const"])(Data_Function["const"]))(a))(b);
        };
    };
};
var bilift2 = function (dictBiapply) {
    return function (f) {
        return function (g) {
            return function (a) {
                return function (b) {
                    return biapply(dictBiapply)(Control_Category.id(Control_Category.categoryFn)(Data_Bifunctor.bimap(dictBiapply.Bifunctor0())(f)(g))(a))(b);
                };
            };
        };
    };
};
var bilift3 = function (dictBiapply) {
    return function (f) {
        return function (g) {
            return function (a) {
                return function (b) {
                    return function (c) {
                        return biapply(dictBiapply)(biapply(dictBiapply)(Control_Category.id(Control_Category.categoryFn)(Data_Bifunctor.bimap(dictBiapply.Bifunctor0())(f)(g))(a))(b))(c);
                    };
                };
            };
        };
    };
};
module.exports = {
    biapply: biapply,
    Biapply: Biapply,
    biapplyFirst: biapplyFirst,
    biapplySecond: biapplySecond,
    bilift2: bilift2,
    bilift3: bilift3
};

},{"../Control.Category":42,"../Data.Bifunctor":75,"../Data.Function":95}],40:[function(require,module,exports){
"use strict";

exports.arrayBind = function (arr) {
  return function (f) {
    var result = [];
    for (var i = 0, l = arr.length; i < l; i++) {
      Array.prototype.push.apply(result, f(arr[i]));
    }
    return result;
  };
};

},{}],41:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var $foreign = require("./foreign");
var Control_Applicative = require("../Control.Applicative");
var Control_Apply = require("../Control.Apply");
var Control_Category = require("../Control.Category");
var Data_Function = require("../Data.Function");
var Data_Functor = require("../Data.Functor");
var Data_Unit = require("../Data.Unit");
var Bind = function (Apply0, bind) {
    this.Apply0 = Apply0;
    this.bind = bind;
};
var Discard = function (discard) {
    this.discard = discard;
};
var discard = function (dict) {
    return dict.discard;
};
var bindFn = new Bind(function () {
    return Control_Apply.applyFn;
}, function (m) {
    return function (f) {
        return function (x) {
            return f(m(x))(x);
        };
    };
});
var bindArray = new Bind(function () {
    return Control_Apply.applyArray;
}, $foreign.arrayBind);
var bind = function (dict) {
    return dict.bind;
};
var bindFlipped = function (dictBind) {
    return Data_Function.flip(bind(dictBind));
};
var composeKleisliFlipped = function (dictBind) {
    return function (f) {
        return function (g) {
            return function (a) {
                return bindFlipped(dictBind)(f)(g(a));
            };
        };
    };
};
var composeKleisli = function (dictBind) {
    return function (f) {
        return function (g) {
            return function (a) {
                return bind(dictBind)(f(a))(g);
            };
        };
    };
};
var discardUnit = new Discard(function (dictBind) {
    return bind(dictBind);
});
var ifM = function (dictBind) {
    return function (cond) {
        return function (t) {
            return function (f) {
                return bind(dictBind)(cond)(function (cond$prime) {
                    if (cond$prime) {
                        return t;
                    };
                    return f;
                });
            };
        };
    };
};
var join = function (dictBind) {
    return function (m) {
        return bind(dictBind)(m)(Control_Category.id(Control_Category.categoryFn));
    };
};
module.exports = {
    Bind: Bind,
    bind: bind,
    bindFlipped: bindFlipped,
    Discard: Discard,
    discard: discard,
    join: join,
    composeKleisli: composeKleisli,
    composeKleisliFlipped: composeKleisliFlipped,
    ifM: ifM,
    bindFn: bindFn,
    bindArray: bindArray,
    discardUnit: discardUnit
};

},{"../Control.Applicative":35,"../Control.Apply":37,"../Control.Category":42,"../Data.Function":95,"../Data.Functor":98,"../Data.Unit":145,"./foreign":40}],42:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Semigroupoid = require("../Control.Semigroupoid");
var Category = function (Semigroupoid0, id) {
    this.Semigroupoid0 = Semigroupoid0;
    this.id = id;
};
var id = function (dict) {
    return dict.id;
};
var categoryFn = new Category(function () {
    return Control_Semigroupoid.semigroupoidFn;
}, function (x) {
    return x;
});
module.exports = {
    Category: Category,
    id: id,
    categoryFn: categoryFn
};

},{"../Control.Semigroupoid":61}],43:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Extend = require("../Control.Extend");
var Data_Functor = require("../Data.Functor");
var Comonad = function (Extend0, extract) {
    this.Extend0 = Extend0;
    this.extract = extract;
};
var extract = function (dict) {
    return dict.extract;
};
module.exports = {
    Comonad: Comonad,
    extract: extract
};

},{"../Control.Extend":45,"../Data.Functor":98}],44:[function(require,module,exports){
"use strict";

exports.arrayExtend = function(f) {
  return function(xs) {
    return xs.map(function (_, i, xs) {
      return f(xs.slice(i));
    });
  };
};

},{}],45:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var $foreign = require("./foreign");
var Control_Category = require("../Control.Category");
var Data_Functor = require("../Data.Functor");
var Data_Semigroup = require("../Data.Semigroup");
var Extend = function (Functor0, extend) {
    this.Functor0 = Functor0;
    this.extend = extend;
};
var extendFn = function (dictSemigroup) {
    return new Extend(function () {
        return Data_Functor.functorFn;
    }, function (f) {
        return function (g) {
            return function (w) {
                return f(function (w$prime) {
                    return g(Data_Semigroup.append(dictSemigroup)(w)(w$prime));
                });
            };
        };
    });
};
var extendArray = new Extend(function () {
    return Data_Functor.functorArray;
}, $foreign.arrayExtend);
var extend = function (dict) {
    return dict.extend;
};
var extendFlipped = function (dictExtend) {
    return function (w) {
        return function (f) {
            return extend(dictExtend)(f)(w);
        };
    };
};
var duplicate = function (dictExtend) {
    return extend(dictExtend)(Control_Category.id(Control_Category.categoryFn));
};
var composeCoKleisliFlipped = function (dictExtend) {
    return function (f) {
        return function (g) {
            return function (w) {
                return f(extend(dictExtend)(g)(w));
            };
        };
    };
};
var composeCoKleisli = function (dictExtend) {
    return function (f) {
        return function (g) {
            return function (w) {
                return g(extend(dictExtend)(f)(w));
            };
        };
    };
};
module.exports = {
    Extend: Extend,
    extend: extend,
    extendFlipped: extendFlipped,
    composeCoKleisli: composeCoKleisli,
    composeCoKleisliFlipped: composeCoKleisliFlipped,
    duplicate: duplicate,
    extendFn: extendFn,
    extendArray: extendArray
};

},{"../Control.Category":42,"../Data.Functor":98,"../Data.Semigroup":130,"./foreign":44}],46:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Data_Unit = require("../Data.Unit");
var Lazy = function (defer) {
    this.defer = defer;
};
var lazyUnit = new Lazy(function (v) {
    return Data_Unit.unit;
});
var lazyFn = new Lazy(function (f) {
    return function (x) {
        return f(Data_Unit.unit)(x);
    };
});
var defer = function (dict) {
    return dict.defer;
};
var fix = function (dictLazy) {
    return function (f) {
        return defer(dictLazy)(function (v) {
            return f(fix(dictLazy)(f));
        });
    };
};
module.exports = {
    defer: defer,
    Lazy: Lazy,
    fix: fix,
    lazyFn: lazyFn,
    lazyUnit: lazyUnit
};

},{"../Data.Unit":145}],47:[function(require,module,exports){
"use strict";

exports.log = function (s) {
  return function () {
    console.log(s);
    return {};
  };
};

exports.warn = function (s) {
  return function () {
    console.warn(s);
    return {};
  };
};

exports.error = function (s) {
  return function () {
    console.error(s);
    return {};
  };
};

exports.info = function (s) {
  return function () {
    console.info(s);
    return {};
  };
};

},{}],48:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var $foreign = require("./foreign");
var Control_Monad_Eff = require("../Control.Monad.Eff");
var Data_Show = require("../Data.Show");
var Data_Unit = require("../Data.Unit");
var warnShow = function (dictShow) {
    return function (a) {
        return $foreign.warn(Data_Show.show(dictShow)(a));
    };
};
var logShow = function (dictShow) {
    return function (a) {
        return $foreign.log(Data_Show.show(dictShow)(a));
    };
};
var infoShow = function (dictShow) {
    return function (a) {
        return $foreign.info(Data_Show.show(dictShow)(a));
    };
};
var errorShow = function (dictShow) {
    return function (a) {
        return $foreign.error(Data_Show.show(dictShow)(a));
    };
};
module.exports = {
    logShow: logShow,
    warnShow: warnShow,
    errorShow: errorShow,
    infoShow: infoShow,
    log: $foreign.log,
    warn: $foreign.warn,
    error: $foreign.error,
    info: $foreign.info
};

},{"../Control.Monad.Eff":54,"../Data.Show":134,"../Data.Unit":145,"./foreign":47}],49:[function(require,module,exports){
"use strict";

exports.mkEffFn1 = function mkEffFn1(fn) {
  return function(x) {
    return fn(x)();
  };
};

exports.mkEffFn2 = function mkEffFn2(fn) {
  return function(a, b) {
    return fn(a)(b)();
  };
};

exports.mkEffFn3 = function mkEffFn3(fn) {
  return function(a, b, c) {
    return fn(a)(b)(c)();
  };
};

exports.mkEffFn4 = function mkEffFn4(fn) {
  return function(a, b, c, d) {
    return fn(a)(b)(c)(d)();
  };
};

exports.mkEffFn5 = function mkEffFn5(fn) {
  return function(a, b, c, d, e) {
    return fn(a)(b)(c)(d)(e)();
  };
};

exports.mkEffFn6 = function mkEffFn6(fn) {
  return function(a, b, c, d, e, f) {
    return fn(a)(b)(c)(d)(e)(f)();
  };
};

exports.mkEffFn7 = function mkEffFn7(fn) {
  return function(a, b, c, d, e, f, g) {
    return fn(a)(b)(c)(d)(e)(f)(g)();
  };
};

exports.mkEffFn8 = function mkEffFn8(fn) {
  return function(a, b, c, d, e, f, g, h) {
    return fn(a)(b)(c)(d)(e)(f)(g)(h)();
  };
};

exports.mkEffFn9 = function mkEffFn9(fn) {
  return function(a, b, c, d, e, f, g, h, i) {
    return fn(a)(b)(c)(d)(e)(f)(g)(h)(i)();
  };
};

exports.mkEffFn10 = function mkEffFn10(fn) {
  return function(a, b, c, d, e, f, g, h, i, j) {
    return fn(a)(b)(c)(d)(e)(f)(g)(h)(i)(j)();
  };
};

exports.runEffFn1 = function runEffFn1(fn) {
  return function(a) {
    return function() {
      return fn(a);
    };
  };
};

exports.runEffFn2 = function runEffFn2(fn) {
  return function(a) {
    return function(b) {
      return function() {
        return fn(a, b);
      };
    };
  };
};

exports.runEffFn3 = function runEffFn3(fn) {
  return function(a) {
    return function(b) {
      return function(c) {
        return function() {
          return fn(a, b, c);
        };
      };
    };
  };
};

exports.runEffFn4 = function runEffFn4(fn) {
  return function(a) {
    return function(b) {
      return function(c) {
        return function(d) {
          return function() {
            return fn(a, b, c, d);
          };
        };
      };
    };
  };
};

exports.runEffFn5 = function runEffFn5(fn) {
  return function(a) {
    return function(b) {
      return function(c) {
        return function(d) {
          return function(e) {
            return function() {
              return fn(a, b, c, d, e);
            };
          };
        };
      };
    };
  };
};

exports.runEffFn6 = function runEffFn6(fn) {
  return function(a) {
    return function(b) {
      return function(c) {
        return function(d) {
          return function(e) {
            return function(f) {
              return function() {
                return fn(a, b, c, d, e, f);
              };
            };
          };
        };
      };
    };
  };
};

exports.runEffFn7 = function runEffFn7(fn) {
  return function(a) {
    return function(b) {
      return function(c) {
        return function(d) {
          return function(e) {
            return function(f) {
              return function(g) {
                return function() {
                  return fn(a, b, c, d, e, f, g);
                };
              };
            };
          };
        };
      };
    };
  };
};

exports.runEffFn8 = function runEffFn8(fn) {
  return function(a) {
    return function(b) {
      return function(c) {
        return function(d) {
          return function(e) {
            return function(f) {
              return function(g) {
                return function(h) {
                  return function() {
                    return fn(a, b, c, d, e, f, g, h);
                  };
                };
              };
            };
          };
        };
      };
    };
  };
};

exports.runEffFn9 = function runEffFn9(fn) {
  return function(a) {
    return function(b) {
      return function(c) {
        return function(d) {
          return function(e) {
            return function(f) {
              return function(g) {
                return function(h) {
                  return function(i) {
                    return function() {
                      return fn(a, b, c, d, e, f, g, h, i);
                    };
                  };
                };
              };
            };
          };
        };
      };
    };
  };
};

exports.runEffFn10 = function runEffFn10(fn) {
  return function(a) {
    return function(b) {
      return function(c) {
        return function(d) {
          return function(e) {
            return function(f) {
              return function(g) {
                return function(h) {
                  return function(i) {
                    return function(j) {
                      return function() {
                        return fn(a, b, c, d, e, f, g, h, i, j);
                      };
                    };
                  };
                };
              };
            };
          };
        };
      };
    };
  };
};

},{}],50:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var $foreign = require("./foreign");
var Control_Monad_Eff = require("../Control.Monad.Eff");
module.exports = {
    mkEffFn1: $foreign.mkEffFn1,
    mkEffFn2: $foreign.mkEffFn2,
    mkEffFn3: $foreign.mkEffFn3,
    mkEffFn4: $foreign.mkEffFn4,
    mkEffFn5: $foreign.mkEffFn5,
    mkEffFn6: $foreign.mkEffFn6,
    mkEffFn7: $foreign.mkEffFn7,
    mkEffFn8: $foreign.mkEffFn8,
    mkEffFn9: $foreign.mkEffFn9,
    mkEffFn10: $foreign.mkEffFn10,
    runEffFn1: $foreign.runEffFn1,
    runEffFn2: $foreign.runEffFn2,
    runEffFn3: $foreign.runEffFn3,
    runEffFn4: $foreign.runEffFn4,
    runEffFn5: $foreign.runEffFn5,
    runEffFn6: $foreign.runEffFn6,
    runEffFn7: $foreign.runEffFn7,
    runEffFn8: $foreign.runEffFn8,
    runEffFn9: $foreign.runEffFn9,
    runEffFn10: $foreign.runEffFn10
};

},{"../Control.Monad.Eff":54,"./foreign":49}],51:[function(require,module,exports){
"use strict";

exports.unsafeCoerceEff = function (f) {
  return f;
};

},{}],52:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var $foreign = require("./foreign");
var Control_Monad_Eff = require("../Control.Monad.Eff");
var Control_Semigroupoid = require("../Control.Semigroupoid");
var unsafePerformEff = function ($0) {
    return Control_Monad_Eff.runPure($foreign.unsafeCoerceEff($0));
};
module.exports = {
    unsafePerformEff: unsafePerformEff,
    unsafeCoerceEff: $foreign.unsafeCoerceEff
};

},{"../Control.Monad.Eff":54,"../Control.Semigroupoid":61,"./foreign":51}],53:[function(require,module,exports){
"use strict";

exports.pureE = function (a) {
  return function () {
    return a;
  };
};

exports.bindE = function (a) {
  return function (f) {
    return function () {
      return f(a())();
    };
  };
};

exports.runPure = function (f) {
  return f();
};

exports.untilE = function (f) {
  return function () {
    while (!f());
    return {};
  };
};

exports.whileE = function (f) {
  return function (a) {
    return function () {
      while (f()) {
        a();
      }
      return {};
    };
  };
};

exports.forE = function (lo) {
  return function (hi) {
    return function (f) {
      return function () {
        for (var i = lo; i < hi; i++) {
          f(i)();
        }
      };
    };
  };
};

exports.foreachE = function (as) {
  return function (f) {
    return function () {
      for (var i = 0, l = as.length; i < l; i++) {
        f(as[i])();
      }
    };
  };
};

},{}],54:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var $foreign = require("./foreign");
var Control_Applicative = require("../Control.Applicative");
var Control_Apply = require("../Control.Apply");
var Control_Bind = require("../Control.Bind");
var Control_Monad = require("../Control.Monad");
var Data_Functor = require("../Data.Functor");
var Data_Monoid = require("../Data.Monoid");
var Data_Semigroup = require("../Data.Semigroup");
var Data_Unit = require("../Data.Unit");
var monadEff = new Control_Monad.Monad(function () {
    return applicativeEff;
}, function () {
    return bindEff;
});
var bindEff = new Control_Bind.Bind(function () {
    return applyEff;
}, $foreign.bindE);
var applyEff = new Control_Apply.Apply(function () {
    return functorEff;
}, Control_Monad.ap(monadEff));
var applicativeEff = new Control_Applicative.Applicative(function () {
    return applyEff;
}, $foreign.pureE);
var functorEff = new Data_Functor.Functor(Control_Applicative.liftA1(applicativeEff));
var semigroupEff = function (dictSemigroup) {
    return new Data_Semigroup.Semigroup(Control_Apply.lift2(applyEff)(Data_Semigroup.append(dictSemigroup)));
};
var monoidEff = function (dictMonoid) {
    return new Data_Monoid.Monoid(function () {
        return semigroupEff(dictMonoid.Semigroup0());
    }, Control_Applicative.pure(applicativeEff)(Data_Monoid.mempty(dictMonoid)));
};
module.exports = {
    semigroupEff: semigroupEff,
    monoidEff: monoidEff,
    functorEff: functorEff,
    applyEff: applyEff,
    applicativeEff: applicativeEff,
    bindEff: bindEff,
    monadEff: monadEff,
    runPure: $foreign.runPure,
    untilE: $foreign.untilE,
    whileE: $foreign.whileE,
    forE: $foreign.forE,
    foreachE: $foreign.foreachE
};

},{"../Control.Applicative":35,"../Control.Apply":37,"../Control.Bind":41,"../Control.Monad":58,"../Data.Functor":98,"../Data.Monoid":115,"../Data.Semigroup":130,"../Data.Unit":145,"./foreign":53}],55:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Applicative = require("../Control.Applicative");
var Control_Bind = require("../Control.Bind");
var Control_Monad = require("../Control.Monad");
var Control_Monad_Eff = require("../Control.Monad.Eff");
var Control_Monad_Eff_Unsafe = require("../Control.Monad.Eff.Unsafe");
var Control_Monad_ST = require("../Control.Monad.ST");
var Control_Semigroupoid = require("../Control.Semigroupoid");
var Data_Bifunctor = require("../Data.Bifunctor");
var Data_Either = require("../Data.Either");
var Data_Functor = require("../Data.Functor");
var Data_Identity = require("../Data.Identity");
var Data_Maybe = require("../Data.Maybe");
var Data_Unit = require("../Data.Unit");
var Partial_Unsafe = require("../Partial.Unsafe");
var Prelude = require("../Prelude");
var Loop = (function () {
    function Loop(value0) {
        this.value0 = value0;
    };
    Loop.create = function (value0) {
        return new Loop(value0);
    };
    return Loop;
})();
var Done = (function () {
    function Done(value0) {
        this.value0 = value0;
    };
    Done.create = function (value0) {
        return new Done(value0);
    };
    return Done;
})();
var MonadRec = function (Monad0, tailRecM) {
    this.Monad0 = Monad0;
    this.tailRecM = tailRecM;
};
var tailRecM = function (dict) {
    return dict.tailRecM;
};
var tailRecM2 = function (dictMonadRec) {
    return function (f) {
        return function (a) {
            return function (b) {
                return tailRecM(dictMonadRec)(function (o) {
                    return f(o.a)(o.b);
                })({
                    a: a,
                    b: b
                });
            };
        };
    };
};
var tailRecM3 = function (dictMonadRec) {
    return function (f) {
        return function (a) {
            return function (b) {
                return function (c) {
                    return tailRecM(dictMonadRec)(function (o) {
                        return f(o.a)(o.b)(o.c);
                    })({
                        a: a,
                        b: b,
                        c: c
                    });
                };
            };
        };
    };
};
var tailRecEff = function (f) {
    return function (a) {
        var fromDone = function (v) {
            var __unused = function (dictPartial1) {
                return function ($dollar16) {
                    return $dollar16;
                };
            };
            return __unused()((function () {
                if (v instanceof Done) {
                    return v.value0;
                };
                throw new Error("Failed pattern match at Control.Monad.Rec.Class line 141, column 28 - line 141, column 42: " + [ v.constructor.name ]);
            })());
        };
        var f$prime = function ($52) {
            return Control_Monad_Eff_Unsafe.unsafeCoerceEff(f($52));
        };
        return function __do() {
            var v = Control_Bind.bindFlipped(Control_Monad_Eff.bindEff)(Control_Monad_ST.newSTRef)(f$prime(a))();
            (function () {
                while (!(function __do() {
                    var v1 = v.value;
                    if (v1 instanceof Loop) {
                        var v2 = f$prime(v1.value0)();
                        var v3 = v.value = v2;
                        return false;
                    };
                    if (v1 instanceof Done) {
                        return true;
                    };
                    throw new Error("Failed pattern match at Control.Monad.Rec.Class line 130, column 5 - line 135, column 26: " + [ v1.constructor.name ]);
                })()) {

                };
                return {};
            })();
            return Data_Functor.map(Control_Monad_Eff.functorEff)(fromDone)(Control_Monad_ST.readSTRef(v))();
        };
    };
};
var tailRec = function (f) {
    var go = function ($copy_v) {
        var $tco_done = false;
        var $tco_result;
        function $tco_loop(v) {
            if (v instanceof Loop) {
                $copy_v = f(v.value0);
                return;
            };
            if (v instanceof Done) {
                $tco_done = true;
                return v.value0;
            };
            throw new Error("Failed pattern match at Control.Monad.Rec.Class line 96, column 3 - line 96, column 25: " + [ v.constructor.name ]);
        };
        while (!$tco_done) {
            $tco_result = $tco_loop($copy_v);
        };
        return $tco_result;
    };
    return function ($53) {
        return go(f($53));
    };
};
var monadRecMaybe = new MonadRec(function () {
    return Data_Maybe.monadMaybe;
}, function (f) {
    return function (a0) {
        var g = function (v) {
            if (v instanceof Data_Maybe.Nothing) {
                return new Done(Data_Maybe.Nothing.value);
            };
            if (v instanceof Data_Maybe.Just && v.value0 instanceof Loop) {
                return new Loop(f(v.value0.value0));
            };
            if (v instanceof Data_Maybe.Just && v.value0 instanceof Done) {
                return new Done(new Data_Maybe.Just(v.value0.value0));
            };
            throw new Error("Failed pattern match at Control.Monad.Rec.Class line 120, column 7 - line 120, column 31: " + [ v.constructor.name ]);
        };
        return tailRec(g)(f(a0));
    };
});
var monadRecIdentity = new MonadRec(function () {
    return Data_Identity.monadIdentity;
}, function (f) {
    var runIdentity = function (v) {
        return v;
    };
    return function ($54) {
        return Data_Identity.Identity(tailRec(function ($55) {
            return runIdentity(f($55));
        })($54));
    };
});
var monadRecFunction = new MonadRec(function () {
    return Control_Monad.monadFn;
}, function (f) {
    return function (a0) {
        return function (e) {
            return tailRec(function (a) {
                return f(a)(e);
            })(a0);
        };
    };
});
var monadRecEither = new MonadRec(function () {
    return Data_Either.monadEither;
}, function (f) {
    return function (a0) {
        var g = function (v) {
            if (v instanceof Data_Either.Left) {
                return new Done(new Data_Either.Left(v.value0));
            };
            if (v instanceof Data_Either.Right && v.value0 instanceof Loop) {
                return new Loop(f(v.value0.value0));
            };
            if (v instanceof Data_Either.Right && v.value0 instanceof Done) {
                return new Done(new Data_Either.Right(v.value0.value0));
            };
            throw new Error("Failed pattern match at Control.Monad.Rec.Class line 112, column 7 - line 112, column 33: " + [ v.constructor.name ]);
        };
        return tailRec(g)(f(a0));
    };
});
var monadRecEff = new MonadRec(function () {
    return Control_Monad_Eff.monadEff;
}, tailRecEff);
var functorStep = new Data_Functor.Functor(function (f) {
    return function (v) {
        if (v instanceof Loop) {
            return new Loop(v.value0);
        };
        if (v instanceof Done) {
            return new Done(f(v.value0));
        };
        throw new Error("Failed pattern match at Control.Monad.Rec.Class line 28, column 1 - line 28, column 41: " + [ f.constructor.name, v.constructor.name ]);
    };
});
var forever = function (dictMonadRec) {
    return function (ma) {
        return tailRecM(dictMonadRec)(function (u) {
            return Data_Functor.voidRight((((dictMonadRec.Monad0()).Bind1()).Apply0()).Functor0())(new Loop(u))(ma);
        })(Data_Unit.unit);
    };
};
var bifunctorStep = new Data_Bifunctor.Bifunctor(function (v) {
    return function (v1) {
        return function (v2) {
            if (v2 instanceof Loop) {
                return new Loop(v(v2.value0));
            };
            if (v2 instanceof Done) {
                return new Done(v1(v2.value0));
            };
            throw new Error("Failed pattern match at Control.Monad.Rec.Class line 32, column 1 - line 32, column 41: " + [ v.constructor.name, v1.constructor.name, v2.constructor.name ]);
        };
    };
});
module.exports = {
    Loop: Loop,
    Done: Done,
    MonadRec: MonadRec,
    tailRec: tailRec,
    tailRecM: tailRecM,
    tailRecM2: tailRecM2,
    tailRecM3: tailRecM3,
    forever: forever,
    functorStep: functorStep,
    bifunctorStep: bifunctorStep,
    monadRecIdentity: monadRecIdentity,
    monadRecEff: monadRecEff,
    monadRecFunction: monadRecFunction,
    monadRecEither: monadRecEither,
    monadRecMaybe: monadRecMaybe
};

},{"../Control.Applicative":35,"../Control.Bind":41,"../Control.Monad":58,"../Control.Monad.Eff":54,"../Control.Monad.Eff.Unsafe":52,"../Control.Monad.ST":57,"../Control.Semigroupoid":61,"../Data.Bifunctor":75,"../Data.Either":84,"../Data.Functor":98,"../Data.Identity":105,"../Data.Maybe":108,"../Data.Unit":145,"../Partial.Unsafe":149,"../Prelude":152}],56:[function(require,module,exports){
"use strict";

exports.newSTRef = function (val) {
  return function () {
    return { value: val };
  };
};

exports.readSTRef = function (ref) {
  return function () {
    return ref.value;
  };
};

exports.modifySTRef = function (ref) {
  return function (f) {
    return function () {
      return ref.value = f(ref.value); // eslint-disable-line no-return-assign
    };
  };
};

exports.writeSTRef = function (ref) {
  return function (a) {
    return function () {
      return ref.value = a; // eslint-disable-line no-return-assign
    };
  };
};

exports.runST = function (f) {
  return f;
};

},{}],57:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var $foreign = require("./foreign");
var Control_Monad_Eff = require("../Control.Monad.Eff");
var pureST = function (st) {
    return Control_Monad_Eff.runPure($foreign.runST(st));
};
module.exports = {
    pureST: pureST,
    newSTRef: $foreign.newSTRef,
    readSTRef: $foreign.readSTRef,
    modifySTRef: $foreign.modifySTRef,
    writeSTRef: $foreign.writeSTRef,
    runST: $foreign.runST
};

},{"../Control.Monad.Eff":54,"./foreign":56}],58:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Applicative = require("../Control.Applicative");
var Control_Apply = require("../Control.Apply");
var Control_Bind = require("../Control.Bind");
var Data_Functor = require("../Data.Functor");
var Data_Unit = require("../Data.Unit");
var Monad = function (Applicative0, Bind1) {
    this.Applicative0 = Applicative0;
    this.Bind1 = Bind1;
};
var whenM = function (dictMonad) {
    return function (mb) {
        return function (m) {
            return Control_Bind.bind(dictMonad.Bind1())(mb)(function (v) {
                return Control_Applicative.when(dictMonad.Applicative0())(v)(m);
            });
        };
    };
};
var unlessM = function (dictMonad) {
    return function (mb) {
        return function (m) {
            return Control_Bind.bind(dictMonad.Bind1())(mb)(function (v) {
                return Control_Applicative.unless(dictMonad.Applicative0())(v)(m);
            });
        };
    };
};
var monadFn = new Monad(function () {
    return Control_Applicative.applicativeFn;
}, function () {
    return Control_Bind.bindFn;
});
var monadArray = new Monad(function () {
    return Control_Applicative.applicativeArray;
}, function () {
    return Control_Bind.bindArray;
});
var liftM1 = function (dictMonad) {
    return function (f) {
        return function (a) {
            return Control_Bind.bind(dictMonad.Bind1())(a)(function (v) {
                return Control_Applicative.pure(dictMonad.Applicative0())(f(v));
            });
        };
    };
};
var ap = function (dictMonad) {
    return function (f) {
        return function (a) {
            return Control_Bind.bind(dictMonad.Bind1())(f)(function (v) {
                return Control_Bind.bind(dictMonad.Bind1())(a)(function (v1) {
                    return Control_Applicative.pure(dictMonad.Applicative0())(v(v1));
                });
            });
        };
    };
};
module.exports = {
    Monad: Monad,
    liftM1: liftM1,
    ap: ap,
    whenM: whenM,
    unlessM: unlessM,
    monadFn: monadFn,
    monadArray: monadArray
};

},{"../Control.Applicative":35,"../Control.Apply":37,"../Control.Bind":41,"../Data.Functor":98,"../Data.Unit":145}],59:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Alt = require("../Control.Alt");
var Control_Alternative = require("../Control.Alternative");
var Control_Applicative = require("../Control.Applicative");
var Control_Apply = require("../Control.Apply");
var Control_Bind = require("../Control.Bind");
var Control_Monad = require("../Control.Monad");
var Control_Plus = require("../Control.Plus");
var Data_Functor = require("../Data.Functor");
var Data_Unit = require("../Data.Unit");
var MonadZero = function (Alternative1, Monad0) {
    this.Alternative1 = Alternative1;
    this.Monad0 = Monad0;
};
var monadZeroArray = new MonadZero(function () {
    return Control_Alternative.alternativeArray;
}, function () {
    return Control_Monad.monadArray;
});
var guard = function (dictMonadZero) {
    return function (v) {
        if (v) {
            return Control_Applicative.pure((dictMonadZero.Alternative1()).Applicative0())(Data_Unit.unit);
        };
        if (!v) {
            return Control_Plus.empty((dictMonadZero.Alternative1()).Plus1());
        };
        throw new Error("Failed pattern match at Control.MonadZero line 54, column 1 - line 54, column 52: " + [ v.constructor.name ]);
    };
};
module.exports = {
    MonadZero: MonadZero,
    guard: guard,
    monadZeroArray: monadZeroArray
};

},{"../Control.Alt":33,"../Control.Alternative":34,"../Control.Applicative":35,"../Control.Apply":37,"../Control.Bind":41,"../Control.Monad":58,"../Control.Plus":60,"../Data.Functor":98,"../Data.Unit":145}],60:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Alt = require("../Control.Alt");
var Data_Functor = require("../Data.Functor");
var Plus = function (Alt0, empty) {
    this.Alt0 = Alt0;
    this.empty = empty;
};
var plusArray = new Plus(function () {
    return Control_Alt.altArray;
}, [  ]);
var empty = function (dict) {
    return dict.empty;
};
module.exports = {
    Plus: Plus,
    empty: empty,
    plusArray: plusArray
};

},{"../Control.Alt":33,"../Data.Functor":98}],61:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Semigroupoid = function (compose) {
    this.compose = compose;
};
var semigroupoidFn = new Semigroupoid(function (f) {
    return function (g) {
        return function (x) {
            return f(g(x));
        };
    };
});
var compose = function (dict) {
    return dict.compose;
};
var composeFlipped = function (dictSemigroupoid) {
    return function (f) {
        return function (g) {
            return compose(dictSemigroupoid)(g)(f);
        };
    };
};
module.exports = {
    compose: compose,
    Semigroupoid: Semigroupoid,
    composeFlipped: composeFlipped,
    semigroupoidFn: semigroupoidFn
};

},{}],62:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Applicative = require("../Control.Applicative");
var Control_Apply = require("../Control.Apply");
var Control_Bind = require("../Control.Bind");
var Control_Monad_Eff = require("../Control.Monad.Eff");
var Control_Monad_Eff_Console = require("../Control.Monad.Eff.Console");
var DOM = require("../DOM");
var Data_Array = require("../Data.Array");
var Data_Foldable = require("../Data.Foldable");
var Data_Function = require("../Data.Function");
var Data_Functor = require("../Data.Functor");
var Data_Hareactive = require("../Data.Hareactive");
var Data_Monoid = require("../Data.Monoid");
var Data_Ring = require("../Data.Ring");
var Data_Semigroup = require("../Data.Semigroup");
var Data_Semiring = require("../Data.Semiring");
var Data_Show = require("../Data.Show");
var Prelude = require("../Prelude");
var Turbine = require("../Turbine");
var Turbine_HTML = require("../Turbine.HTML");
var counterView = function (v) {
    return Turbine_HTML.div(Turbine.merge()(Turbine.merge()(Turbine.merge()(Turbine_HTML.text("Counter "))(Turbine_HTML.span(Turbine_HTML.textB(Data_Functor.map(Data_Hareactive.functorBehavior)(Data_Show.show(Data_Show.showInt))(v.count)))))(Turbine.output()(Turbine_HTML.button("+"))(function (o) {
        return {
            increment: o.click
        };
    })))(Turbine.output()(Turbine_HTML.button("-"))(function (o) {
        return {
            decrement: o.click
        };
    })));
};
var counterModel = function (v) {
    return function (id) {
        var changes = Data_Semigroup.append(Data_Hareactive.semigroupStream)(Data_Functor.voidLeft(Data_Hareactive.functorStream)(v.increment)(1))(Data_Functor.voidLeft(Data_Hareactive.functorStream)(v.decrement)(-1 | 0));
        return Control_Bind.bind(Data_Hareactive.bindNow)(Data_Hareactive.sample(Data_Hareactive.scan(Data_Semiring.add(Data_Semiring.semiringInt))(0)(changes)))(function (v1) {
            return Control_Applicative.pure(Data_Hareactive.applicativeNow)({
                count: v1
            });
        });
    };
};
var counter = Turbine.modelView(counterModel)(counterView);
var main = Turbine.runComponent("#mount")(counter(0));
module.exports = {
    counterModel: counterModel,
    counterView: counterView,
    counter: counter,
    main: main
};

},{"../Control.Applicative":35,"../Control.Apply":37,"../Control.Bind":41,"../Control.Monad.Eff":54,"../Control.Monad.Eff.Console":48,"../DOM":63,"../Data.Array":68,"../Data.Foldable":91,"../Data.Function":95,"../Data.Functor":98,"../Data.Hareactive":102,"../Data.Monoid":115,"../Data.Ring":127,"../Data.Semigroup":130,"../Data.Semiring":132,"../Data.Show":134,"../Prelude":152,"../Turbine":156,"../Turbine.HTML":154}],63:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Monad_Eff = require("../Control.Monad.Eff");
module.exports = {};

},{"../Control.Monad.Eff":54}],64:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Applicative = require("../Control.Applicative");
var Control_Bind = require("../Control.Bind");
var Control_Monad_Eff = require("../Control.Monad.Eff");
var Control_Monad_ST = require("../Control.Monad.ST");
var Control_Semigroupoid = require("../Control.Semigroupoid");
var Data_Array_ST = require("../Data.Array.ST");
var Data_Function = require("../Data.Function");
var Data_Functor = require("../Data.Functor");
var Data_HeytingAlgebra = require("../Data.HeytingAlgebra");
var Data_Maybe = require("../Data.Maybe");
var Data_Semiring = require("../Data.Semiring");
var Prelude = require("../Prelude");
var Iterator = (function () {
    function Iterator(value0, value1) {
        this.value0 = value0;
        this.value1 = value1;
    };
    Iterator.create = function (value0) {
        return function (value1) {
            return new Iterator(value0, value1);
        };
    };
    return Iterator;
})();
var peek = function (v) {
    return function __do() {
        var v1 = Control_Monad_ST.readSTRef(v.value1)();
        return v.value0(v1);
    };
};
var next = function (v) {
    return function __do() {
        var v1 = Control_Monad_ST.readSTRef(v.value1)();
        var v2 = Control_Monad_ST.modifySTRef(v.value1)(function (v2) {
            return v2 + 1 | 0;
        })();
        return v.value0(v1);
    };
};
var pushWhile = function (p) {
    return function (iter) {
        return function (array) {
            return function __do() {
                var v = Control_Monad_ST.newSTRef(false)();
                while (Data_Functor.map(Control_Monad_Eff.functorEff)(Data_HeytingAlgebra.not(Data_HeytingAlgebra.heytingAlgebraBoolean))(Control_Monad_ST.readSTRef(v))()) {
                    (function __do() {
                        var v1 = peek(iter)();
                        if (v1 instanceof Data_Maybe.Just && p(v1.value0)) {
                            var v2 = Data_Array_ST.pushSTArray(array)(v1.value0)();
                            return Data_Functor["void"](Control_Monad_Eff.functorEff)(next(iter))();
                        };
                        return Data_Functor["void"](Control_Monad_Eff.functorEff)(Control_Monad_ST.writeSTRef(v)(true))();
                    })();
                };
                return {};
            };
        };
    };
};
var pushAll = pushWhile(Data_Function["const"](true));
var iterator = function (f) {
    return Data_Functor.map(Control_Monad_Eff.functorEff)(Iterator.create(f))(Control_Monad_ST.newSTRef(0));
};
var iterate = function (iter) {
    return function (f) {
        return function __do() {
            var v = Control_Monad_ST.newSTRef(false)();
            while (Data_Functor.map(Control_Monad_Eff.functorEff)(Data_HeytingAlgebra.not(Data_HeytingAlgebra.heytingAlgebraBoolean))(Control_Monad_ST.readSTRef(v))()) {
                (function __do() {
                    var v1 = next(iter)();
                    if (v1 instanceof Data_Maybe.Just) {
                        return f(v1.value0)();
                    };
                    if (v1 instanceof Data_Maybe.Nothing) {
                        return Data_Functor["void"](Control_Monad_Eff.functorEff)(Control_Monad_ST.writeSTRef(v)(true))();
                    };
                    throw new Error("Failed pattern match at Data.Array.ST.Iterator line 39, column 5 - line 41, column 46: " + [ v1.constructor.name ]);
                })();
            };
            return {};
        };
    };
};
var exhausted = function ($27) {
    return Data_Functor.map(Control_Monad_Eff.functorEff)(Data_Maybe.isNothing)(peek($27));
};
module.exports = {
    iterator: iterator,
    iterate: iterate,
    next: next,
    peek: peek,
    exhausted: exhausted,
    pushWhile: pushWhile,
    pushAll: pushAll
};

},{"../Control.Applicative":35,"../Control.Bind":41,"../Control.Monad.Eff":54,"../Control.Monad.ST":57,"../Control.Semigroupoid":61,"../Data.Array.ST":66,"../Data.Function":95,"../Data.Functor":98,"../Data.HeytingAlgebra":104,"../Data.Maybe":108,"../Data.Semiring":132,"../Prelude":152}],65:[function(require,module,exports){
"use strict";

exports.runSTArray = function (f) {
  return f;
};

exports.emptySTArray = function () {
  return [];
};

exports.peekSTArrayImpl = function (just) {
  return function (nothing) {
    return function (xs) {
      return function (i) {
        return function () {
          return i >= 0 && i < xs.length ? just(xs[i]) : nothing;
        };
      };
    };
  };
};

exports.pokeSTArray = function (xs) {
  return function (i) {
    return function (a) {
      return function () {
        var ret = i >= 0 && i < xs.length;
        if (ret) xs[i] = a;
        return ret;
      };
    };
  };
};

exports.pushAllSTArray = function (xs) {
  return function (as) {
    return function () {
      return xs.push.apply(xs, as);
    };
  };
};

exports.spliceSTArray = function (xs) {
  return function (i) {
    return function (howMany) {
      return function (bs) {
        return function () {
          return xs.splice.apply(xs, [i, howMany].concat(bs));
        };
      };
    };
  };
};

exports.copyImpl = function (xs) {
  return function () {
    return xs.slice();
  };
};

exports.toAssocArray = function (xs) {
  return function () {
    var n = xs.length;
    var as = new Array(n);
    for (var i = 0; i < n; i++) as[i] = { value: xs[i], index: i };
    return as;
  };
};

},{}],66:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var $foreign = require("./foreign");
var Control_Applicative = require("../Control.Applicative");
var Control_Bind = require("../Control.Bind");
var Control_Monad_Eff = require("../Control.Monad.Eff");
var Control_Monad_ST = require("../Control.Monad.ST");
var Control_Semigroupoid = require("../Control.Semigroupoid");
var Data_Maybe = require("../Data.Maybe");
var Prelude = require("../Prelude");
var Unsafe_Coerce = require("../Unsafe.Coerce");
var unsafeThaw = function ($7) {
    return Control_Applicative.pure(Control_Monad_Eff.applicativeEff)($7);
};
var unsafeFreeze = function ($8) {
    return Control_Applicative.pure(Control_Monad_Eff.applicativeEff)($8);
};
var thaw = $foreign.copyImpl;
var withArray = function (f) {
    return function (xs) {
        return function __do() {
            var v = thaw(xs)();
            var v1 = f(v)();
            return unsafeFreeze(v)();
        };
    };
};
var pushSTArray = function (arr) {
    return function (a) {
        return $foreign.pushAllSTArray(arr)([ a ]);
    };
};
var peekSTArray = $foreign.peekSTArrayImpl(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
var modifySTArray = function (xs) {
    return function (i) {
        return function (f) {
            return function __do() {
                var v = peekSTArray(xs)(i)();
                if (v instanceof Data_Maybe.Just) {
                    return $foreign.pokeSTArray(xs)(i)(f(v.value0))();
                };
                if (v instanceof Data_Maybe.Nothing) {
                    return false;
                };
                throw new Error("Failed pattern match at Data.Array.ST line 127, column 3 - line 129, column 26: " + [ v.constructor.name ]);
            };
        };
    };
};
var freeze = $foreign.copyImpl;
module.exports = {
    withArray: withArray,
    peekSTArray: peekSTArray,
    pushSTArray: pushSTArray,
    modifySTArray: modifySTArray,
    freeze: freeze,
    thaw: thaw,
    unsafeFreeze: unsafeFreeze,
    unsafeThaw: unsafeThaw,
    runSTArray: $foreign.runSTArray,
    emptySTArray: $foreign.emptySTArray,
    pokeSTArray: $foreign.pokeSTArray,
    pushAllSTArray: $foreign.pushAllSTArray,
    spliceSTArray: $foreign.spliceSTArray,
    toAssocArray: $foreign.toAssocArray
};

},{"../Control.Applicative":35,"../Control.Bind":41,"../Control.Monad.Eff":54,"../Control.Monad.ST":57,"../Control.Semigroupoid":61,"../Data.Maybe":108,"../Prelude":152,"../Unsafe.Coerce":164,"./foreign":65}],67:[function(require,module,exports){
"use strict";

//------------------------------------------------------------------------------
// Array creation --------------------------------------------------------------
//------------------------------------------------------------------------------

exports.range = function (start) {
  return function (end) {
    var step = start > end ? -1 : 1;
    var result = new Array(step * (end - start) + 1);
    var i = start, n = 0;
    while (i !== end) {
      result[n++] = i;
      i += step;
    }
    result[n] = i;
    return result;
  };
};

var replicate = function (count) {
  return function (value) {
    if (count < 1) {
      return [];
    }
    var result = new Array(count);
    return result.fill(value);
  };
};

var replicatePolyfill = function (count) {
  return function (value) {
    var result = [];
    var n = 0;
    for (var i = 0; i < count; i++) {
      result[n++] = value;
    }
    return result;
  };
};

// In browsers that have Array.prototype.fill we use it, as it's faster.
exports.replicate = typeof Array.prototype.fill === "function" ?
    replicate :
    replicatePolyfill;

exports.fromFoldableImpl = (function () {
  function Cons(head, tail) {
    this.head = head;
    this.tail = tail;
  }
  var emptyList = {};

  function curryCons(head) {
    return function (tail) {
      return new Cons(head, tail);
    };
  }

  function listToArray(list) {
    var result = [];
    var count = 0;
    var xs = list;
    while (xs !== emptyList) {
      result[count++] = xs.head;
      xs = xs.tail;
    }
    return result;
  }

  return function (foldr) {
    return function (xs) {
      return listToArray(foldr(curryCons)(emptyList)(xs));
    };
  };
})();

//------------------------------------------------------------------------------
// Array size ------------------------------------------------------------------
//------------------------------------------------------------------------------

exports.length = function (xs) {
  return xs.length;
};

//------------------------------------------------------------------------------
// Extending arrays ------------------------------------------------------------
//------------------------------------------------------------------------------

exports.cons = function (e) {
  return function (l) {
    return [e].concat(l);
  };
};

exports.snoc = function (l) {
  return function (e) {
    var l1 = l.slice();
    l1.push(e);
    return l1;
  };
};

//------------------------------------------------------------------------------
// Non-indexed reads -----------------------------------------------------------
//------------------------------------------------------------------------------

exports["uncons'"] = function (empty) {
  return function (next) {
    return function (xs) {
      return xs.length === 0 ? empty({}) : next(xs[0])(xs.slice(1));
    };
  };
};

//------------------------------------------------------------------------------
// Indexed operations ----------------------------------------------------------
//------------------------------------------------------------------------------

exports.indexImpl = function (just) {
  return function (nothing) {
    return function (xs) {
      return function (i) {
        return i < 0 || i >= xs.length ? nothing :  just(xs[i]);
      };
    };
  };
};

exports.findIndexImpl = function (just) {
  return function (nothing) {
    return function (f) {
      return function (xs) {
        for (var i = 0, l = xs.length; i < l; i++) {
          if (f(xs[i])) return just(i);
        }
        return nothing;
      };
    };
  };
};

exports.findLastIndexImpl = function (just) {
  return function (nothing) {
    return function (f) {
      return function (xs) {
        for (var i = xs.length - 1; i >= 0; i--) {
          if (f(xs[i])) return just(i);
        }
        return nothing;
      };
    };
  };
};

exports._insertAt = function (just) {
  return function (nothing) {
    return function (i) {
      return function (a) {
        return function (l) {
          if (i < 0 || i > l.length) return nothing;
          var l1 = l.slice();
          l1.splice(i, 0, a);
          return just(l1);
        };
      };
    };
  };
};

exports._deleteAt = function (just) {
  return function (nothing) {
    return function (i) {
      return function (l) {
        if (i < 0 || i >= l.length) return nothing;
        var l1 = l.slice();
        l1.splice(i, 1);
        return just(l1);
      };
    };
  };
};

exports._updateAt = function (just) {
  return function (nothing) {
    return function (i) {
      return function (a) {
        return function (l) {
          if (i < 0 || i >= l.length) return nothing;
          var l1 = l.slice();
          l1[i] = a;
          return just(l1);
        };
      };
    };
  };
};

//------------------------------------------------------------------------------
// Transformations -------------------------------------------------------------
//------------------------------------------------------------------------------

exports.reverse = function (l) {
  return l.slice().reverse();
};

exports.concat = function (xss) {
  if (xss.length <= 10000) {
    // This method is faster, but it crashes on big arrays.
    // So we use it when can and fallback to simple variant otherwise.
    return Array.prototype.concat.apply([], xss);
  }

  var result = [];
  for (var i = 0, l = xss.length; i < l; i++) {
    var xs = xss[i];
    for (var j = 0, m = xs.length; j < m; j++) {
      result.push(xs[j]);
    }
  }
  return result;
};

exports.filter = function (f) {
  return function (xs) {
    return xs.filter(f);
  };
};

exports.partition = function (f) {
  return function (xs) {
    var yes = [];
    var no  = [];
    for (var i = 0; i < xs.length; i++) {
      var x = xs[i];
      if (f(x))
        yes.push(x);
      else
        no.push(x);
    }
    return { yes: yes, no: no };
  };
};

//------------------------------------------------------------------------------
// Sorting ---------------------------------------------------------------------
//------------------------------------------------------------------------------

exports.sortImpl = function (f) {
  return function (l) {
    return l.slice().sort(function (x, y) {
      return f(x)(y);
    });
  };
};

//------------------------------------------------------------------------------
// Subarrays -------------------------------------------------------------------
//------------------------------------------------------------------------------

exports.slice = function (s) {
  return function (e) {
    return function (l) {
      return l.slice(s, e);
    };
  };
};

exports.take = function (n) {
  return function (l) {
    return n < 1 ? [] : l.slice(0, n);
  };
};

exports.drop = function (n) {
  return function (l) {
    return n < 1 ? l : l.slice(n);
  };
};

//------------------------------------------------------------------------------
// Zipping ---------------------------------------------------------------------
//------------------------------------------------------------------------------

exports.zipWith = function (f) {
  return function (xs) {
    return function (ys) {
      var l = xs.length < ys.length ? xs.length : ys.length;
      var result = new Array(l);
      for (var i = 0; i < l; i++) {
        result[i] = f(xs[i])(ys[i]);
      }
      return result;
    };
  };
};

//------------------------------------------------------------------------------
// Partial ---------------------------------------------------------------------
//------------------------------------------------------------------------------

exports.unsafeIndexImpl = function (xs) {
  return function (n) {
    return xs[n];
  };
};

},{}],68:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var $foreign = require("./foreign");
var Control_Alt = require("../Control.Alt");
var Control_Alternative = require("../Control.Alternative");
var Control_Applicative = require("../Control.Applicative");
var Control_Apply = require("../Control.Apply");
var Control_Bind = require("../Control.Bind");
var Control_Category = require("../Control.Category");
var Control_Lazy = require("../Control.Lazy");
var Control_Monad_Eff = require("../Control.Monad.Eff");
var Control_Monad_Rec_Class = require("../Control.Monad.Rec.Class");
var Control_Monad_ST = require("../Control.Monad.ST");
var Control_Semigroupoid = require("../Control.Semigroupoid");
var Data_Array_ST = require("../Data.Array.ST");
var Data_Array_ST_Iterator = require("../Data.Array.ST.Iterator");
var Data_Boolean = require("../Data.Boolean");
var Data_Eq = require("../Data.Eq");
var Data_Foldable = require("../Data.Foldable");
var Data_Function = require("../Data.Function");
var Data_Functor = require("../Data.Functor");
var Data_HeytingAlgebra = require("../Data.HeytingAlgebra");
var Data_Maybe = require("../Data.Maybe");
var Data_NonEmpty = require("../Data.NonEmpty");
var Data_Ord = require("../Data.Ord");
var Data_Ordering = require("../Data.Ordering");
var Data_Ring = require("../Data.Ring");
var Data_Semigroup = require("../Data.Semigroup");
var Data_Semiring = require("../Data.Semiring");
var Data_Traversable = require("../Data.Traversable");
var Data_Tuple = require("../Data.Tuple");
var Data_Unfoldable = require("../Data.Unfoldable");
var Partial_Unsafe = require("../Partial.Unsafe");
var Prelude = require("../Prelude");
var zipWithA = function (dictApplicative) {
    return function (f) {
        return function (xs) {
            return function (ys) {
                return Data_Traversable.sequence(Data_Traversable.traversableArray)(dictApplicative)($foreign.zipWith(f)(xs)(ys));
            };
        };
    };
};
var zip = $foreign.zipWith(Data_Tuple.Tuple.create);
var updateAtIndices = function (dictFoldable) {
    return function (us) {
        return function (xs) {
            return Control_Monad_ST.pureST(Data_Array_ST.withArray(function (res) {
                return Data_Foldable.traverse_(Control_Monad_Eff.applicativeEff)(dictFoldable)(Data_Tuple.uncurry(Data_Array_ST.pokeSTArray(res)))(us);
            })(xs));
        };
    };
};
var updateAt = $foreign._updateAt(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
var unsafeIndex = function (dictPartial) {
    return $foreign.unsafeIndexImpl;
};
var uncons = $foreign["uncons'"](Data_Function["const"](Data_Maybe.Nothing.value))(function (x) {
    return function (xs) {
        return new Data_Maybe.Just({
            head: x,
            tail: xs
        });
    };
});
var toUnfoldable = function (dictUnfoldable) {
    return function (xs) {
        var len = $foreign.length(xs);
        var f = function (i) {
            if (i < len) {
                return new Data_Maybe.Just(new Data_Tuple.Tuple(unsafeIndex()(xs)(i), i + 1 | 0));
            };
            if (Data_Boolean.otherwise) {
                return Data_Maybe.Nothing.value;
            };
            throw new Error("Failed pattern match at Data.Array line 139, column 3 - line 141, column 26: " + [ i.constructor.name ]);
        };
        return Data_Unfoldable.unfoldr(dictUnfoldable)(f)(0);
    };
};
var takeEnd = function (n) {
    return function (xs) {
        return $foreign.drop($foreign.length(xs) - n | 0)(xs);
    };
};
var tail = $foreign["uncons'"](Data_Function["const"](Data_Maybe.Nothing.value))(function (v) {
    return function (xs) {
        return new Data_Maybe.Just(xs);
    };
});
var sortBy = function (comp) {
    return function (xs) {
        var comp$prime = function (x) {
            return function (y) {
                var v = comp(x)(y);
                if (v instanceof Data_Ordering.GT) {
                    return 1;
                };
                if (v instanceof Data_Ordering.EQ) {
                    return 0;
                };
                if (v instanceof Data_Ordering.LT) {
                    return -1 | 0;
                };
                throw new Error("Failed pattern match at Data.Array line 698, column 15 - line 703, column 1: " + [ v.constructor.name ]);
            };
        };
        return $foreign.sortImpl(comp$prime)(xs);
    };
};
var sortWith = function (dictOrd) {
    return function (f) {
        return sortBy(Data_Ord.comparing(dictOrd)(f));
    };
};
var sort = function (dictOrd) {
    return function (xs) {
        return sortBy(Data_Ord.compare(dictOrd))(xs);
    };
};
var singleton = function (a) {
    return [ a ];
};
var $$null = function (xs) {
    return $foreign.length(xs) === 0;
};
var nubBy = function (eq) {
    return function (xs) {
        var v = uncons(xs);
        if (v instanceof Data_Maybe.Just) {
            return $foreign.cons(v.value0.head)(nubBy(eq)($foreign.filter(function (y) {
                return !eq(v.value0.head)(y);
            })(v.value0.tail)));
        };
        if (v instanceof Data_Maybe.Nothing) {
            return [  ];
        };
        throw new Error("Failed pattern match at Data.Array line 888, column 3 - line 890, column 18: " + [ v.constructor.name ]);
    };
};
var nub = function (dictEq) {
    return nubBy(Data_Eq.eq(dictEq));
};
var modifyAtIndices = function (dictFoldable) {
    return function (is) {
        return function (f) {
            return function (xs) {
                return Control_Monad_ST.pureST(Data_Array_ST.withArray(function (res) {
                    return Data_Foldable.traverse_(Control_Monad_Eff.applicativeEff)(dictFoldable)(function (i) {
                        return Data_Array_ST.modifySTArray(res)(i)(f);
                    })(is);
                })(xs));
            };
        };
    };
};
var mapWithIndex = function (f) {
    return function (xs) {
        return $foreign.zipWith(f)($foreign.range(0)($foreign.length(xs) - 1 | 0))(xs);
    };
};
var some = function (dictAlternative) {
    return function (dictLazy) {
        return function (v) {
            return Control_Apply.apply((dictAlternative.Applicative0()).Apply0())(Data_Functor.map(((dictAlternative.Plus1()).Alt0()).Functor0())($foreign.cons)(v))(Control_Lazy.defer(dictLazy)(function (v1) {
                return many(dictAlternative)(dictLazy)(v);
            }));
        };
    };
};
var many = function (dictAlternative) {
    return function (dictLazy) {
        return function (v) {
            return Control_Alt.alt((dictAlternative.Plus1()).Alt0())(some(dictAlternative)(dictLazy)(v))(Control_Applicative.pure(dictAlternative.Applicative0())([  ]));
        };
    };
};
var insertAt = $foreign._insertAt(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
var init = function (xs) {
    if ($$null(xs)) {
        return Data_Maybe.Nothing.value;
    };
    if (Data_Boolean.otherwise) {
        return new Data_Maybe.Just($foreign.slice(0)($foreign.length(xs) - 1 | 0)(xs));
    };
    throw new Error("Failed pattern match at Data.Array line 319, column 1 - line 319, column 45: " + [ xs.constructor.name ]);
};
var index = $foreign.indexImpl(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
var last = function (xs) {
    return index(xs)($foreign.length(xs) - 1 | 0);
};
var unsnoc = function (xs) {
    return Control_Apply.apply(Data_Maybe.applyMaybe)(Data_Functor.map(Data_Maybe.functorMaybe)(function (v) {
        return function (v1) {
            return {
                init: v,
                last: v1
            };
        };
    })(init(xs)))(last(xs));
};
var modifyAt = function (i) {
    return function (f) {
        return function (xs) {
            var go = function (x) {
                return updateAt(i)(f(x))(xs);
            };
            return Data_Maybe.maybe(Data_Maybe.Nothing.value)(go)(index(xs)(i));
        };
    };
};
var span = function (p) {
    return function (arr) {
        var go = function ($copy_i) {
            var $tco_done = false;
            var $tco_result;
            function $tco_loop(i) {
                var v = index(arr)(i);
                if (v instanceof Data_Maybe.Just) {
                    var $64 = p(v.value0);
                    if ($64) {
                        $copy_i = i + 1 | 0;
                        return;
                    };
                    $tco_done = true;
                    return new Data_Maybe.Just(i);
                };
                if (v instanceof Data_Maybe.Nothing) {
                    $tco_done = true;
                    return Data_Maybe.Nothing.value;
                };
                throw new Error("Failed pattern match at Data.Array line 830, column 5 - line 832, column 25: " + [ v.constructor.name ]);
            };
            while (!$tco_done) {
                $tco_result = $tco_loop($copy_i);
            };
            return $tco_result;
        };
        var breakIndex = go(0);
        if (breakIndex instanceof Data_Maybe.Just && breakIndex.value0 === 0) {
            return {
                init: [  ],
                rest: arr
            };
        };
        if (breakIndex instanceof Data_Maybe.Just) {
            return {
                init: $foreign.slice(0)(breakIndex.value0)(arr),
                rest: $foreign.slice(breakIndex.value0)($foreign.length(arr))(arr)
            };
        };
        if (breakIndex instanceof Data_Maybe.Nothing) {
            return {
                init: arr,
                rest: [  ]
            };
        };
        throw new Error("Failed pattern match at Data.Array line 817, column 3 - line 823, column 30: " + [ breakIndex.constructor.name ]);
    };
};
var takeWhile = function (p) {
    return function (xs) {
        return (span(p)(xs)).init;
    };
};
var unzip = function (xs) {
    return Control_Monad_ST.pureST(function __do() {
        var v = Data_Array_ST.emptySTArray();
        var v1 = Data_Array_ST.emptySTArray();
        var v2 = Data_Array_ST_Iterator.iterator(function (v2) {
            return index(xs)(v2);
        })();
        Data_Array_ST_Iterator.iterate(v2)(function (v3) {
            return function __do() {
                Data_Functor["void"](Control_Monad_Eff.functorEff)(Data_Array_ST.pushSTArray(v)(v3.value0))();
                return Data_Functor["void"](Control_Monad_Eff.functorEff)(Data_Array_ST.pushSTArray(v1)(v3.value1))();
            };
        })();
        var v3 = Data_Array_ST.unsafeFreeze(v)();
        var v4 = Data_Array_ST.unsafeFreeze(v1)();
        return new Data_Tuple.Tuple(v3, v4);
    });
};
var head = function (xs) {
    return index(xs)(0);
};
var groupBy = function (op) {
    return function (xs) {
        return Control_Monad_ST.pureST(function __do() {
            var v = Data_Array_ST.emptySTArray();
            var v1 = Data_Array_ST_Iterator.iterator(function (v1) {
                return index(xs)(v1);
            })();
            Data_Array_ST_Iterator.iterate(v1)(function (x) {
                return Data_Functor["void"](Control_Monad_Eff.functorEff)(function __do() {
                    var v2 = Data_Array_ST.emptySTArray();
                    Data_Array_ST_Iterator.pushWhile(op(x))(v1)(v2)();
                    var v3 = Data_Array_ST.unsafeFreeze(v2)();
                    return Data_Array_ST.pushSTArray(v)(new Data_NonEmpty.NonEmpty(x, v3))();
                });
            })();
            return Data_Array_ST.unsafeFreeze(v)();
        });
    };
};
var group = function (dictEq) {
    return function (xs) {
        return groupBy(Data_Eq.eq(dictEq))(xs);
    };
};
var group$prime = function (dictOrd) {
    return function ($93) {
        return group(dictOrd.Eq0())(sort(dictOrd)($93));
    };
};
var fromFoldable = function (dictFoldable) {
    return $foreign.fromFoldableImpl(Data_Foldable.foldr(dictFoldable));
};
var foldRecM = function (dictMonadRec) {
    return function (f) {
        return function (a) {
            return function (array) {
                var go = function (res) {
                    return function (i) {
                        if (i >= $foreign.length(array)) {
                            return Control_Applicative.pure((dictMonadRec.Monad0()).Applicative0())(new Control_Monad_Rec_Class.Done(res));
                        };
                        if (Data_Boolean.otherwise) {
                            return Control_Bind.bind((dictMonadRec.Monad0()).Bind1())(f(res)(unsafeIndex()(array)(i)))(function (v) {
                                return Control_Applicative.pure((dictMonadRec.Monad0()).Applicative0())(new Control_Monad_Rec_Class.Loop({
                                    a: v,
                                    b: i + 1 | 0
                                }));
                            });
                        };
                        throw new Error("Failed pattern match at Data.Array line 1057, column 3 - line 1061, column 42: " + [ res.constructor.name, i.constructor.name ]);
                    };
                };
                return Control_Monad_Rec_Class.tailRecM2(dictMonadRec)(go)(a)(0);
            };
        };
    };
};
var foldM = function (dictMonad) {
    return function (f) {
        return function (a) {
            return $foreign["uncons'"](function (v) {
                return Control_Applicative.pure(dictMonad.Applicative0())(a);
            })(function (b) {
                return function (bs) {
                    return Control_Bind.bind(dictMonad.Bind1())(f(a)(b))(function (a$prime) {
                        return foldM(dictMonad)(f)(a$prime)(bs);
                    });
                };
            });
        };
    };
};
var findLastIndex = $foreign.findLastIndexImpl(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
var insertBy = function (cmp) {
    return function (x) {
        return function (ys) {
            var i = Data_Maybe.maybe(0)(function (v) {
                return v + 1 | 0;
            })(findLastIndex(function (y) {
                return Data_Eq.eq(Data_Ordering.eqOrdering)(cmp(x)(y))(Data_Ordering.GT.value);
            })(ys));
            return Data_Maybe.fromJust()(insertAt(i)(x)(ys));
        };
    };
};
var insert = function (dictOrd) {
    return insertBy(Data_Ord.compare(dictOrd));
};
var findIndex = $foreign.findIndexImpl(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
var intersectBy = function (eq) {
    return function (xs) {
        return function (ys) {
            return $foreign.filter(function (x) {
                return Data_Maybe.isJust(findIndex(eq(x))(ys));
            })(xs);
        };
    };
};
var intersect = function (dictEq) {
    return intersectBy(Data_Eq.eq(dictEq));
};
var elemLastIndex = function (dictEq) {
    return function (x) {
        return findLastIndex(function (v) {
            return Data_Eq.eq(dictEq)(v)(x);
        });
    };
};
var elemIndex = function (dictEq) {
    return function (x) {
        return findIndex(function (v) {
            return Data_Eq.eq(dictEq)(v)(x);
        });
    };
};
var dropWhile = function (p) {
    return function (xs) {
        return (span(p)(xs)).rest;
    };
};
var dropEnd = function (n) {
    return function (xs) {
        return $foreign.take($foreign.length(xs) - n | 0)(xs);
    };
};
var deleteAt = $foreign._deleteAt(Data_Maybe.Just.create)(Data_Maybe.Nothing.value);
var deleteBy = function (v) {
    return function (v1) {
        return function (v2) {
            if (v2.length === 0) {
                return [  ];
            };
            return Data_Maybe.maybe(v2)(function (i) {
                return Data_Maybe.fromJust()(deleteAt(i)(v2));
            })(findIndex(v(v1))(v2));
        };
    };
};
var unionBy = function (eq) {
    return function (xs) {
        return function (ys) {
            return Data_Semigroup.append(Data_Semigroup.semigroupArray)(xs)(Data_Foldable.foldl(Data_Foldable.foldableArray)(Data_Function.flip(deleteBy(eq)))(nubBy(eq)(ys))(xs));
        };
    };
};
var union = function (dictEq) {
    return unionBy(Data_Eq.eq(dictEq));
};
var $$delete = function (dictEq) {
    return deleteBy(Data_Eq.eq(dictEq));
};
var difference = function (dictEq) {
    return Data_Foldable.foldr(Data_Foldable.foldableArray)($$delete(dictEq));
};
var concatMap = Data_Function.flip(Control_Bind.bind(Control_Bind.bindArray));
var mapMaybe = function (f) {
    return concatMap(function ($94) {
        return Data_Maybe.maybe([  ])(singleton)(f($94));
    });
};
var filterA = function (dictApplicative) {
    return function (p) {
        return function ($95) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(mapMaybe(function (v) {
                if (v.value1) {
                    return new Data_Maybe.Just(v.value0);
                };
                return Data_Maybe.Nothing.value;
            }))(Data_Traversable.traverse(Data_Traversable.traversableArray)(dictApplicative)(function (x) {
                return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Tuple.Tuple.create(x))(p(x));
            })($95));
        };
    };
};
var catMaybes = mapMaybe(Control_Category.id(Control_Category.categoryFn));
var alterAt = function (i) {
    return function (f) {
        return function (xs) {
            var go = function (x) {
                var v = f(x);
                if (v instanceof Data_Maybe.Nothing) {
                    return deleteAt(i)(xs);
                };
                if (v instanceof Data_Maybe.Just) {
                    return updateAt(i)(v.value0)(xs);
                };
                throw new Error("Failed pattern match at Data.Array line 540, column 10 - line 542, column 32: " + [ v.constructor.name ]);
            };
            return Data_Maybe.maybe(Data_Maybe.Nothing.value)(go)(index(xs)(i));
        };
    };
};
module.exports = {
    fromFoldable: fromFoldable,
    toUnfoldable: toUnfoldable,
    singleton: singleton,
    some: some,
    many: many,
    "null": $$null,
    insert: insert,
    insertBy: insertBy,
    head: head,
    last: last,
    tail: tail,
    init: init,
    uncons: uncons,
    unsnoc: unsnoc,
    index: index,
    elemIndex: elemIndex,
    elemLastIndex: elemLastIndex,
    findIndex: findIndex,
    findLastIndex: findLastIndex,
    insertAt: insertAt,
    deleteAt: deleteAt,
    updateAt: updateAt,
    updateAtIndices: updateAtIndices,
    modifyAt: modifyAt,
    modifyAtIndices: modifyAtIndices,
    alterAt: alterAt,
    concatMap: concatMap,
    filterA: filterA,
    mapMaybe: mapMaybe,
    catMaybes: catMaybes,
    mapWithIndex: mapWithIndex,
    sort: sort,
    sortBy: sortBy,
    sortWith: sortWith,
    takeEnd: takeEnd,
    takeWhile: takeWhile,
    dropEnd: dropEnd,
    dropWhile: dropWhile,
    span: span,
    group: group,
    "group'": group$prime,
    groupBy: groupBy,
    nub: nub,
    nubBy: nubBy,
    union: union,
    unionBy: unionBy,
    "delete": $$delete,
    deleteBy: deleteBy,
    difference: difference,
    intersect: intersect,
    intersectBy: intersectBy,
    zipWithA: zipWithA,
    zip: zip,
    unzip: unzip,
    foldM: foldM,
    foldRecM: foldRecM,
    unsafeIndex: unsafeIndex,
    range: $foreign.range,
    replicate: $foreign.replicate,
    length: $foreign.length,
    cons: $foreign.cons,
    snoc: $foreign.snoc,
    reverse: $foreign.reverse,
    concat: $foreign.concat,
    filter: $foreign.filter,
    partition: $foreign.partition,
    slice: $foreign.slice,
    take: $foreign.take,
    drop: $foreign.drop,
    zipWith: $foreign.zipWith
};

},{"../Control.Alt":33,"../Control.Alternative":34,"../Control.Applicative":35,"../Control.Apply":37,"../Control.Bind":41,"../Control.Category":42,"../Control.Lazy":46,"../Control.Monad.Eff":54,"../Control.Monad.Rec.Class":55,"../Control.Monad.ST":57,"../Control.Semigroupoid":61,"../Data.Array.ST":66,"../Data.Array.ST.Iterator":64,"../Data.Boolean":77,"../Data.Eq":86,"../Data.Foldable":91,"../Data.Function":95,"../Data.Functor":98,"../Data.HeytingAlgebra":104,"../Data.Maybe":108,"../Data.NonEmpty":118,"../Data.Ord":122,"../Data.Ordering":123,"../Data.Ring":127,"../Data.Semigroup":130,"../Data.Semiring":132,"../Data.Traversable":139,"../Data.Tuple":141,"../Data.Unfoldable":143,"../Partial.Unsafe":149,"../Prelude":152,"./foreign":67}],69:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Applicative = require("../Control.Applicative");
var Control_Apply = require("../Control.Apply");
var Control_Category = require("../Control.Category");
var Control_Semigroupoid = require("../Control.Semigroupoid");
var Data_Bifunctor_Clown = require("../Data.Bifunctor.Clown");
var Data_Bifunctor_Flip = require("../Data.Bifunctor.Flip");
var Data_Bifunctor_Joker = require("../Data.Bifunctor.Joker");
var Data_Bifunctor_Product = require("../Data.Bifunctor.Product");
var Data_Bifunctor_Wrap = require("../Data.Bifunctor.Wrap");
var Data_Foldable = require("../Data.Foldable");
var Data_Function = require("../Data.Function");
var Data_Monoid = require("../Data.Monoid");
var Data_Monoid_Conj = require("../Data.Monoid.Conj");
var Data_Monoid_Disj = require("../Data.Monoid.Disj");
var Data_Monoid_Dual = require("../Data.Monoid.Dual");
var Data_Monoid_Endo = require("../Data.Monoid.Endo");
var Data_Newtype = require("../Data.Newtype");
var Data_Semigroup = require("../Data.Semigroup");
var Data_Unit = require("../Data.Unit");
var Prelude = require("../Prelude");
var Bifoldable = function (bifoldMap, bifoldl, bifoldr) {
    this.bifoldMap = bifoldMap;
    this.bifoldl = bifoldl;
    this.bifoldr = bifoldr;
};
var bifoldr = function (dict) {
    return dict.bifoldr;
};
var bitraverse_ = function (dictBifoldable) {
    return function (dictApplicative) {
        return function (f) {
            return function (g) {
                return bifoldr(dictBifoldable)(function ($97) {
                    return Control_Apply.applySecond(dictApplicative.Apply0())(f($97));
                })(function ($98) {
                    return Control_Apply.applySecond(dictApplicative.Apply0())(g($98));
                })(Control_Applicative.pure(dictApplicative)(Data_Unit.unit));
            };
        };
    };
};
var bifor_ = function (dictBifoldable) {
    return function (dictApplicative) {
        return function (t) {
            return function (f) {
                return function (g) {
                    return bitraverse_(dictBifoldable)(dictApplicative)(f)(g)(t);
                };
            };
        };
    };
};
var bisequence_ = function (dictBifoldable) {
    return function (dictApplicative) {
        return bitraverse_(dictBifoldable)(dictApplicative)(Control_Category.id(Control_Category.categoryFn))(Control_Category.id(Control_Category.categoryFn));
    };
};
var bifoldl = function (dict) {
    return dict.bifoldl;
};
var bifoldableJoker = function (dictFoldable) {
    return new Bifoldable(function (dictMonoid) {
        return function (v) {
            return function (r) {
                return function (v1) {
                    return Data_Foldable.foldMap(dictFoldable)(dictMonoid)(r)(v1);
                };
            };
        };
    }, function (v) {
        return function (r) {
            return function (u) {
                return function (v1) {
                    return Data_Foldable.foldl(dictFoldable)(r)(u)(v1);
                };
            };
        };
    }, function (v) {
        return function (r) {
            return function (u) {
                return function (v1) {
                    return Data_Foldable.foldr(dictFoldable)(r)(u)(v1);
                };
            };
        };
    });
};
var bifoldableClown = function (dictFoldable) {
    return new Bifoldable(function (dictMonoid) {
        return function (l) {
            return function (v) {
                return function (v1) {
                    return Data_Foldable.foldMap(dictFoldable)(dictMonoid)(l)(v1);
                };
            };
        };
    }, function (l) {
        return function (v) {
            return function (u) {
                return function (v1) {
                    return Data_Foldable.foldl(dictFoldable)(l)(u)(v1);
                };
            };
        };
    }, function (l) {
        return function (v) {
            return function (u) {
                return function (v1) {
                    return Data_Foldable.foldr(dictFoldable)(l)(u)(v1);
                };
            };
        };
    });
};
var bifoldMapDefaultR = function (dictBifoldable) {
    return function (dictMonoid) {
        return function (f) {
            return function (g) {
                return bifoldr(dictBifoldable)(function ($99) {
                    return Data_Semigroup.append(dictMonoid.Semigroup0())(f($99));
                })(function ($100) {
                    return Data_Semigroup.append(dictMonoid.Semigroup0())(g($100));
                })(Data_Monoid.mempty(dictMonoid));
            };
        };
    };
};
var bifoldMapDefaultL = function (dictBifoldable) {
    return function (dictMonoid) {
        return function (f) {
            return function (g) {
                return bifoldl(dictBifoldable)(function (m) {
                    return function (a) {
                        return Data_Semigroup.append(dictMonoid.Semigroup0())(m)(f(a));
                    };
                })(function (m) {
                    return function (b) {
                        return Data_Semigroup.append(dictMonoid.Semigroup0())(m)(g(b));
                    };
                })(Data_Monoid.mempty(dictMonoid));
            };
        };
    };
};
var bifoldMap = function (dict) {
    return dict.bifoldMap;
};
var bifoldableFlip = function (dictBifoldable) {
    return new Bifoldable(function (dictMonoid) {
        return function (r) {
            return function (l) {
                return function (v) {
                    return bifoldMap(dictBifoldable)(dictMonoid)(l)(r)(v);
                };
            };
        };
    }, function (r) {
        return function (l) {
            return function (u) {
                return function (v) {
                    return bifoldl(dictBifoldable)(l)(r)(u)(v);
                };
            };
        };
    }, function (r) {
        return function (l) {
            return function (u) {
                return function (v) {
                    return bifoldr(dictBifoldable)(l)(r)(u)(v);
                };
            };
        };
    });
};
var bifoldableWrap = function (dictBifoldable) {
    return new Bifoldable(function (dictMonoid) {
        return function (l) {
            return function (r) {
                return function (v) {
                    return bifoldMap(dictBifoldable)(dictMonoid)(l)(r)(v);
                };
            };
        };
    }, function (l) {
        return function (r) {
            return function (u) {
                return function (v) {
                    return bifoldl(dictBifoldable)(l)(r)(u)(v);
                };
            };
        };
    }, function (l) {
        return function (r) {
            return function (u) {
                return function (v) {
                    return bifoldr(dictBifoldable)(l)(r)(u)(v);
                };
            };
        };
    });
};
var bifoldlDefault = function (dictBifoldable) {
    return function (f) {
        return function (g) {
            return function (z) {
                return function (p) {
                    return Data_Newtype.unwrap(Data_Monoid_Endo.newtypeEndo)(Data_Newtype.unwrap(Data_Monoid_Dual.newtypeDual)(bifoldMap(dictBifoldable)(Data_Monoid_Dual.monoidDual(Data_Monoid_Endo.monoidEndo))(function ($101) {
                        return Data_Monoid_Dual.Dual(Data_Monoid_Endo.Endo(Data_Function.flip(f)($101)));
                    })(function ($102) {
                        return Data_Monoid_Dual.Dual(Data_Monoid_Endo.Endo(Data_Function.flip(g)($102)));
                    })(p)))(z);
                };
            };
        };
    };
};
var bifoldrDefault = function (dictBifoldable) {
    return function (f) {
        return function (g) {
            return function (z) {
                return function (p) {
                    return Data_Newtype.unwrap(Data_Monoid_Endo.newtypeEndo)(bifoldMap(dictBifoldable)(Data_Monoid_Endo.monoidEndo)(function ($103) {
                        return Data_Monoid_Endo.Endo(f($103));
                    })(function ($104) {
                        return Data_Monoid_Endo.Endo(g($104));
                    })(p))(z);
                };
            };
        };
    };
};
var bifoldableProduct = function (dictBifoldable) {
    return function (dictBifoldable1) {
        return new Bifoldable(function (dictMonoid) {
            return function (l) {
                return function (r) {
                    return function (v) {
                        return Data_Semigroup.append(dictMonoid.Semigroup0())(bifoldMap(dictBifoldable)(dictMonoid)(l)(r)(v.value0))(bifoldMap(dictBifoldable1)(dictMonoid)(l)(r)(v.value1));
                    };
                };
            };
        }, function (l) {
            return function (r) {
                return function (u) {
                    return function (m) {
                        return bifoldlDefault(bifoldableProduct(dictBifoldable)(dictBifoldable1))(l)(r)(u)(m);
                    };
                };
            };
        }, function (l) {
            return function (r) {
                return function (u) {
                    return function (m) {
                        return bifoldrDefault(bifoldableProduct(dictBifoldable)(dictBifoldable1))(l)(r)(u)(m);
                    };
                };
            };
        });
    };
};
var bifold = function (dictBifoldable) {
    return function (dictMonoid) {
        return bifoldMap(dictBifoldable)(dictMonoid)(Control_Category.id(Control_Category.categoryFn))(Control_Category.id(Control_Category.categoryFn));
    };
};
var biany = function (dictBifoldable) {
    return function (dictBooleanAlgebra) {
        return function (p) {
            return function (q) {
                return function ($105) {
                    return Data_Newtype.unwrap(Data_Monoid_Disj.newtypeDisj)(bifoldMap(dictBifoldable)(Data_Monoid_Disj.monoidDisj(dictBooleanAlgebra.HeytingAlgebra0()))(function ($106) {
                        return Data_Monoid_Disj.Disj(p($106));
                    })(function ($107) {
                        return Data_Monoid_Disj.Disj(q($107));
                    })($105));
                };
            };
        };
    };
};
var biall = function (dictBifoldable) {
    return function (dictBooleanAlgebra) {
        return function (p) {
            return function (q) {
                return function ($108) {
                    return Data_Newtype.unwrap(Data_Monoid_Conj.newtypeConj)(bifoldMap(dictBifoldable)(Data_Monoid_Conj.monoidConj(dictBooleanAlgebra.HeytingAlgebra0()))(function ($109) {
                        return Data_Monoid_Conj.Conj(p($109));
                    })(function ($110) {
                        return Data_Monoid_Conj.Conj(q($110));
                    })($108));
                };
            };
        };
    };
};
module.exports = {
    bifoldMap: bifoldMap,
    bifoldl: bifoldl,
    bifoldr: bifoldr,
    Bifoldable: Bifoldable,
    bifoldrDefault: bifoldrDefault,
    bifoldlDefault: bifoldlDefault,
    bifoldMapDefaultR: bifoldMapDefaultR,
    bifoldMapDefaultL: bifoldMapDefaultL,
    bifold: bifold,
    bitraverse_: bitraverse_,
    bifor_: bifor_,
    bisequence_: bisequence_,
    biany: biany,
    biall: biall,
    bifoldableClown: bifoldableClown,
    bifoldableJoker: bifoldableJoker,
    bifoldableFlip: bifoldableFlip,
    bifoldableProduct: bifoldableProduct,
    bifoldableWrap: bifoldableWrap
};

},{"../Control.Applicative":35,"../Control.Apply":37,"../Control.Category":42,"../Control.Semigroupoid":61,"../Data.Bifunctor.Clown":70,"../Data.Bifunctor.Flip":71,"../Data.Bifunctor.Joker":72,"../Data.Bifunctor.Product":73,"../Data.Bifunctor.Wrap":74,"../Data.Foldable":91,"../Data.Function":95,"../Data.Monoid":115,"../Data.Monoid.Conj":110,"../Data.Monoid.Disj":111,"../Data.Monoid.Dual":112,"../Data.Monoid.Endo":113,"../Data.Newtype":117,"../Data.Semigroup":130,"../Data.Unit":145,"../Prelude":152}],70:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Applicative = require("../Control.Applicative");
var Control_Apply = require("../Control.Apply");
var Control_Biapplicative = require("../Control.Biapplicative");
var Control_Biapply = require("../Control.Biapply");
var Data_Bifunctor = require("../Data.Bifunctor");
var Data_Eq = require("../Data.Eq");
var Data_Functor = require("../Data.Functor");
var Data_Newtype = require("../Data.Newtype");
var Data_Ord = require("../Data.Ord");
var Data_Semigroup = require("../Data.Semigroup");
var Data_Show = require("../Data.Show");
var Prelude = require("../Prelude");
var Clown = function (x) {
    return x;
};
var showClown = function (dictShow) {
    return new Data_Show.Show(function (v) {
        return "(Clown " + (Data_Show.show(dictShow)(v) + ")");
    });
};
var ordClown = function (dictOrd) {
    return dictOrd;
};
var newtypeClown = new Data_Newtype.Newtype(function (n) {
    return n;
}, Clown);
var functorClown = new Data_Functor.Functor(function (v) {
    return function (v1) {
        return v1;
    };
});
var eqClown = function (dictEq) {
    return dictEq;
};
var bifunctorClown = function (dictFunctor) {
    return new Data_Bifunctor.Bifunctor(function (f) {
        return function (v) {
            return function (v1) {
                return Data_Functor.map(dictFunctor)(f)(v1);
            };
        };
    });
};
var biapplyClown = function (dictApply) {
    return new Control_Biapply.Biapply(function () {
        return bifunctorClown(dictApply.Functor0());
    }, function (v) {
        return function (v1) {
            return Control_Apply.apply(dictApply)(v)(v1);
        };
    });
};
var biapplicativeClown = function (dictApplicative) {
    return new Control_Biapplicative.Biapplicative(function () {
        return biapplyClown(dictApplicative.Apply0());
    }, function (a) {
        return function (v) {
            return Control_Applicative.pure(dictApplicative)(a);
        };
    });
};
module.exports = {
    Clown: Clown,
    newtypeClown: newtypeClown,
    eqClown: eqClown,
    ordClown: ordClown,
    showClown: showClown,
    functorClown: functorClown,
    bifunctorClown: bifunctorClown,
    biapplyClown: biapplyClown,
    biapplicativeClown: biapplicativeClown
};

},{"../Control.Applicative":35,"../Control.Apply":37,"../Control.Biapplicative":38,"../Control.Biapply":39,"../Data.Bifunctor":75,"../Data.Eq":86,"../Data.Functor":98,"../Data.Newtype":117,"../Data.Ord":122,"../Data.Semigroup":130,"../Data.Show":134,"../Prelude":152}],71:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Biapplicative = require("../Control.Biapplicative");
var Control_Biapply = require("../Control.Biapply");
var Data_Bifunctor = require("../Data.Bifunctor");
var Data_Eq = require("../Data.Eq");
var Data_Functor = require("../Data.Functor");
var Data_Newtype = require("../Data.Newtype");
var Data_Ord = require("../Data.Ord");
var Data_Semigroup = require("../Data.Semigroup");
var Data_Show = require("../Data.Show");
var Prelude = require("../Prelude");
var Flip = function (x) {
    return x;
};
var showFlip = function (dictShow) {
    return new Data_Show.Show(function (v) {
        return "(Flip " + (Data_Show.show(dictShow)(v) + ")");
    });
};
var ordFlip = function (dictOrd) {
    return dictOrd;
};
var newtypeFlip = new Data_Newtype.Newtype(function (n) {
    return n;
}, Flip);
var functorFlip = function (dictBifunctor) {
    return new Data_Functor.Functor(function (f) {
        return function (v) {
            return Data_Bifunctor.lmap(dictBifunctor)(f)(v);
        };
    });
};
var eqFlip = function (dictEq) {
    return dictEq;
};
var bifunctorFlip = function (dictBifunctor) {
    return new Data_Bifunctor.Bifunctor(function (f) {
        return function (g) {
            return function (v) {
                return Data_Bifunctor.bimap(dictBifunctor)(g)(f)(v);
            };
        };
    });
};
var biapplyFlip = function (dictBiapply) {
    return new Control_Biapply.Biapply(function () {
        return bifunctorFlip(dictBiapply.Bifunctor0());
    }, function (v) {
        return function (v1) {
            return Control_Biapply.biapply(dictBiapply)(v)(v1);
        };
    });
};
var biapplicativeFlip = function (dictBiapplicative) {
    return new Control_Biapplicative.Biapplicative(function () {
        return biapplyFlip(dictBiapplicative.Biapply0());
    }, function (a) {
        return function (b) {
            return Control_Biapplicative.bipure(dictBiapplicative)(b)(a);
        };
    });
};
module.exports = {
    Flip: Flip,
    newtypeFlip: newtypeFlip,
    eqFlip: eqFlip,
    ordFlip: ordFlip,
    showFlip: showFlip,
    functorFlip: functorFlip,
    bifunctorFlip: bifunctorFlip,
    biapplyFlip: biapplyFlip,
    biapplicativeFlip: biapplicativeFlip
};

},{"../Control.Biapplicative":38,"../Control.Biapply":39,"../Data.Bifunctor":75,"../Data.Eq":86,"../Data.Functor":98,"../Data.Newtype":117,"../Data.Ord":122,"../Data.Semigroup":130,"../Data.Show":134,"../Prelude":152}],72:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Applicative = require("../Control.Applicative");
var Control_Apply = require("../Control.Apply");
var Control_Biapplicative = require("../Control.Biapplicative");
var Control_Biapply = require("../Control.Biapply");
var Data_Bifunctor = require("../Data.Bifunctor");
var Data_Eq = require("../Data.Eq");
var Data_Functor = require("../Data.Functor");
var Data_Newtype = require("../Data.Newtype");
var Data_Ord = require("../Data.Ord");
var Data_Semigroup = require("../Data.Semigroup");
var Data_Show = require("../Data.Show");
var Prelude = require("../Prelude");
var Joker = function (x) {
    return x;
};
var showJoker = function (dictShow) {
    return new Data_Show.Show(function (v) {
        return "(Joker " + (Data_Show.show(dictShow)(v) + ")");
    });
};
var ordJoker = function (dictOrd) {
    return dictOrd;
};
var newtypeJoker = new Data_Newtype.Newtype(function (n) {
    return n;
}, Joker);
var functorJoker = function (dictFunctor) {
    return new Data_Functor.Functor(function (g) {
        return function (v) {
            return Data_Functor.map(dictFunctor)(g)(v);
        };
    });
};
var eqJoker = function (dictEq) {
    return dictEq;
};
var bifunctorJoker = function (dictFunctor) {
    return new Data_Bifunctor.Bifunctor(function (v) {
        return function (g) {
            return function (v1) {
                return Data_Functor.map(dictFunctor)(g)(v1);
            };
        };
    });
};
var biapplyJoker = function (dictApply) {
    return new Control_Biapply.Biapply(function () {
        return bifunctorJoker(dictApply.Functor0());
    }, function (v) {
        return function (v1) {
            return Control_Apply.apply(dictApply)(v)(v1);
        };
    });
};
var biapplicativeJoker = function (dictApplicative) {
    return new Control_Biapplicative.Biapplicative(function () {
        return biapplyJoker(dictApplicative.Apply0());
    }, function (v) {
        return function (b) {
            return Control_Applicative.pure(dictApplicative)(b);
        };
    });
};
module.exports = {
    Joker: Joker,
    newtypeJoker: newtypeJoker,
    eqJoker: eqJoker,
    ordJoker: ordJoker,
    showJoker: showJoker,
    functorJoker: functorJoker,
    bifunctorJoker: bifunctorJoker,
    biapplyJoker: biapplyJoker,
    biapplicativeJoker: biapplicativeJoker
};

},{"../Control.Applicative":35,"../Control.Apply":37,"../Control.Biapplicative":38,"../Control.Biapply":39,"../Data.Bifunctor":75,"../Data.Eq":86,"../Data.Functor":98,"../Data.Newtype":117,"../Data.Ord":122,"../Data.Semigroup":130,"../Data.Show":134,"../Prelude":152}],73:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Biapplicative = require("../Control.Biapplicative");
var Control_Biapply = require("../Control.Biapply");
var Data_Bifunctor = require("../Data.Bifunctor");
var Data_Eq = require("../Data.Eq");
var Data_HeytingAlgebra = require("../Data.HeytingAlgebra");
var Data_Ord = require("../Data.Ord");
var Data_Ordering = require("../Data.Ordering");
var Data_Semigroup = require("../Data.Semigroup");
var Data_Show = require("../Data.Show");
var Prelude = require("../Prelude");
var Product = (function () {
    function Product(value0, value1) {
        this.value0 = value0;
        this.value1 = value1;
    };
    Product.create = function (value0) {
        return function (value1) {
            return new Product(value0, value1);
        };
    };
    return Product;
})();
var showProduct = function (dictShow) {
    return function (dictShow1) {
        return new Data_Show.Show(function (v) {
            return "(Product " + (Data_Show.show(dictShow)(v.value0) + (" " + (Data_Show.show(dictShow1)(v.value1) + ")")));
        });
    };
};
var eqProduct = function (dictEq) {
    return function (dictEq1) {
        return new Data_Eq.Eq(function (x) {
            return function (y) {
                return Data_Eq.eq(dictEq)(x.value0)(y.value0) && Data_Eq.eq(dictEq1)(x.value1)(y.value1);
            };
        });
    };
};
var ordProduct = function (dictOrd) {
    return function (dictOrd1) {
        return new Data_Ord.Ord(function () {
            return eqProduct(dictOrd.Eq0())(dictOrd1.Eq0());
        }, function (x) {
            return function (y) {
                var v = Data_Ord.compare(dictOrd)(x.value0)(y.value0);
                if (v instanceof Data_Ordering.LT) {
                    return Data_Ordering.LT.value;
                };
                if (v instanceof Data_Ordering.GT) {
                    return Data_Ordering.GT.value;
                };
                return Data_Ord.compare(dictOrd1)(x.value1)(y.value1);
            };
        });
    };
};
var bifunctorProduct = function (dictBifunctor) {
    return function (dictBifunctor1) {
        return new Data_Bifunctor.Bifunctor(function (f) {
            return function (g) {
                return function (v) {
                    return new Product(Data_Bifunctor.bimap(dictBifunctor)(f)(g)(v.value0), Data_Bifunctor.bimap(dictBifunctor1)(f)(g)(v.value1));
                };
            };
        });
    };
};
var biapplyProduct = function (dictBiapply) {
    return function (dictBiapply1) {
        return new Control_Biapply.Biapply(function () {
            return bifunctorProduct(dictBiapply.Bifunctor0())(dictBiapply1.Bifunctor0());
        }, function (v) {
            return function (v1) {
                return new Product(Control_Biapply.biapply(dictBiapply)(v.value0)(v1.value0), Control_Biapply.biapply(dictBiapply1)(v.value1)(v1.value1));
            };
        });
    };
};
var biapplicativeProduct = function (dictBiapplicative) {
    return function (dictBiapplicative1) {
        return new Control_Biapplicative.Biapplicative(function () {
            return biapplyProduct(dictBiapplicative.Biapply0())(dictBiapplicative1.Biapply0());
        }, function (a) {
            return function (b) {
                return new Product(Control_Biapplicative.bipure(dictBiapplicative)(a)(b), Control_Biapplicative.bipure(dictBiapplicative1)(a)(b));
            };
        });
    };
};
module.exports = {
    Product: Product,
    eqProduct: eqProduct,
    ordProduct: ordProduct,
    showProduct: showProduct,
    bifunctorProduct: bifunctorProduct,
    biapplyProduct: biapplyProduct,
    biapplicativeProduct: biapplicativeProduct
};

},{"../Control.Biapplicative":38,"../Control.Biapply":39,"../Data.Bifunctor":75,"../Data.Eq":86,"../Data.HeytingAlgebra":104,"../Data.Ord":122,"../Data.Ordering":123,"../Data.Semigroup":130,"../Data.Show":134,"../Prelude":152}],74:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Biapplicative = require("../Control.Biapplicative");
var Control_Biapply = require("../Control.Biapply");
var Data_Bifunctor = require("../Data.Bifunctor");
var Data_Eq = require("../Data.Eq");
var Data_Functor = require("../Data.Functor");
var Data_Newtype = require("../Data.Newtype");
var Data_Ord = require("../Data.Ord");
var Data_Semigroup = require("../Data.Semigroup");
var Data_Show = require("../Data.Show");
var Prelude = require("../Prelude");
var Wrap = function (x) {
    return x;
};
var showWrap = function (dictShow) {
    return new Data_Show.Show(function (v) {
        return "(Wrap " + (Data_Show.show(dictShow)(v) + ")");
    });
};
var ordWrap = function (dictOrd) {
    return dictOrd;
};
var newtypeWrap = new Data_Newtype.Newtype(function (n) {
    return n;
}, Wrap);
var functorWrap = function (dictBifunctor) {
    return new Data_Functor.Functor(function (f) {
        return function (v) {
            return Data_Bifunctor.rmap(dictBifunctor)(f)(v);
        };
    });
};
var eqWrap = function (dictEq) {
    return dictEq;
};
var bifunctorWrap = function (dictBifunctor) {
    return new Data_Bifunctor.Bifunctor(function (f) {
        return function (g) {
            return function (v) {
                return Data_Bifunctor.bimap(dictBifunctor)(f)(g)(v);
            };
        };
    });
};
var biapplyWrap = function (dictBiapply) {
    return new Control_Biapply.Biapply(function () {
        return bifunctorWrap(dictBiapply.Bifunctor0());
    }, function (v) {
        return function (v1) {
            return Control_Biapply.biapply(dictBiapply)(v)(v1);
        };
    });
};
var biapplicativeWrap = function (dictBiapplicative) {
    return new Control_Biapplicative.Biapplicative(function () {
        return biapplyWrap(dictBiapplicative.Biapply0());
    }, function (a) {
        return function (b) {
            return Control_Biapplicative.bipure(dictBiapplicative)(a)(b);
        };
    });
};
module.exports = {
    Wrap: Wrap,
    newtypeWrap: newtypeWrap,
    eqWrap: eqWrap,
    ordWrap: ordWrap,
    showWrap: showWrap,
    functorWrap: functorWrap,
    bifunctorWrap: bifunctorWrap,
    biapplyWrap: biapplyWrap,
    biapplicativeWrap: biapplicativeWrap
};

},{"../Control.Biapplicative":38,"../Control.Biapply":39,"../Data.Bifunctor":75,"../Data.Eq":86,"../Data.Functor":98,"../Data.Newtype":117,"../Data.Ord":122,"../Data.Semigroup":130,"../Data.Show":134,"../Prelude":152}],75:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Category = require("../Control.Category");
var Bifunctor = function (bimap) {
    this.bimap = bimap;
};
var bimap = function (dict) {
    return dict.bimap;
};
var lmap = function (dictBifunctor) {
    return function (f) {
        return bimap(dictBifunctor)(f)(Control_Category.id(Control_Category.categoryFn));
    };
};
var rmap = function (dictBifunctor) {
    return bimap(dictBifunctor)(Control_Category.id(Control_Category.categoryFn));
};
module.exports = {
    bimap: bimap,
    Bifunctor: Bifunctor,
    lmap: lmap,
    rmap: rmap
};

},{"../Control.Category":42}],76:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Applicative = require("../Control.Applicative");
var Control_Apply = require("../Control.Apply");
var Control_Category = require("../Control.Category");
var Data_Bifoldable = require("../Data.Bifoldable");
var Data_Bifunctor = require("../Data.Bifunctor");
var Data_Bifunctor_Clown = require("../Data.Bifunctor.Clown");
var Data_Bifunctor_Flip = require("../Data.Bifunctor.Flip");
var Data_Bifunctor_Joker = require("../Data.Bifunctor.Joker");
var Data_Bifunctor_Product = require("../Data.Bifunctor.Product");
var Data_Bifunctor_Wrap = require("../Data.Bifunctor.Wrap");
var Data_Functor = require("../Data.Functor");
var Data_Traversable = require("../Data.Traversable");
var Prelude = require("../Prelude");
var Bitraversable = function (Bifoldable1, Bifunctor0, bisequence, bitraverse) {
    this.Bifoldable1 = Bifoldable1;
    this.Bifunctor0 = Bifunctor0;
    this.bisequence = bisequence;
    this.bitraverse = bitraverse;
};
var bitraverse = function (dict) {
    return dict.bitraverse;
};
var lfor = function (dictBitraversable) {
    return function (dictApplicative) {
        return function (t) {
            return function (f) {
                return bitraverse(dictBitraversable)(dictApplicative)(f)(Control_Applicative.pure(dictApplicative))(t);
            };
        };
    };
};
var ltraverse = function (dictBitraversable) {
    return function (dictApplicative) {
        return function (f) {
            return bitraverse(dictBitraversable)(dictApplicative)(f)(Control_Applicative.pure(dictApplicative));
        };
    };
};
var rfor = function (dictBitraversable) {
    return function (dictApplicative) {
        return function (t) {
            return function (f) {
                return bitraverse(dictBitraversable)(dictApplicative)(Control_Applicative.pure(dictApplicative))(f)(t);
            };
        };
    };
};
var rtraverse = function (dictBitraversable) {
    return function (dictApplicative) {
        return bitraverse(dictBitraversable)(dictApplicative)(Control_Applicative.pure(dictApplicative));
    };
};
var bitraversableJoker = function (dictTraversable) {
    return new Bitraversable(function () {
        return Data_Bifoldable.bifoldableJoker(dictTraversable.Foldable1());
    }, function () {
        return Data_Bifunctor_Joker.bifunctorJoker(dictTraversable.Functor0());
    }, function (dictApplicative) {
        return function (v) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Bifunctor_Joker.Joker)(Data_Traversable.sequence(dictTraversable)(dictApplicative)(v));
        };
    }, function (dictApplicative) {
        return function (v) {
            return function (r) {
                return function (v1) {
                    return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Bifunctor_Joker.Joker)(Data_Traversable.traverse(dictTraversable)(dictApplicative)(r)(v1));
                };
            };
        };
    });
};
var bitraversableClown = function (dictTraversable) {
    return new Bitraversable(function () {
        return Data_Bifoldable.bifoldableClown(dictTraversable.Foldable1());
    }, function () {
        return Data_Bifunctor_Clown.bifunctorClown(dictTraversable.Functor0());
    }, function (dictApplicative) {
        return function (v) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Bifunctor_Clown.Clown)(Data_Traversable.sequence(dictTraversable)(dictApplicative)(v));
        };
    }, function (dictApplicative) {
        return function (l) {
            return function (v) {
                return function (v1) {
                    return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Bifunctor_Clown.Clown)(Data_Traversable.traverse(dictTraversable)(dictApplicative)(l)(v1));
                };
            };
        };
    });
};
var bisequenceDefault = function (dictBitraversable) {
    return function (dictApplicative) {
        return bitraverse(dictBitraversable)(dictApplicative)(Control_Category.id(Control_Category.categoryFn))(Control_Category.id(Control_Category.categoryFn));
    };
};
var bisequence = function (dict) {
    return dict.bisequence;
};
var bitraversableFlip = function (dictBitraversable) {
    return new Bitraversable(function () {
        return Data_Bifoldable.bifoldableFlip(dictBitraversable.Bifoldable1());
    }, function () {
        return Data_Bifunctor_Flip.bifunctorFlip(dictBitraversable.Bifunctor0());
    }, function (dictApplicative) {
        return function (v) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Bifunctor_Flip.Flip)(bisequence(dictBitraversable)(dictApplicative)(v));
        };
    }, function (dictApplicative) {
        return function (r) {
            return function (l) {
                return function (v) {
                    return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Bifunctor_Flip.Flip)(bitraverse(dictBitraversable)(dictApplicative)(l)(r)(v));
                };
            };
        };
    });
};
var bitraversableProduct = function (dictBitraversable) {
    return function (dictBitraversable1) {
        return new Bitraversable(function () {
            return Data_Bifoldable.bifoldableProduct(dictBitraversable.Bifoldable1())(dictBitraversable1.Bifoldable1());
        }, function () {
            return Data_Bifunctor_Product.bifunctorProduct(dictBitraversable.Bifunctor0())(dictBitraversable1.Bifunctor0());
        }, function (dictApplicative) {
            return function (v) {
                return Control_Apply.apply(dictApplicative.Apply0())(Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Bifunctor_Product.Product.create)(bisequence(dictBitraversable)(dictApplicative)(v.value0)))(bisequence(dictBitraversable1)(dictApplicative)(v.value1));
            };
        }, function (dictApplicative) {
            return function (l) {
                return function (r) {
                    return function (v) {
                        return Control_Apply.apply(dictApplicative.Apply0())(Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Bifunctor_Product.Product.create)(bitraverse(dictBitraversable)(dictApplicative)(l)(r)(v.value0)))(bitraverse(dictBitraversable1)(dictApplicative)(l)(r)(v.value1));
                    };
                };
            };
        });
    };
};
var bitraversableWrap = function (dictBitraversable) {
    return new Bitraversable(function () {
        return Data_Bifoldable.bifoldableWrap(dictBitraversable.Bifoldable1());
    }, function () {
        return Data_Bifunctor_Wrap.bifunctorWrap(dictBitraversable.Bifunctor0());
    }, function (dictApplicative) {
        return function (v) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Bifunctor_Wrap.Wrap)(bisequence(dictBitraversable)(dictApplicative)(v));
        };
    }, function (dictApplicative) {
        return function (l) {
            return function (r) {
                return function (v) {
                    return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Bifunctor_Wrap.Wrap)(bitraverse(dictBitraversable)(dictApplicative)(l)(r)(v));
                };
            };
        };
    });
};
var bitraverseDefault = function (dictBitraversable) {
    return function (dictApplicative) {
        return function (f) {
            return function (g) {
                return function (t) {
                    return bisequence(dictBitraversable)(dictApplicative)(Data_Bifunctor.bimap(dictBitraversable.Bifunctor0())(f)(g)(t));
                };
            };
        };
    };
};
var bifor = function (dictBitraversable) {
    return function (dictApplicative) {
        return function (t) {
            return function (f) {
                return function (g) {
                    return bitraverse(dictBitraversable)(dictApplicative)(f)(g)(t);
                };
            };
        };
    };
};
module.exports = {
    Bitraversable: Bitraversable,
    bitraverse: bitraverse,
    bisequence: bisequence,
    bitraverseDefault: bitraverseDefault,
    bisequenceDefault: bisequenceDefault,
    ltraverse: ltraverse,
    rtraverse: rtraverse,
    bifor: bifor,
    lfor: lfor,
    rfor: rfor,
    bitraversableClown: bitraversableClown,
    bitraversableJoker: bitraversableJoker,
    bitraversableFlip: bitraversableFlip,
    bitraversableProduct: bitraversableProduct,
    bitraversableWrap: bitraversableWrap
};

},{"../Control.Applicative":35,"../Control.Apply":37,"../Control.Category":42,"../Data.Bifoldable":69,"../Data.Bifunctor":75,"../Data.Bifunctor.Clown":70,"../Data.Bifunctor.Flip":71,"../Data.Bifunctor.Joker":72,"../Data.Bifunctor.Product":73,"../Data.Bifunctor.Wrap":74,"../Data.Functor":98,"../Data.Traversable":139,"../Prelude":152}],77:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var otherwise = true;
module.exports = {
    otherwise: otherwise
};

},{}],78:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Data_HeytingAlgebra = require("../Data.HeytingAlgebra");
var Data_Unit = require("../Data.Unit");
var BooleanAlgebra = function (HeytingAlgebra0) {
    this.HeytingAlgebra0 = HeytingAlgebra0;
};
var booleanAlgebraUnit = new BooleanAlgebra(function () {
    return Data_HeytingAlgebra.heytingAlgebraUnit;
});
var booleanAlgebraFn = function (dictBooleanAlgebra) {
    return new BooleanAlgebra(function () {
        return Data_HeytingAlgebra.heytingAlgebraFunction(dictBooleanAlgebra.HeytingAlgebra0());
    });
};
var booleanAlgebraBoolean = new BooleanAlgebra(function () {
    return Data_HeytingAlgebra.heytingAlgebraBoolean;
});
module.exports = {
    BooleanAlgebra: BooleanAlgebra,
    booleanAlgebraBoolean: booleanAlgebraBoolean,
    booleanAlgebraUnit: booleanAlgebraUnit,
    booleanAlgebraFn: booleanAlgebraFn
};

},{"../Data.HeytingAlgebra":104,"../Data.Unit":145}],79:[function(require,module,exports){
"use strict";

exports.topInt = 2147483647;
exports.bottomInt = -2147483648;

exports.topChar = String.fromCharCode(65535);
exports.bottomChar = String.fromCharCode(0);

},{}],80:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var $foreign = require("./foreign");
var Data_Ord = require("../Data.Ord");
var Data_Ordering = require("../Data.Ordering");
var Data_Unit = require("../Data.Unit");
var Bounded = function (Ord0, bottom, top) {
    this.Ord0 = Ord0;
    this.bottom = bottom;
    this.top = top;
};
var top = function (dict) {
    return dict.top;
};
var boundedUnit = new Bounded(function () {
    return Data_Ord.ordUnit;
}, Data_Unit.unit, Data_Unit.unit);
var boundedOrdering = new Bounded(function () {
    return Data_Ord.ordOrdering;
}, Data_Ordering.LT.value, Data_Ordering.GT.value);
var boundedInt = new Bounded(function () {
    return Data_Ord.ordInt;
}, $foreign.bottomInt, $foreign.topInt);
var boundedChar = new Bounded(function () {
    return Data_Ord.ordChar;
}, $foreign.bottomChar, $foreign.topChar);
var boundedBoolean = new Bounded(function () {
    return Data_Ord.ordBoolean;
}, false, true);
var bottom = function (dict) {
    return dict.bottom;
};
module.exports = {
    Bounded: Bounded,
    bottom: bottom,
    top: top,
    boundedBoolean: boundedBoolean,
    boundedInt: boundedInt,
    boundedChar: boundedChar,
    boundedOrdering: boundedOrdering,
    boundedUnit: boundedUnit
};

},{"../Data.Ord":122,"../Data.Ordering":123,"../Data.Unit":145,"./foreign":79}],81:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Data_Ring = require("../Data.Ring");
var Data_Semiring = require("../Data.Semiring");
var Data_Unit = require("../Data.Unit");
var CommutativeRing = function (Ring0) {
    this.Ring0 = Ring0;
};
var commutativeRingUnit = new CommutativeRing(function () {
    return Data_Ring.ringUnit;
});
var commutativeRingNumber = new CommutativeRing(function () {
    return Data_Ring.ringNumber;
});
var commutativeRingInt = new CommutativeRing(function () {
    return Data_Ring.ringInt;
});
var commutativeRingFn = function (dictCommutativeRing) {
    return new CommutativeRing(function () {
        return Data_Ring.ringFn(dictCommutativeRing.Ring0());
    });
};
module.exports = {
    CommutativeRing: CommutativeRing,
    commutativeRingInt: commutativeRingInt,
    commutativeRingNumber: commutativeRingNumber,
    commutativeRingUnit: commutativeRingUnit,
    commutativeRingFn: commutativeRingFn
};

},{"../Data.Ring":127,"../Data.Semiring":132,"../Data.Unit":145}],82:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Category = require("../Control.Category");
var Control_Semigroupoid = require("../Control.Semigroupoid");
var Data_Function = require("../Data.Function");
var Data_Functor = require("../Data.Functor");
var Data_Identity = require("../Data.Identity");
var Data_Newtype = require("../Data.Newtype");
var Prelude = require("../Prelude");
var Distributive = function (Functor0, collect, distribute) {
    this.Functor0 = Functor0;
    this.collect = collect;
    this.distribute = distribute;
};
var distributiveIdentity = new Distributive(function () {
    return Data_Identity.functorIdentity;
}, function (dictFunctor) {
    return function (f) {
        return function ($11) {
            return Data_Identity.Identity(Data_Functor.map(dictFunctor)(function ($12) {
                return Data_Newtype.unwrap(Data_Identity.newtypeIdentity)(f($12));
            })($11));
        };
    };
}, function (dictFunctor) {
    return function ($13) {
        return Data_Identity.Identity(Data_Functor.map(dictFunctor)(Data_Newtype.unwrap(Data_Identity.newtypeIdentity))($13));
    };
});
var distribute = function (dict) {
    return dict.distribute;
};
var distributiveFunction = new Distributive(function () {
    return Data_Functor.functorFn;
}, function (dictFunctor) {
    return function (f) {
        return function ($14) {
            return distribute(distributiveFunction)(dictFunctor)(Data_Functor.map(dictFunctor)(f)($14));
        };
    };
}, function (dictFunctor) {
    return function (a) {
        return function (e) {
            return Data_Functor.map(dictFunctor)(function (v) {
                return v(e);
            })(a);
        };
    };
});
var cotraverse = function (dictDistributive) {
    return function (dictFunctor) {
        return function (f) {
            return function ($15) {
                return Data_Functor.map(dictDistributive.Functor0())(f)(distribute(dictDistributive)(dictFunctor)($15));
            };
        };
    };
};
var collectDefault = function (dictDistributive) {
    return function (dictFunctor) {
        return function (f) {
            return function ($16) {
                return distribute(dictDistributive)(dictFunctor)(Data_Functor.map(dictFunctor)(f)($16));
            };
        };
    };
};
var collect = function (dict) {
    return dict.collect;
};
var distributeDefault = function (dictDistributive) {
    return function (dictFunctor) {
        return collect(dictDistributive)(dictFunctor)(Control_Category.id(Control_Category.categoryFn));
    };
};
module.exports = {
    collect: collect,
    distribute: distribute,
    Distributive: Distributive,
    distributeDefault: distributeDefault,
    collectDefault: collectDefault,
    cotraverse: cotraverse,
    distributiveIdentity: distributiveIdentity,
    distributiveFunction: distributiveFunction
};

},{"../Control.Category":42,"../Control.Semigroupoid":61,"../Data.Function":95,"../Data.Functor":98,"../Data.Identity":105,"../Data.Newtype":117,"../Prelude":152}],83:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Data_EuclideanRing = require("../Data.EuclideanRing");
var Data_Ring = require("../Data.Ring");
var Data_Semiring = require("../Data.Semiring");
var DivisionRing = function (Ring0, recip) {
    this.Ring0 = Ring0;
    this.recip = recip;
};
var recip = function (dict) {
    return dict.recip;
};
var rightDiv = function (dictDivisionRing) {
    return function (a) {
        return function (b) {
            return Data_Semiring.mul((dictDivisionRing.Ring0()).Semiring0())(a)(recip(dictDivisionRing)(b));
        };
    };
};
var leftDiv = function (dictDivisionRing) {
    return function (a) {
        return function (b) {
            return Data_Semiring.mul((dictDivisionRing.Ring0()).Semiring0())(recip(dictDivisionRing)(b))(a);
        };
    };
};
var divisionringNumber = new DivisionRing(function () {
    return Data_Ring.ringNumber;
}, function (x) {
    return 1.0 / x;
});
module.exports = {
    DivisionRing: DivisionRing,
    recip: recip,
    leftDiv: leftDiv,
    rightDiv: rightDiv,
    divisionringNumber: divisionringNumber
};

},{"../Data.EuclideanRing":88,"../Data.Ring":127,"../Data.Semiring":132}],84:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Alt = require("../Control.Alt");
var Control_Applicative = require("../Control.Applicative");
var Control_Apply = require("../Control.Apply");
var Control_Bind = require("../Control.Bind");
var Control_Extend = require("../Control.Extend");
var Control_Monad = require("../Control.Monad");
var Data_Bifoldable = require("../Data.Bifoldable");
var Data_Bifunctor = require("../Data.Bifunctor");
var Data_Bitraversable = require("../Data.Bitraversable");
var Data_Bounded = require("../Data.Bounded");
var Data_Eq = require("../Data.Eq");
var Data_Foldable = require("../Data.Foldable");
var Data_Function = require("../Data.Function");
var Data_Functor = require("../Data.Functor");
var Data_Functor_Invariant = require("../Data.Functor.Invariant");
var Data_Maybe = require("../Data.Maybe");
var Data_Monoid = require("../Data.Monoid");
var Data_Ord = require("../Data.Ord");
var Data_Ordering = require("../Data.Ordering");
var Data_Semigroup = require("../Data.Semigroup");
var Data_Semiring = require("../Data.Semiring");
var Data_Show = require("../Data.Show");
var Data_Traversable = require("../Data.Traversable");
var Prelude = require("../Prelude");
var Left = (function () {
    function Left(value0) {
        this.value0 = value0;
    };
    Left.create = function (value0) {
        return new Left(value0);
    };
    return Left;
})();
var Right = (function () {
    function Right(value0) {
        this.value0 = value0;
    };
    Right.create = function (value0) {
        return new Right(value0);
    };
    return Right;
})();
var showEither = function (dictShow) {
    return function (dictShow1) {
        return new Data_Show.Show(function (v) {
            if (v instanceof Left) {
                return "(Left " + (Data_Show.show(dictShow)(v.value0) + ")");
            };
            if (v instanceof Right) {
                return "(Right " + (Data_Show.show(dictShow1)(v.value0) + ")");
            };
            throw new Error("Failed pattern match at Data.Either line 160, column 1 - line 160, column 61: " + [ v.constructor.name ]);
        });
    };
};
var note = function (a) {
    return Data_Maybe.maybe(new Left(a))(Right.create);
};
var functorEither = new Data_Functor.Functor(function (v) {
    return function (v1) {
        if (v1 instanceof Left) {
            return new Left(v1.value0);
        };
        if (v1 instanceof Right) {
            return new Right(v(v1.value0));
        };
        throw new Error("Failed pattern match at Data.Either line 36, column 1 - line 36, column 45: " + [ v.constructor.name, v1.constructor.name ]);
    };
});
var invariantEither = new Data_Functor_Invariant.Invariant(Data_Functor_Invariant.imapF(functorEither));
var fromRight = function (dictPartial) {
    return function (v) {
        var __unused = function (dictPartial1) {
            return function ($dollar62) {
                return $dollar62;
            };
        };
        return __unused(dictPartial)((function () {
            if (v instanceof Right) {
                return v.value0;
            };
            throw new Error("Failed pattern match at Data.Either line 252, column 1 - line 252, column 52: " + [ v.constructor.name ]);
        })());
    };
};
var fromLeft = function (dictPartial) {
    return function (v) {
        var __unused = function (dictPartial1) {
            return function ($dollar66) {
                return $dollar66;
            };
        };
        return __unused(dictPartial)((function () {
            if (v instanceof Left) {
                return v.value0;
            };
            throw new Error("Failed pattern match at Data.Either line 247, column 1 - line 247, column 51: " + [ v.constructor.name ]);
        })());
    };
};
var foldableEither = new Data_Foldable.Foldable(function (dictMonoid) {
    return function (f) {
        return function (v) {
            if (v instanceof Left) {
                return Data_Monoid.mempty(dictMonoid);
            };
            if (v instanceof Right) {
                return f(v.value0);
            };
            throw new Error("Failed pattern match at Data.Either line 184, column 1 - line 184, column 47: " + [ f.constructor.name, v.constructor.name ]);
        };
    };
}, function (v) {
    return function (z) {
        return function (v1) {
            if (v1 instanceof Left) {
                return z;
            };
            if (v1 instanceof Right) {
                return v(z)(v1.value0);
            };
            throw new Error("Failed pattern match at Data.Either line 184, column 1 - line 184, column 47: " + [ v.constructor.name, z.constructor.name, v1.constructor.name ]);
        };
    };
}, function (v) {
    return function (z) {
        return function (v1) {
            if (v1 instanceof Left) {
                return z;
            };
            if (v1 instanceof Right) {
                return v(v1.value0)(z);
            };
            throw new Error("Failed pattern match at Data.Either line 184, column 1 - line 184, column 47: " + [ v.constructor.name, z.constructor.name, v1.constructor.name ]);
        };
    };
});
var traversableEither = new Data_Traversable.Traversable(function () {
    return foldableEither;
}, function () {
    return functorEither;
}, function (dictApplicative) {
    return function (v) {
        if (v instanceof Left) {
            return Control_Applicative.pure(dictApplicative)(new Left(v.value0));
        };
        if (v instanceof Right) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Right.create)(v.value0);
        };
        throw new Error("Failed pattern match at Data.Either line 200, column 1 - line 200, column 53: " + [ v.constructor.name ]);
    };
}, function (dictApplicative) {
    return function (v) {
        return function (v1) {
            if (v1 instanceof Left) {
                return Control_Applicative.pure(dictApplicative)(new Left(v1.value0));
            };
            if (v1 instanceof Right) {
                return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Right.create)(v(v1.value0));
            };
            throw new Error("Failed pattern match at Data.Either line 200, column 1 - line 200, column 53: " + [ v.constructor.name, v1.constructor.name ]);
        };
    };
});
var extendEither = new Control_Extend.Extend(function () {
    return functorEither;
}, function (v) {
    return function (v1) {
        if (v1 instanceof Left) {
            return new Left(v1.value0);
        };
        return new Right(v(v1));
    };
});
var eqEither = function (dictEq) {
    return function (dictEq1) {
        return new Data_Eq.Eq(function (x) {
            return function (y) {
                if (x instanceof Left && y instanceof Left) {
                    return Data_Eq.eq(dictEq)(x.value0)(y.value0);
                };
                if (x instanceof Right && y instanceof Right) {
                    return Data_Eq.eq(dictEq1)(x.value0)(y.value0);
                };
                return false;
            };
        });
    };
};
var ordEither = function (dictOrd) {
    return function (dictOrd1) {
        return new Data_Ord.Ord(function () {
            return eqEither(dictOrd.Eq0())(dictOrd1.Eq0());
        }, function (x) {
            return function (y) {
                if (x instanceof Left && y instanceof Left) {
                    return Data_Ord.compare(dictOrd)(x.value0)(y.value0);
                };
                if (x instanceof Left) {
                    return Data_Ordering.LT.value;
                };
                if (y instanceof Left) {
                    return Data_Ordering.GT.value;
                };
                if (x instanceof Right && y instanceof Right) {
                    return Data_Ord.compare(dictOrd1)(x.value0)(y.value0);
                };
                throw new Error("Failed pattern match at Data.Either line 176, column 8 - line 176, column 64: " + [ x.constructor.name, y.constructor.name ]);
            };
        });
    };
};
var eq1Either = function (dictEq) {
    return new Data_Eq.Eq1(function (dictEq1) {
        return Data_Eq.eq(eqEither(dictEq)(dictEq1));
    });
};
var ord1Either = function (dictOrd) {
    return new Data_Ord.Ord1(function () {
        return eq1Either(dictOrd.Eq0());
    }, function (dictOrd1) {
        return Data_Ord.compare(ordEither(dictOrd)(dictOrd1));
    });
};
var either = function (v) {
    return function (v1) {
        return function (v2) {
            if (v2 instanceof Left) {
                return v(v2.value0);
            };
            if (v2 instanceof Right) {
                return v1(v2.value0);
            };
            throw new Error("Failed pattern match at Data.Either line 229, column 1 - line 229, column 64: " + [ v.constructor.name, v1.constructor.name, v2.constructor.name ]);
        };
    };
};
var hush = either(Data_Function["const"](Data_Maybe.Nothing.value))(Data_Maybe.Just.create);
var isLeft = either(Data_Function["const"](true))(Data_Function["const"](false));
var isRight = either(Data_Function["const"](false))(Data_Function["const"](true));
var choose = function (dictAlt) {
    return function (a) {
        return function (b) {
            return Control_Alt.alt(dictAlt)(Data_Functor.map(dictAlt.Functor0())(Left.create)(a))(Data_Functor.map(dictAlt.Functor0())(Right.create)(b));
        };
    };
};
var boundedEither = function (dictBounded) {
    return function (dictBounded1) {
        return new Data_Bounded.Bounded(function () {
            return ordEither(dictBounded.Ord0())(dictBounded1.Ord0());
        }, new Left(Data_Bounded.bottom(dictBounded)), new Right(Data_Bounded.top(dictBounded1)));
    };
};
var bifunctorEither = new Data_Bifunctor.Bifunctor(function (v) {
    return function (v1) {
        return function (v2) {
            if (v2 instanceof Left) {
                return new Left(v(v2.value0));
            };
            if (v2 instanceof Right) {
                return new Right(v1(v2.value0));
            };
            throw new Error("Failed pattern match at Data.Either line 43, column 1 - line 43, column 45: " + [ v.constructor.name, v1.constructor.name, v2.constructor.name ]);
        };
    };
});
var bifoldableEither = new Data_Bifoldable.Bifoldable(function (dictMonoid) {
    return function (v) {
        return function (v1) {
            return function (v2) {
                if (v2 instanceof Left) {
                    return v(v2.value0);
                };
                if (v2 instanceof Right) {
                    return v1(v2.value0);
                };
                throw new Error("Failed pattern match at Data.Either line 192, column 1 - line 192, column 47: " + [ v.constructor.name, v1.constructor.name, v2.constructor.name ]);
            };
        };
    };
}, function (v) {
    return function (v1) {
        return function (z) {
            return function (v2) {
                if (v2 instanceof Left) {
                    return v(z)(v2.value0);
                };
                if (v2 instanceof Right) {
                    return v1(z)(v2.value0);
                };
                throw new Error("Failed pattern match at Data.Either line 192, column 1 - line 192, column 47: " + [ v.constructor.name, v1.constructor.name, z.constructor.name, v2.constructor.name ]);
            };
        };
    };
}, function (v) {
    return function (v1) {
        return function (z) {
            return function (v2) {
                if (v2 instanceof Left) {
                    return v(v2.value0)(z);
                };
                if (v2 instanceof Right) {
                    return v1(v2.value0)(z);
                };
                throw new Error("Failed pattern match at Data.Either line 192, column 1 - line 192, column 47: " + [ v.constructor.name, v1.constructor.name, z.constructor.name, v2.constructor.name ]);
            };
        };
    };
});
var bitraversableEither = new Data_Bitraversable.Bitraversable(function () {
    return bifoldableEither;
}, function () {
    return bifunctorEither;
}, function (dictApplicative) {
    return function (v) {
        if (v instanceof Left) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Left.create)(v.value0);
        };
        if (v instanceof Right) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Right.create)(v.value0);
        };
        throw new Error("Failed pattern match at Data.Either line 206, column 1 - line 206, column 53: " + [ v.constructor.name ]);
    };
}, function (dictApplicative) {
    return function (v) {
        return function (v1) {
            return function (v2) {
                if (v2 instanceof Left) {
                    return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Left.create)(v(v2.value0));
                };
                if (v2 instanceof Right) {
                    return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Right.create)(v1(v2.value0));
                };
                throw new Error("Failed pattern match at Data.Either line 206, column 1 - line 206, column 53: " + [ v.constructor.name, v1.constructor.name, v2.constructor.name ]);
            };
        };
    };
});
var applyEither = new Control_Apply.Apply(function () {
    return functorEither;
}, function (v) {
    return function (v1) {
        if (v instanceof Left) {
            return new Left(v.value0);
        };
        if (v instanceof Right) {
            return Data_Functor.map(functorEither)(v.value0)(v1);
        };
        throw new Error("Failed pattern match at Data.Either line 79, column 1 - line 79, column 41: " + [ v.constructor.name, v1.constructor.name ]);
    };
});
var bindEither = new Control_Bind.Bind(function () {
    return applyEither;
}, either(function (e) {
    return function (v) {
        return new Left(e);
    };
})(function (a) {
    return function (f) {
        return f(a);
    };
}));
var semigroupEither = function (dictSemigroup) {
    return new Data_Semigroup.Semigroup(function (x) {
        return function (y) {
            return Control_Apply.apply(applyEither)(Data_Functor.map(functorEither)(Data_Semigroup.append(dictSemigroup))(x))(y);
        };
    });
};
var semiringEither = function (dictSemiring) {
    return new Data_Semiring.Semiring(function (x) {
        return function (y) {
            return Control_Apply.apply(applyEither)(Data_Functor.map(functorEither)(Data_Semiring.add(dictSemiring))(x))(y);
        };
    }, function (x) {
        return function (y) {
            return Control_Apply.apply(applyEither)(Data_Functor.map(functorEither)(Data_Semiring.mul(dictSemiring))(x))(y);
        };
    }, new Right(Data_Semiring.one(dictSemiring)), new Right(Data_Semiring.zero(dictSemiring)));
};
var applicativeEither = new Control_Applicative.Applicative(function () {
    return applyEither;
}, Right.create);
var monadEither = new Control_Monad.Monad(function () {
    return applicativeEither;
}, function () {
    return bindEither;
});
var altEither = new Control_Alt.Alt(function () {
    return functorEither;
}, function (v) {
    return function (v1) {
        if (v instanceof Left) {
            return v1;
        };
        return v;
    };
});
module.exports = {
    Left: Left,
    Right: Right,
    either: either,
    choose: choose,
    isLeft: isLeft,
    isRight: isRight,
    fromLeft: fromLeft,
    fromRight: fromRight,
    note: note,
    hush: hush,
    functorEither: functorEither,
    invariantEither: invariantEither,
    bifunctorEither: bifunctorEither,
    applyEither: applyEither,
    applicativeEither: applicativeEither,
    altEither: altEither,
    bindEither: bindEither,
    monadEither: monadEither,
    extendEither: extendEither,
    showEither: showEither,
    eqEither: eqEither,
    eq1Either: eq1Either,
    ordEither: ordEither,
    ord1Either: ord1Either,
    boundedEither: boundedEither,
    foldableEither: foldableEither,
    bifoldableEither: bifoldableEither,
    traversableEither: traversableEither,
    bitraversableEither: bitraversableEither,
    semiringEither: semiringEither,
    semigroupEither: semigroupEither
};

},{"../Control.Alt":33,"../Control.Applicative":35,"../Control.Apply":37,"../Control.Bind":41,"../Control.Extend":45,"../Control.Monad":58,"../Data.Bifoldable":69,"../Data.Bifunctor":75,"../Data.Bitraversable":76,"../Data.Bounded":80,"../Data.Eq":86,"../Data.Foldable":91,"../Data.Function":95,"../Data.Functor":98,"../Data.Functor.Invariant":96,"../Data.Maybe":108,"../Data.Monoid":115,"../Data.Ord":122,"../Data.Ordering":123,"../Data.Semigroup":130,"../Data.Semiring":132,"../Data.Show":134,"../Data.Traversable":139,"../Prelude":152}],85:[function(require,module,exports){
"use strict";

exports.refEq = function (r1) {
  return function (r2) {
    return r1 === r2;
  };
};

exports.eqArrayImpl = function (f) {
  return function (xs) {
    return function (ys) {
      if (xs.length !== ys.length) return false;
      for (var i = 0; i < xs.length; i++) {
        if (!f(xs[i])(ys[i])) return false;
      }
      return true;
    };
  };
};

},{}],86:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var $foreign = require("./foreign");
var Data_Unit = require("../Data.Unit");
var Data_Void = require("../Data.Void");
var Eq = function (eq) {
    this.eq = eq;
};
var Eq1 = function (eq1) {
    this.eq1 = eq1;
};
var eqVoid = new Eq(function (v) {
    return function (v1) {
        return true;
    };
});
var eqUnit = new Eq(function (v) {
    return function (v1) {
        return true;
    };
});
var eqString = new Eq($foreign.refEq);
var eqNumber = new Eq($foreign.refEq);
var eqInt = new Eq($foreign.refEq);
var eqChar = new Eq($foreign.refEq);
var eqBoolean = new Eq($foreign.refEq);
var eq1 = function (dict) {
    return dict.eq1;
};
var eq = function (dict) {
    return dict.eq;
};
var eqArray = function (dictEq) {
    return new Eq($foreign.eqArrayImpl(eq(dictEq)));
};
var eq1Array = new Eq1(function (dictEq) {
    return eq(eqArray(dictEq));
});
var notEq = function (dictEq) {
    return function (x) {
        return function (y) {
            return eq(eqBoolean)(eq(dictEq)(x)(y))(false);
        };
    };
};
var notEq1 = function (dictEq1) {
    return function (dictEq) {
        return function (x) {
            return function (y) {
                return eq(eqBoolean)(eq1(dictEq1)(dictEq)(x)(y))(false);
            };
        };
    };
};
module.exports = {
    Eq: Eq,
    eq: eq,
    notEq: notEq,
    Eq1: Eq1,
    eq1: eq1,
    notEq1: notEq1,
    eqBoolean: eqBoolean,
    eqInt: eqInt,
    eqNumber: eqNumber,
    eqChar: eqChar,
    eqString: eqString,
    eqUnit: eqUnit,
    eqVoid: eqVoid,
    eqArray: eqArray,
    eq1Array: eq1Array
};

},{"../Data.Unit":145,"../Data.Void":146,"./foreign":85}],87:[function(require,module,exports){
"use strict";

exports.intDegree = function (x) {
  return Math.min(Math.abs(x), 2147483647);
};

exports.intDiv = function (x) {
  return function (y) {
    /* jshint bitwise: false */
    return x / y | 0;
  };
};

exports.intMod = function (x) {
  return function (y) {
    return x % y;
  };
};

exports.numDiv = function (n1) {
  return function (n2) {
    return n1 / n2;
  };
};

},{}],88:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var $foreign = require("./foreign");
var Data_BooleanAlgebra = require("../Data.BooleanAlgebra");
var Data_CommutativeRing = require("../Data.CommutativeRing");
var Data_Eq = require("../Data.Eq");
var Data_HeytingAlgebra = require("../Data.HeytingAlgebra");
var Data_Ring = require("../Data.Ring");
var Data_Semiring = require("../Data.Semiring");
var EuclideanRing = function (CommutativeRing0, degree, div, mod) {
    this.CommutativeRing0 = CommutativeRing0;
    this.degree = degree;
    this.div = div;
    this.mod = mod;
};
var mod = function (dict) {
    return dict.mod;
};
var gcd = function ($copy_dictEq) {
    return function ($copy_dictEuclideanRing) {
        return function ($copy_a) {
            return function ($copy_b) {
                var $tco_var_dictEq = $copy_dictEq;
                var $tco_var_dictEuclideanRing = $copy_dictEuclideanRing;
                var $tco_var_a = $copy_a;
                var $tco_done = false;
                var $tco_result;
                function $tco_loop(dictEq, dictEuclideanRing, a, b) {
                    var $7 = Data_Eq.eq(dictEq)(b)(Data_Semiring.zero(((dictEuclideanRing.CommutativeRing0()).Ring0()).Semiring0()));
                    if ($7) {
                        $tco_done = true;
                        return a;
                    };
                    $tco_var_dictEq = dictEq;
                    $tco_var_dictEuclideanRing = dictEuclideanRing;
                    $tco_var_a = b;
                    $copy_b = mod(dictEuclideanRing)(a)(b);
                    return;
                };
                while (!$tco_done) {
                    $tco_result = $tco_loop($tco_var_dictEq, $tco_var_dictEuclideanRing, $tco_var_a, $copy_b);
                };
                return $tco_result;
            };
        };
    };
};
var euclideanRingNumber = new EuclideanRing(function () {
    return Data_CommutativeRing.commutativeRingNumber;
}, function (v) {
    return 1;
}, $foreign.numDiv, function (v) {
    return function (v1) {
        return 0.0;
    };
});
var euclideanRingInt = new EuclideanRing(function () {
    return Data_CommutativeRing.commutativeRingInt;
}, $foreign.intDegree, $foreign.intDiv, $foreign.intMod);
var div = function (dict) {
    return dict.div;
};
var lcm = function (dictEq) {
    return function (dictEuclideanRing) {
        return function (a) {
            return function (b) {
                var $8 = Data_Eq.eq(dictEq)(a)(Data_Semiring.zero(((dictEuclideanRing.CommutativeRing0()).Ring0()).Semiring0())) || Data_Eq.eq(dictEq)(b)(Data_Semiring.zero(((dictEuclideanRing.CommutativeRing0()).Ring0()).Semiring0()));
                if ($8) {
                    return Data_Semiring.zero(((dictEuclideanRing.CommutativeRing0()).Ring0()).Semiring0());
                };
                return div(dictEuclideanRing)(Data_Semiring.mul(((dictEuclideanRing.CommutativeRing0()).Ring0()).Semiring0())(a)(b))(gcd(dictEq)(dictEuclideanRing)(a)(b));
            };
        };
    };
};
var degree = function (dict) {
    return dict.degree;
};
module.exports = {
    EuclideanRing: EuclideanRing,
    degree: degree,
    div: div,
    mod: mod,
    gcd: gcd,
    lcm: lcm,
    euclideanRingInt: euclideanRingInt,
    euclideanRingNumber: euclideanRingNumber
};

},{"../Data.BooleanAlgebra":78,"../Data.CommutativeRing":81,"../Data.Eq":86,"../Data.HeytingAlgebra":104,"../Data.Ring":127,"../Data.Semiring":132,"./foreign":87}],89:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Data_CommutativeRing = require("../Data.CommutativeRing");
var Data_DivisionRing = require("../Data.DivisionRing");
var Data_EuclideanRing = require("../Data.EuclideanRing");
var Data_Ring = require("../Data.Ring");
var Data_Semiring = require("../Data.Semiring");
var Field = function (EuclideanRing0) {
    this.EuclideanRing0 = EuclideanRing0;
};
var fieldNumber = new Field(function () {
    return Data_EuclideanRing.euclideanRingNumber;
});
module.exports = {
    Field: Field,
    fieldNumber: fieldNumber
};

},{"../Data.CommutativeRing":81,"../Data.DivisionRing":83,"../Data.EuclideanRing":88,"../Data.Ring":127,"../Data.Semiring":132}],90:[function(require,module,exports){
"use strict";

exports.foldrArray = function (f) {
  return function (init) {
    return function (xs) {
      var acc = init;
      var len = xs.length;
      for (var i = len - 1; i >= 0; i--) {
        acc = f(xs[i])(acc);
      }
      return acc;
    };
  };
};

exports.foldlArray = function (f) {
  return function (init) {
    return function (xs) {
      var acc = init;
      var len = xs.length;
      for (var i = 0; i < len; i++) {
        acc = f(acc)(xs[i]);
      }
      return acc;
    };
  };
};

},{}],91:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var $foreign = require("./foreign");
var Control_Alt = require("../Control.Alt");
var Control_Applicative = require("../Control.Applicative");
var Control_Apply = require("../Control.Apply");
var Control_Bind = require("../Control.Bind");
var Control_Category = require("../Control.Category");
var Control_Plus = require("../Control.Plus");
var Control_Semigroupoid = require("../Control.Semigroupoid");
var Data_Eq = require("../Data.Eq");
var Data_Function = require("../Data.Function");
var Data_Functor = require("../Data.Functor");
var Data_HeytingAlgebra = require("../Data.HeytingAlgebra");
var Data_Maybe = require("../Data.Maybe");
var Data_Maybe_First = require("../Data.Maybe.First");
var Data_Maybe_Last = require("../Data.Maybe.Last");
var Data_Monoid = require("../Data.Monoid");
var Data_Monoid_Additive = require("../Data.Monoid.Additive");
var Data_Monoid_Conj = require("../Data.Monoid.Conj");
var Data_Monoid_Disj = require("../Data.Monoid.Disj");
var Data_Monoid_Dual = require("../Data.Monoid.Dual");
var Data_Monoid_Endo = require("../Data.Monoid.Endo");
var Data_Monoid_Multiplicative = require("../Data.Monoid.Multiplicative");
var Data_Newtype = require("../Data.Newtype");
var Data_Ord = require("../Data.Ord");
var Data_Ordering = require("../Data.Ordering");
var Data_Semigroup = require("../Data.Semigroup");
var Data_Semiring = require("../Data.Semiring");
var Data_Unit = require("../Data.Unit");
var Prelude = require("../Prelude");
var Foldable = function (foldMap, foldl, foldr) {
    this.foldMap = foldMap;
    this.foldl = foldl;
    this.foldr = foldr;
};
var foldr = function (dict) {
    return dict.foldr;
};
var indexr = function (dictFoldable) {
    return function (idx) {
        var go = function (a) {
            return function (cursor) {
                if (cursor.elem instanceof Data_Maybe.Just) {
                    return cursor;
                };
                var $106 = cursor.pos === idx;
                if ($106) {
                    return {
                        elem: new Data_Maybe.Just(a),
                        pos: cursor.pos
                    };
                };
                return {
                    pos: cursor.pos + 1 | 0,
                    elem: cursor.elem
                };
            };
        };
        return function ($193) {
            return (function (v) {
                return v.elem;
            })(foldr(dictFoldable)(go)({
                elem: Data_Maybe.Nothing.value,
                pos: 0
            })($193));
        };
    };
};
var $$null = function (dictFoldable) {
    return foldr(dictFoldable)(function (v) {
        return function (v1) {
            return false;
        };
    })(true);
};
var oneOf = function (dictFoldable) {
    return function (dictPlus) {
        return foldr(dictFoldable)(Control_Alt.alt(dictPlus.Alt0()))(Control_Plus.empty(dictPlus));
    };
};
var oneOfMap = function (dictFoldable) {
    return function (dictPlus) {
        return function (f) {
            return foldr(dictFoldable)(function ($194) {
                return Control_Alt.alt(dictPlus.Alt0())(f($194));
            })(Control_Plus.empty(dictPlus));
        };
    };
};
var traverse_ = function (dictApplicative) {
    return function (dictFoldable) {
        return function (f) {
            return foldr(dictFoldable)(function ($195) {
                return Control_Apply.applySecond(dictApplicative.Apply0())(f($195));
            })(Control_Applicative.pure(dictApplicative)(Data_Unit.unit));
        };
    };
};
var for_ = function (dictApplicative) {
    return function (dictFoldable) {
        return Data_Function.flip(traverse_(dictApplicative)(dictFoldable));
    };
};
var sequence_ = function (dictApplicative) {
    return function (dictFoldable) {
        return traverse_(dictApplicative)(dictFoldable)(Control_Category.id(Control_Category.categoryFn));
    };
};
var foldl = function (dict) {
    return dict.foldl;
};
var indexl = function (dictFoldable) {
    return function (idx) {
        var go = function (cursor) {
            return function (a) {
                if (cursor.elem instanceof Data_Maybe.Just) {
                    return cursor;
                };
                var $109 = cursor.pos === idx;
                if ($109) {
                    return {
                        elem: new Data_Maybe.Just(a),
                        pos: cursor.pos
                    };
                };
                return {
                    pos: cursor.pos + 1 | 0,
                    elem: cursor.elem
                };
            };
        };
        return function ($196) {
            return (function (v) {
                return v.elem;
            })(foldl(dictFoldable)(go)({
                elem: Data_Maybe.Nothing.value,
                pos: 0
            })($196));
        };
    };
};
var intercalate = function (dictFoldable) {
    return function (dictMonoid) {
        return function (sep) {
            return function (xs) {
                var go = function (v) {
                    return function (x) {
                        if (v.init) {
                            return {
                                init: false,
                                acc: x
                            };
                        };
                        return {
                            init: false,
                            acc: Data_Semigroup.append(dictMonoid.Semigroup0())(v.acc)(Data_Semigroup.append(dictMonoid.Semigroup0())(sep)(x))
                        };
                    };
                };
                return (foldl(dictFoldable)(go)({
                    init: true,
                    acc: Data_Monoid.mempty(dictMonoid)
                })(xs)).acc;
            };
        };
    };
};
var length = function (dictFoldable) {
    return function (dictSemiring) {
        return foldl(dictFoldable)(function (c) {
            return function (v) {
                return Data_Semiring.add(dictSemiring)(Data_Semiring.one(dictSemiring))(c);
            };
        })(Data_Semiring.zero(dictSemiring));
    };
};
var maximumBy = function (dictFoldable) {
    return function (cmp) {
        var max$prime = function (v) {
            return function (v1) {
                if (v instanceof Data_Maybe.Nothing) {
                    return new Data_Maybe.Just(v1);
                };
                if (v instanceof Data_Maybe.Just) {
                    return new Data_Maybe.Just((function () {
                        var $116 = Data_Eq.eq(Data_Ordering.eqOrdering)(cmp(v.value0)(v1))(Data_Ordering.GT.value);
                        if ($116) {
                            return v.value0;
                        };
                        return v1;
                    })());
                };
                throw new Error("Failed pattern match at Data.Foldable line 378, column 3 - line 378, column 27: " + [ v.constructor.name, v1.constructor.name ]);
            };
        };
        return foldl(dictFoldable)(max$prime)(Data_Maybe.Nothing.value);
    };
};
var maximum = function (dictOrd) {
    return function (dictFoldable) {
        return maximumBy(dictFoldable)(Data_Ord.compare(dictOrd));
    };
};
var minimumBy = function (dictFoldable) {
    return function (cmp) {
        var min$prime = function (v) {
            return function (v1) {
                if (v instanceof Data_Maybe.Nothing) {
                    return new Data_Maybe.Just(v1);
                };
                if (v instanceof Data_Maybe.Just) {
                    return new Data_Maybe.Just((function () {
                        var $120 = Data_Eq.eq(Data_Ordering.eqOrdering)(cmp(v.value0)(v1))(Data_Ordering.LT.value);
                        if ($120) {
                            return v.value0;
                        };
                        return v1;
                    })());
                };
                throw new Error("Failed pattern match at Data.Foldable line 391, column 3 - line 391, column 27: " + [ v.constructor.name, v1.constructor.name ]);
            };
        };
        return foldl(dictFoldable)(min$prime)(Data_Maybe.Nothing.value);
    };
};
var minimum = function (dictOrd) {
    return function (dictFoldable) {
        return minimumBy(dictFoldable)(Data_Ord.compare(dictOrd));
    };
};
var product = function (dictFoldable) {
    return function (dictSemiring) {
        return foldl(dictFoldable)(Data_Semiring.mul(dictSemiring))(Data_Semiring.one(dictSemiring));
    };
};
var sum = function (dictFoldable) {
    return function (dictSemiring) {
        return foldl(dictFoldable)(Data_Semiring.add(dictSemiring))(Data_Semiring.zero(dictSemiring));
    };
};
var foldableMultiplicative = new Foldable(function (dictMonoid) {
    return function (f) {
        return function (v) {
            return f(v);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return f(z)(v);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return f(v)(z);
        };
    };
});
var foldableMaybe = new Foldable(function (dictMonoid) {
    return function (f) {
        return function (v) {
            if (v instanceof Data_Maybe.Nothing) {
                return Data_Monoid.mempty(dictMonoid);
            };
            if (v instanceof Data_Maybe.Just) {
                return f(v.value0);
            };
            throw new Error("Failed pattern match at Data.Foldable line 131, column 1 - line 131, column 41: " + [ f.constructor.name, v.constructor.name ]);
        };
    };
}, function (v) {
    return function (z) {
        return function (v1) {
            if (v1 instanceof Data_Maybe.Nothing) {
                return z;
            };
            if (v1 instanceof Data_Maybe.Just) {
                return v(z)(v1.value0);
            };
            throw new Error("Failed pattern match at Data.Foldable line 131, column 1 - line 131, column 41: " + [ v.constructor.name, z.constructor.name, v1.constructor.name ]);
        };
    };
}, function (v) {
    return function (z) {
        return function (v1) {
            if (v1 instanceof Data_Maybe.Nothing) {
                return z;
            };
            if (v1 instanceof Data_Maybe.Just) {
                return v(v1.value0)(z);
            };
            throw new Error("Failed pattern match at Data.Foldable line 131, column 1 - line 131, column 41: " + [ v.constructor.name, z.constructor.name, v1.constructor.name ]);
        };
    };
});
var foldableDual = new Foldable(function (dictMonoid) {
    return function (f) {
        return function (v) {
            return f(v);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return f(z)(v);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return f(v)(z);
        };
    };
});
var foldableDisj = new Foldable(function (dictMonoid) {
    return function (f) {
        return function (v) {
            return f(v);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return f(z)(v);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return f(v)(z);
        };
    };
});
var foldableConj = new Foldable(function (dictMonoid) {
    return function (f) {
        return function (v) {
            return f(v);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return f(z)(v);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return f(v)(z);
        };
    };
});
var foldableAdditive = new Foldable(function (dictMonoid) {
    return function (f) {
        return function (v) {
            return f(v);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return f(z)(v);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return f(v)(z);
        };
    };
});
var foldMapDefaultR = function (dictFoldable) {
    return function (dictMonoid) {
        return function (f) {
            return foldr(dictFoldable)(function (x) {
                return function (acc) {
                    return Data_Semigroup.append(dictMonoid.Semigroup0())(f(x))(acc);
                };
            })(Data_Monoid.mempty(dictMonoid));
        };
    };
};
var foldableArray = new Foldable(function (dictMonoid) {
    return foldMapDefaultR(foldableArray)(dictMonoid);
}, $foreign.foldlArray, $foreign.foldrArray);
var foldMapDefaultL = function (dictFoldable) {
    return function (dictMonoid) {
        return function (f) {
            return foldl(dictFoldable)(function (acc) {
                return function (x) {
                    return Data_Semigroup.append(dictMonoid.Semigroup0())(acc)(f(x));
                };
            })(Data_Monoid.mempty(dictMonoid));
        };
    };
};
var foldMap = function (dict) {
    return dict.foldMap;
};
var foldableFirst = new Foldable(function (dictMonoid) {
    return function (f) {
        return function (v) {
            return foldMap(foldableMaybe)(dictMonoid)(f)(v);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return foldl(foldableMaybe)(f)(z)(v);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return foldr(foldableMaybe)(f)(z)(v);
        };
    };
});
var foldableLast = new Foldable(function (dictMonoid) {
    return function (f) {
        return function (v) {
            return foldMap(foldableMaybe)(dictMonoid)(f)(v);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return foldl(foldableMaybe)(f)(z)(v);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return foldr(foldableMaybe)(f)(z)(v);
        };
    };
});
var foldlDefault = function (dictFoldable) {
    return function (c) {
        return function (u) {
            return function (xs) {
                return Data_Newtype.unwrap(Data_Monoid_Endo.newtypeEndo)(Data_Newtype.unwrap(Data_Monoid_Dual.newtypeDual)(foldMap(dictFoldable)(Data_Monoid_Dual.monoidDual(Data_Monoid_Endo.monoidEndo))(function ($197) {
                    return Data_Monoid_Dual.Dual(Data_Monoid_Endo.Endo(Data_Function.flip(c)($197)));
                })(xs)))(u);
            };
        };
    };
};
var foldrDefault = function (dictFoldable) {
    return function (c) {
        return function (u) {
            return function (xs) {
                return Data_Newtype.unwrap(Data_Monoid_Endo.newtypeEndo)(foldMap(dictFoldable)(Data_Monoid_Endo.monoidEndo)(function ($198) {
                    return Data_Monoid_Endo.Endo(c($198));
                })(xs))(u);
            };
        };
    };
};
var surroundMap = function (dictFoldable) {
    return function (dictSemigroup) {
        return function (d) {
            return function (t) {
                return function (f) {
                    var joined = function (a) {
                        return function (m) {
                            return Data_Semigroup.append(dictSemigroup)(d)(Data_Semigroup.append(dictSemigroup)(t(a))(m));
                        };
                    };
                    return Data_Newtype.unwrap(Data_Monoid_Endo.newtypeEndo)(foldMap(dictFoldable)(Data_Monoid_Endo.monoidEndo)(joined)(f))(d);
                };
            };
        };
    };
};
var surround = function (dictFoldable) {
    return function (dictSemigroup) {
        return function (d) {
            return surroundMap(dictFoldable)(dictSemigroup)(d)(Control_Category.id(Control_Category.categoryFn));
        };
    };
};
var foldM = function (dictFoldable) {
    return function (dictMonad) {
        return function (f) {
            return function (a0) {
                return foldl(dictFoldable)(function (ma) {
                    return function (b) {
                        return Control_Bind.bind(dictMonad.Bind1())(ma)(Data_Function.flip(f)(b));
                    };
                })(Control_Applicative.pure(dictMonad.Applicative0())(a0));
            };
        };
    };
};
var fold = function (dictFoldable) {
    return function (dictMonoid) {
        return foldMap(dictFoldable)(dictMonoid)(Control_Category.id(Control_Category.categoryFn));
    };
};
var findMap = function (dictFoldable) {
    return function (p) {
        var go = function (v) {
            return function (v1) {
                if (v instanceof Data_Maybe.Nothing) {
                    return p(v1);
                };
                return v;
            };
        };
        return foldl(dictFoldable)(go)(Data_Maybe.Nothing.value);
    };
};
var find = function (dictFoldable) {
    return function (p) {
        var go = function (v) {
            return function (v1) {
                if (v instanceof Data_Maybe.Nothing && p(v1)) {
                    return new Data_Maybe.Just(v1);
                };
                return v;
            };
        };
        return foldl(dictFoldable)(go)(Data_Maybe.Nothing.value);
    };
};
var any = function (dictFoldable) {
    return function (dictHeytingAlgebra) {
        return Data_Newtype.alaF(Data_Functor.functorFn)(Data_Functor.functorFn)(Data_Monoid_Disj.newtypeDisj)(Data_Monoid_Disj.newtypeDisj)(Data_Monoid_Disj.Disj)(foldMap(dictFoldable)(Data_Monoid_Disj.monoidDisj(dictHeytingAlgebra)));
    };
};
var elem = function (dictFoldable) {
    return function (dictEq) {
        return function ($199) {
            return any(dictFoldable)(Data_HeytingAlgebra.heytingAlgebraBoolean)(Data_Eq.eq(dictEq)($199));
        };
    };
};
var notElem = function (dictFoldable) {
    return function (dictEq) {
        return function (x) {
            return function ($200) {
                return !elem(dictFoldable)(dictEq)(x)($200);
            };
        };
    };
};
var or = function (dictFoldable) {
    return function (dictHeytingAlgebra) {
        return any(dictFoldable)(dictHeytingAlgebra)(Control_Category.id(Control_Category.categoryFn));
    };
};
var all = function (dictFoldable) {
    return function (dictHeytingAlgebra) {
        return Data_Newtype.alaF(Data_Functor.functorFn)(Data_Functor.functorFn)(Data_Monoid_Conj.newtypeConj)(Data_Monoid_Conj.newtypeConj)(Data_Monoid_Conj.Conj)(foldMap(dictFoldable)(Data_Monoid_Conj.monoidConj(dictHeytingAlgebra)));
    };
};
var and = function (dictFoldable) {
    return function (dictHeytingAlgebra) {
        return all(dictFoldable)(dictHeytingAlgebra)(Control_Category.id(Control_Category.categoryFn));
    };
};
module.exports = {
    Foldable: Foldable,
    foldr: foldr,
    foldl: foldl,
    foldMap: foldMap,
    foldrDefault: foldrDefault,
    foldlDefault: foldlDefault,
    foldMapDefaultL: foldMapDefaultL,
    foldMapDefaultR: foldMapDefaultR,
    fold: fold,
    foldM: foldM,
    traverse_: traverse_,
    for_: for_,
    sequence_: sequence_,
    oneOf: oneOf,
    oneOfMap: oneOfMap,
    intercalate: intercalate,
    surroundMap: surroundMap,
    surround: surround,
    and: and,
    or: or,
    all: all,
    any: any,
    sum: sum,
    product: product,
    elem: elem,
    notElem: notElem,
    indexl: indexl,
    indexr: indexr,
    find: find,
    findMap: findMap,
    maximum: maximum,
    maximumBy: maximumBy,
    minimum: minimum,
    minimumBy: minimumBy,
    "null": $$null,
    length: length,
    foldableArray: foldableArray,
    foldableMaybe: foldableMaybe,
    foldableFirst: foldableFirst,
    foldableLast: foldableLast,
    foldableAdditive: foldableAdditive,
    foldableDual: foldableDual,
    foldableDisj: foldableDisj,
    foldableConj: foldableConj,
    foldableMultiplicative: foldableMultiplicative
};

},{"../Control.Alt":33,"../Control.Applicative":35,"../Control.Apply":37,"../Control.Bind":41,"../Control.Category":42,"../Control.Plus":60,"../Control.Semigroupoid":61,"../Data.Eq":86,"../Data.Function":95,"../Data.Functor":98,"../Data.HeytingAlgebra":104,"../Data.Maybe":108,"../Data.Maybe.First":106,"../Data.Maybe.Last":107,"../Data.Monoid":115,"../Data.Monoid.Additive":109,"../Data.Monoid.Conj":110,"../Data.Monoid.Disj":111,"../Data.Monoid.Dual":112,"../Data.Monoid.Endo":113,"../Data.Monoid.Multiplicative":114,"../Data.Newtype":117,"../Data.Ord":122,"../Data.Ordering":123,"../Data.Semigroup":130,"../Data.Semiring":132,"../Data.Unit":145,"../Prelude":152,"./foreign":90}],92:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Applicative = require("../Control.Applicative");
var Control_Apply = require("../Control.Apply");
var Control_Bind = require("../Control.Bind");
var Control_Semigroupoid = require("../Control.Semigroupoid");
var Data_Foldable = require("../Data.Foldable");
var Data_Function = require("../Data.Function");
var Data_FunctorWithIndex = require("../Data.FunctorWithIndex");
var Data_Maybe = require("../Data.Maybe");
var Data_Maybe_First = require("../Data.Maybe.First");
var Data_Maybe_Last = require("../Data.Maybe.Last");
var Data_Monoid = require("../Data.Monoid");
var Data_Monoid_Additive = require("../Data.Monoid.Additive");
var Data_Monoid_Conj = require("../Data.Monoid.Conj");
var Data_Monoid_Disj = require("../Data.Monoid.Disj");
var Data_Monoid_Dual = require("../Data.Monoid.Dual");
var Data_Monoid_Endo = require("../Data.Monoid.Endo");
var Data_Monoid_Multiplicative = require("../Data.Monoid.Multiplicative");
var Data_Newtype = require("../Data.Newtype");
var Data_Semigroup = require("../Data.Semigroup");
var Data_Unit = require("../Data.Unit");
var Prelude = require("../Prelude");
var Tuple = (function () {
    function Tuple(value0, value1) {
        this.value0 = value0;
        this.value1 = value1;
    };
    Tuple.create = function (value0) {
        return function (value1) {
            return new Tuple(value0, value1);
        };
    };
    return Tuple;
})();
var FoldableWithIndex = function (Foldable0, foldMapWithIndex, foldlWithIndex, foldrWithIndex) {
    this.Foldable0 = Foldable0;
    this.foldMapWithIndex = foldMapWithIndex;
    this.foldlWithIndex = foldlWithIndex;
    this.foldrWithIndex = foldrWithIndex;
};
var foldrWithIndex = function (dict) {
    return dict.foldrWithIndex;
};
var traverseWithIndex_ = function (dictApplicative) {
    return function (dictFoldableWithIndex) {
        return function (f) {
            return foldrWithIndex(dictFoldableWithIndex)(function (i) {
                return function ($41) {
                    return Control_Apply.applySecond(dictApplicative.Apply0())(f(i)($41));
                };
            })(Control_Applicative.pure(dictApplicative)(Data_Unit.unit));
        };
    };
};
var forWithIndex_ = function (dictApplicative) {
    return function (dictFoldableWithIndex) {
        return Data_Function.flip(traverseWithIndex_(dictApplicative)(dictFoldableWithIndex));
    };
};
var foldlWithIndex = function (dict) {
    return dict.foldlWithIndex;
};
var foldableWithIndexMultiplicative = new FoldableWithIndex(function () {
    return Data_Foldable.foldableMultiplicative;
}, function (dictMonoid) {
    return function (f) {
        return Data_Foldable.foldMap(Data_Foldable.foldableMultiplicative)(dictMonoid)(f(Data_Unit.unit));
    };
}, function (f) {
    return Data_Foldable.foldl(Data_Foldable.foldableMultiplicative)(f(Data_Unit.unit));
}, function (f) {
    return Data_Foldable.foldr(Data_Foldable.foldableMultiplicative)(f(Data_Unit.unit));
});
var foldableWithIndexMaybe = new FoldableWithIndex(function () {
    return Data_Foldable.foldableMaybe;
}, function (dictMonoid) {
    return function (f) {
        return Data_Foldable.foldMap(Data_Foldable.foldableMaybe)(dictMonoid)(f(Data_Unit.unit));
    };
}, function (f) {
    return Data_Foldable.foldl(Data_Foldable.foldableMaybe)(f(Data_Unit.unit));
}, function (f) {
    return Data_Foldable.foldr(Data_Foldable.foldableMaybe)(f(Data_Unit.unit));
});
var foldableWithIndexLast = new FoldableWithIndex(function () {
    return Data_Foldable.foldableLast;
}, function (dictMonoid) {
    return function (f) {
        return Data_Foldable.foldMap(Data_Foldable.foldableLast)(dictMonoid)(f(Data_Unit.unit));
    };
}, function (f) {
    return Data_Foldable.foldl(Data_Foldable.foldableLast)(f(Data_Unit.unit));
}, function (f) {
    return Data_Foldable.foldr(Data_Foldable.foldableLast)(f(Data_Unit.unit));
});
var foldableWithIndexFirst = new FoldableWithIndex(function () {
    return Data_Foldable.foldableFirst;
}, function (dictMonoid) {
    return function (f) {
        return Data_Foldable.foldMap(Data_Foldable.foldableFirst)(dictMonoid)(f(Data_Unit.unit));
    };
}, function (f) {
    return Data_Foldable.foldl(Data_Foldable.foldableFirst)(f(Data_Unit.unit));
}, function (f) {
    return Data_Foldable.foldr(Data_Foldable.foldableFirst)(f(Data_Unit.unit));
});
var foldableWithIndexDual = new FoldableWithIndex(function () {
    return Data_Foldable.foldableDual;
}, function (dictMonoid) {
    return function (f) {
        return Data_Foldable.foldMap(Data_Foldable.foldableDual)(dictMonoid)(f(Data_Unit.unit));
    };
}, function (f) {
    return Data_Foldable.foldl(Data_Foldable.foldableDual)(f(Data_Unit.unit));
}, function (f) {
    return Data_Foldable.foldr(Data_Foldable.foldableDual)(f(Data_Unit.unit));
});
var foldableWithIndexDisj = new FoldableWithIndex(function () {
    return Data_Foldable.foldableDisj;
}, function (dictMonoid) {
    return function (f) {
        return Data_Foldable.foldMap(Data_Foldable.foldableDisj)(dictMonoid)(f(Data_Unit.unit));
    };
}, function (f) {
    return Data_Foldable.foldl(Data_Foldable.foldableDisj)(f(Data_Unit.unit));
}, function (f) {
    return Data_Foldable.foldr(Data_Foldable.foldableDisj)(f(Data_Unit.unit));
});
var foldableWithIndexConj = new FoldableWithIndex(function () {
    return Data_Foldable.foldableConj;
}, function (dictMonoid) {
    return function (f) {
        return Data_Foldable.foldMap(Data_Foldable.foldableConj)(dictMonoid)(f(Data_Unit.unit));
    };
}, function (f) {
    return Data_Foldable.foldl(Data_Foldable.foldableConj)(f(Data_Unit.unit));
}, function (f) {
    return Data_Foldable.foldr(Data_Foldable.foldableConj)(f(Data_Unit.unit));
});
var foldableWithIndexAdditive = new FoldableWithIndex(function () {
    return Data_Foldable.foldableAdditive;
}, function (dictMonoid) {
    return function (f) {
        return Data_Foldable.foldMap(Data_Foldable.foldableAdditive)(dictMonoid)(f(Data_Unit.unit));
    };
}, function (f) {
    return Data_Foldable.foldl(Data_Foldable.foldableAdditive)(f(Data_Unit.unit));
}, function (f) {
    return Data_Foldable.foldr(Data_Foldable.foldableAdditive)(f(Data_Unit.unit));
});
var foldWithIndexM = function (dictFoldableWithIndex) {
    return function (dictMonad) {
        return function (f) {
            return function (a0) {
                return foldlWithIndex(dictFoldableWithIndex)(function (i) {
                    return function (ma) {
                        return function (b) {
                            return Control_Bind.bind(dictMonad.Bind1())(ma)(Data_Function.flip(f(i))(b));
                        };
                    };
                })(Control_Applicative.pure(dictMonad.Applicative0())(a0));
            };
        };
    };
};
var foldMapWithIndexDefaultR = function (dictFoldableWithIndex) {
    return function (dictMonoid) {
        return function (f) {
            return foldrWithIndex(dictFoldableWithIndex)(function (i) {
                return function (x) {
                    return function (acc) {
                        return Data_Semigroup.append(dictMonoid.Semigroup0())(f(i)(x))(acc);
                    };
                };
            })(Data_Monoid.mempty(dictMonoid));
        };
    };
};
var foldableWithIndexArray = new FoldableWithIndex(function () {
    return Data_Foldable.foldableArray;
}, function (dictMonoid) {
    return foldMapWithIndexDefaultR(foldableWithIndexArray)(dictMonoid);
}, function (f) {
    return function (z) {
        return function ($42) {
            return Data_Foldable.foldl(Data_Foldable.foldableArray)(function (y) {
                return function (v) {
                    return f(v.value0)(y)(v.value1);
                };
            })(z)(Data_FunctorWithIndex.mapWithIndex(Data_FunctorWithIndex.functorWithIndexArray)(Tuple.create)($42));
        };
    };
}, function (f) {
    return function (z) {
        return function ($43) {
            return Data_Foldable.foldr(Data_Foldable.foldableArray)(function (v) {
                return function (y) {
                    return f(v.value0)(v.value1)(y);
                };
            })(z)(Data_FunctorWithIndex.mapWithIndex(Data_FunctorWithIndex.functorWithIndexArray)(Tuple.create)($43));
        };
    };
});
var foldMapWithIndexDefaultL = function (dictFoldableWithIndex) {
    return function (dictMonoid) {
        return function (f) {
            return foldlWithIndex(dictFoldableWithIndex)(function (i) {
                return function (acc) {
                    return function (x) {
                        return Data_Semigroup.append(dictMonoid.Semigroup0())(acc)(f(i)(x));
                    };
                };
            })(Data_Monoid.mempty(dictMonoid));
        };
    };
};
var foldMapWithIndex = function (dict) {
    return dict.foldMapWithIndex;
};
var foldlWithIndexDefault = function (dictFoldableWithIndex) {
    return function (c) {
        return function (u) {
            return function (xs) {
                return Data_Newtype.unwrap(Data_Monoid_Endo.newtypeEndo)(Data_Newtype.unwrap(Data_Monoid_Dual.newtypeDual)(foldMapWithIndex(dictFoldableWithIndex)(Data_Monoid_Dual.monoidDual(Data_Monoid_Endo.monoidEndo))(function (i) {
                    return function ($44) {
                        return Data_Monoid_Dual.Dual(Data_Monoid_Endo.Endo(Data_Function.flip(c(i))($44)));
                    };
                })(xs)))(u);
            };
        };
    };
};
var foldrWithIndexDefault = function (dictFoldableWithIndex) {
    return function (c) {
        return function (u) {
            return function (xs) {
                return Data_Newtype.unwrap(Data_Monoid_Endo.newtypeEndo)(foldMapWithIndex(dictFoldableWithIndex)(Data_Monoid_Endo.monoidEndo)(function (i) {
                    return function ($45) {
                        return Data_Monoid_Endo.Endo(c(i)($45));
                    };
                })(xs))(u);
            };
        };
    };
};
var surroundMapWithIndex = function (dictFoldableWithIndex) {
    return function (dictSemigroup) {
        return function (d) {
            return function (t) {
                return function (f) {
                    var joined = function (i) {
                        return function (a) {
                            return function (m) {
                                return Data_Semigroup.append(dictSemigroup)(d)(Data_Semigroup.append(dictSemigroup)(t(i)(a))(m));
                            };
                        };
                    };
                    return Data_Newtype.unwrap(Data_Monoid_Endo.newtypeEndo)(foldMapWithIndex(dictFoldableWithIndex)(Data_Monoid_Endo.monoidEndo)(joined)(f))(d);
                };
            };
        };
    };
};
var findWithIndex = function (dictFoldableWithIndex) {
    return function (p) {
        var go = function (i) {
            return function (v) {
                return function (v1) {
                    if (v instanceof Data_Maybe.Nothing && p(i)(v1)) {
                        return new Data_Maybe.Just(v1);
                    };
                    return v;
                };
            };
        };
        return foldlWithIndex(dictFoldableWithIndex)(go)(Data_Maybe.Nothing.value);
    };
};
var anyWithIndex = function (dictFoldableWithIndex) {
    return function (dictHeytingAlgebra) {
        return function (t) {
            return function ($46) {
                return Data_Newtype.unwrap(Data_Monoid_Disj.newtypeDisj)(foldMapWithIndex(dictFoldableWithIndex)(Data_Monoid_Disj.monoidDisj(dictHeytingAlgebra))(function (i) {
                    return function ($47) {
                        return Data_Monoid_Disj.Disj(t(i)($47));
                    };
                })($46));
            };
        };
    };
};
var allWithIndex = function (dictFoldableWithIndex) {
    return function (dictHeytingAlgebra) {
        return function (t) {
            return function ($48) {
                return Data_Newtype.unwrap(Data_Monoid_Conj.newtypeConj)(foldMapWithIndex(dictFoldableWithIndex)(Data_Monoid_Conj.monoidConj(dictHeytingAlgebra))(function (i) {
                    return function ($49) {
                        return Data_Monoid_Conj.Conj(t(i)($49));
                    };
                })($48));
            };
        };
    };
};
module.exports = {
    FoldableWithIndex: FoldableWithIndex,
    foldrWithIndex: foldrWithIndex,
    foldlWithIndex: foldlWithIndex,
    foldMapWithIndex: foldMapWithIndex,
    foldrWithIndexDefault: foldrWithIndexDefault,
    foldlWithIndexDefault: foldlWithIndexDefault,
    foldMapWithIndexDefaultR: foldMapWithIndexDefaultR,
    foldMapWithIndexDefaultL: foldMapWithIndexDefaultL,
    foldWithIndexM: foldWithIndexM,
    traverseWithIndex_: traverseWithIndex_,
    forWithIndex_: forWithIndex_,
    surroundMapWithIndex: surroundMapWithIndex,
    allWithIndex: allWithIndex,
    anyWithIndex: anyWithIndex,
    findWithIndex: findWithIndex,
    foldableWithIndexArray: foldableWithIndexArray,
    foldableWithIndexMaybe: foldableWithIndexMaybe,
    foldableWithIndexFirst: foldableWithIndexFirst,
    foldableWithIndexLast: foldableWithIndexLast,
    foldableWithIndexAdditive: foldableWithIndexAdditive,
    foldableWithIndexDual: foldableWithIndexDual,
    foldableWithIndexDisj: foldableWithIndexDisj,
    foldableWithIndexConj: foldableWithIndexConj,
    foldableWithIndexMultiplicative: foldableWithIndexMultiplicative
};

},{"../Control.Applicative":35,"../Control.Apply":37,"../Control.Bind":41,"../Control.Semigroupoid":61,"../Data.Foldable":91,"../Data.Function":95,"../Data.FunctorWithIndex":100,"../Data.Maybe":108,"../Data.Maybe.First":106,"../Data.Maybe.Last":107,"../Data.Monoid":115,"../Data.Monoid.Additive":109,"../Data.Monoid.Conj":110,"../Data.Monoid.Disj":111,"../Data.Monoid.Dual":112,"../Data.Monoid.Endo":113,"../Data.Monoid.Multiplicative":114,"../Data.Newtype":117,"../Data.Semigroup":130,"../Data.Unit":145,"../Prelude":152}],93:[function(require,module,exports){
"use strict";

// module Data.Function.Uncurried

exports.mkFn0 = function (fn) {
  return function () {
    return fn({});
  };
};

exports.mkFn2 = function (fn) {
  /* jshint maxparams: 2 */
  return function (a, b) {
    return fn(a)(b);
  };
};

exports.mkFn3 = function (fn) {
  /* jshint maxparams: 3 */
  return function (a, b, c) {
    return fn(a)(b)(c);
  };
};

exports.mkFn4 = function (fn) {
  /* jshint maxparams: 4 */
  return function (a, b, c, d) {
    return fn(a)(b)(c)(d);
  };
};

exports.mkFn5 = function (fn) {
  /* jshint maxparams: 5 */
  return function (a, b, c, d, e) {
    return fn(a)(b)(c)(d)(e);
  };
};

exports.mkFn6 = function (fn) {
  /* jshint maxparams: 6 */
  return function (a, b, c, d, e, f) {
    return fn(a)(b)(c)(d)(e)(f);
  };
};

exports.mkFn7 = function (fn) {
  /* jshint maxparams: 7 */
  return function (a, b, c, d, e, f, g) {
    return fn(a)(b)(c)(d)(e)(f)(g);
  };
};

exports.mkFn8 = function (fn) {
  /* jshint maxparams: 8 */
  return function (a, b, c, d, e, f, g, h) {
    return fn(a)(b)(c)(d)(e)(f)(g)(h);
  };
};

exports.mkFn9 = function (fn) {
  /* jshint maxparams: 9 */
  return function (a, b, c, d, e, f, g, h, i) {
    return fn(a)(b)(c)(d)(e)(f)(g)(h)(i);
  };
};

exports.mkFn10 = function (fn) {
  /* jshint maxparams: 10 */
  return function (a, b, c, d, e, f, g, h, i, j) {
    return fn(a)(b)(c)(d)(e)(f)(g)(h)(i)(j);
  };
};

exports.runFn0 = function (fn) {
  return fn();
};

exports.runFn2 = function (fn) {
  return function (a) {
    return function (b) {
      return fn(a, b);
    };
  };
};

exports.runFn3 = function (fn) {
  return function (a) {
    return function (b) {
      return function (c) {
        return fn(a, b, c);
      };
    };
  };
};

exports.runFn4 = function (fn) {
  return function (a) {
    return function (b) {
      return function (c) {
        return function (d) {
          return fn(a, b, c, d);
        };
      };
    };
  };
};

exports.runFn5 = function (fn) {
  return function (a) {
    return function (b) {
      return function (c) {
        return function (d) {
          return function (e) {
            return fn(a, b, c, d, e);
          };
        };
      };
    };
  };
};

exports.runFn6 = function (fn) {
  return function (a) {
    return function (b) {
      return function (c) {
        return function (d) {
          return function (e) {
            return function (f) {
              return fn(a, b, c, d, e, f);
            };
          };
        };
      };
    };
  };
};

exports.runFn7 = function (fn) {
  return function (a) {
    return function (b) {
      return function (c) {
        return function (d) {
          return function (e) {
            return function (f) {
              return function (g) {
                return fn(a, b, c, d, e, f, g);
              };
            };
          };
        };
      };
    };
  };
};

exports.runFn8 = function (fn) {
  return function (a) {
    return function (b) {
      return function (c) {
        return function (d) {
          return function (e) {
            return function (f) {
              return function (g) {
                return function (h) {
                  return fn(a, b, c, d, e, f, g, h);
                };
              };
            };
          };
        };
      };
    };
  };
};

exports.runFn9 = function (fn) {
  return function (a) {
    return function (b) {
      return function (c) {
        return function (d) {
          return function (e) {
            return function (f) {
              return function (g) {
                return function (h) {
                  return function (i) {
                    return fn(a, b, c, d, e, f, g, h, i);
                  };
                };
              };
            };
          };
        };
      };
    };
  };
};

exports.runFn10 = function (fn) {
  return function (a) {
    return function (b) {
      return function (c) {
        return function (d) {
          return function (e) {
            return function (f) {
              return function (g) {
                return function (h) {
                  return function (i) {
                    return function (j) {
                      return fn(a, b, c, d, e, f, g, h, i, j);
                    };
                  };
                };
              };
            };
          };
        };
      };
    };
  };
};

},{}],94:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var $foreign = require("./foreign");
var Data_Unit = require("../Data.Unit");
var runFn1 = function (f) {
    return f;
};
var mkFn1 = function (f) {
    return f;
};
module.exports = {
    mkFn1: mkFn1,
    runFn1: runFn1,
    mkFn0: $foreign.mkFn0,
    mkFn2: $foreign.mkFn2,
    mkFn3: $foreign.mkFn3,
    mkFn4: $foreign.mkFn4,
    mkFn5: $foreign.mkFn5,
    mkFn6: $foreign.mkFn6,
    mkFn7: $foreign.mkFn7,
    mkFn8: $foreign.mkFn8,
    mkFn9: $foreign.mkFn9,
    mkFn10: $foreign.mkFn10,
    runFn0: $foreign.runFn0,
    runFn2: $foreign.runFn2,
    runFn3: $foreign.runFn3,
    runFn4: $foreign.runFn4,
    runFn5: $foreign.runFn5,
    runFn6: $foreign.runFn6,
    runFn7: $foreign.runFn7,
    runFn8: $foreign.runFn8,
    runFn9: $foreign.runFn9,
    runFn10: $foreign.runFn10
};

},{"../Data.Unit":145,"./foreign":93}],95:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Category = require("../Control.Category");
var on = function (f) {
    return function (g) {
        return function (x) {
            return function (y) {
                return f(g(x))(g(y));
            };
        };
    };
};
var flip = function (f) {
    return function (b) {
        return function (a) {
            return f(a)(b);
        };
    };
};
var $$const = function (a) {
    return function (v) {
        return a;
    };
};
var applyFlipped = function (x) {
    return function (f) {
        return f(x);
    };
};
var apply = function (f) {
    return function (x) {
        return f(x);
    };
};
module.exports = {
    flip: flip,
    "const": $$const,
    apply: apply,
    applyFlipped: applyFlipped,
    on: on
};

},{"../Control.Category":42}],96:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Data_Functor = require("../Data.Functor");
var Invariant = function (imap) {
    this.imap = imap;
};
var imapF = function (dictFunctor) {
    return function (f) {
        return function (v) {
            return Data_Functor.map(dictFunctor)(f);
        };
    };
};
var invariantArray = new Invariant(imapF(Data_Functor.functorArray));
var invariantFn = new Invariant(imapF(Data_Functor.functorFn));
var imap = function (dict) {
    return dict.imap;
};
module.exports = {
    imap: imap,
    Invariant: Invariant,
    imapF: imapF,
    invariantFn: invariantFn,
    invariantArray: invariantArray
};

},{"../Data.Functor":98}],97:[function(require,module,exports){
"use strict";

exports.arrayMap = function (f) {
  return function (arr) {
    var l = arr.length;
    var result = new Array(l);
    for (var i = 0; i < l; i++) {
      result[i] = f(arr[i]);
    }
    return result;
  };
};

},{}],98:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var $foreign = require("./foreign");
var Control_Semigroupoid = require("../Control.Semigroupoid");
var Data_Function = require("../Data.Function");
var Data_Unit = require("../Data.Unit");
var Functor = function (map) {
    this.map = map;
};
var map = function (dict) {
    return dict.map;
};
var mapFlipped = function (dictFunctor) {
    return function (fa) {
        return function (f) {
            return map(dictFunctor)(f)(fa);
        };
    };
};
var $$void = function (dictFunctor) {
    return map(dictFunctor)(Data_Function["const"](Data_Unit.unit));
};
var voidLeft = function (dictFunctor) {
    return function (f) {
        return function (x) {
            return map(dictFunctor)(Data_Function["const"](x))(f);
        };
    };
};
var voidRight = function (dictFunctor) {
    return function (x) {
        return map(dictFunctor)(Data_Function["const"](x));
    };
};
var functorFn = new Functor(Control_Semigroupoid.compose(Control_Semigroupoid.semigroupoidFn));
var functorArray = new Functor($foreign.arrayMap);
var flap = function (dictFunctor) {
    return function (ff) {
        return function (x) {
            return map(dictFunctor)(function (f) {
                return f(x);
            })(ff);
        };
    };
};
module.exports = {
    Functor: Functor,
    map: map,
    mapFlipped: mapFlipped,
    "void": $$void,
    voidRight: voidRight,
    voidLeft: voidLeft,
    flap: flap,
    functorFn: functorFn,
    functorArray: functorArray
};

},{"../Control.Semigroupoid":61,"../Data.Function":95,"../Data.Unit":145,"./foreign":97}],99:[function(require,module,exports){
"use strict";

exports.mapWithIndexArray = function (f) {
  return function (xs) {
    var l = xs.length;
    var result = Array(l);
    for (var i = 0; i < l; i++) {
      result[i] = f(i)(xs[i]);
    }
    return result;
  };
};

},{}],100:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var $foreign = require("./foreign");
var Data_Function = require("../Data.Function");
var Data_Functor = require("../Data.Functor");
var Data_Maybe = require("../Data.Maybe");
var Data_Maybe_First = require("../Data.Maybe.First");
var Data_Maybe_Last = require("../Data.Maybe.Last");
var Data_Monoid_Additive = require("../Data.Monoid.Additive");
var Data_Monoid_Conj = require("../Data.Monoid.Conj");
var Data_Monoid_Disj = require("../Data.Monoid.Disj");
var Data_Monoid_Dual = require("../Data.Monoid.Dual");
var Data_Monoid_Multiplicative = require("../Data.Monoid.Multiplicative");
var Data_Unit = require("../Data.Unit");
var Prelude = require("../Prelude");
var FunctorWithIndex = function (Functor0, mapWithIndex) {
    this.Functor0 = Functor0;
    this.mapWithIndex = mapWithIndex;
};
var mapWithIndex = function (dict) {
    return dict.mapWithIndex;
};
var functorWithIndexMultiplicative = new FunctorWithIndex(function () {
    return Data_Monoid_Multiplicative.functorMultiplicative;
}, function (f) {
    return Data_Functor.map(Data_Monoid_Multiplicative.functorMultiplicative)(f(Data_Unit.unit));
});
var functorWithIndexMaybe = new FunctorWithIndex(function () {
    return Data_Maybe.functorMaybe;
}, function (f) {
    return Data_Functor.map(Data_Maybe.functorMaybe)(f(Data_Unit.unit));
});
var functorWithIndexLast = new FunctorWithIndex(function () {
    return Data_Maybe_Last.functorLast;
}, function (f) {
    return Data_Functor.map(Data_Maybe_Last.functorLast)(f(Data_Unit.unit));
});
var functorWithIndexFirst = new FunctorWithIndex(function () {
    return Data_Maybe_First.functorFirst;
}, function (f) {
    return Data_Functor.map(Data_Maybe_First.functorFirst)(f(Data_Unit.unit));
});
var functorWithIndexDual = new FunctorWithIndex(function () {
    return Data_Monoid_Dual.functorDual;
}, function (f) {
    return Data_Functor.map(Data_Monoid_Dual.functorDual)(f(Data_Unit.unit));
});
var functorWithIndexDisj = new FunctorWithIndex(function () {
    return Data_Monoid_Disj.functorDisj;
}, function (f) {
    return Data_Functor.map(Data_Monoid_Disj.functorDisj)(f(Data_Unit.unit));
});
var functorWithIndexConj = new FunctorWithIndex(function () {
    return Data_Monoid_Conj.functorConj;
}, function (f) {
    return Data_Functor.map(Data_Monoid_Conj.functorConj)(f(Data_Unit.unit));
});
var functorWithIndexArray = new FunctorWithIndex(function () {
    return Data_Functor.functorArray;
}, $foreign.mapWithIndexArray);
var functorWithIndexAdditive = new FunctorWithIndex(function () {
    return Data_Monoid_Additive.functorAdditive;
}, function (f) {
    return Data_Functor.map(Data_Monoid_Additive.functorAdditive)(f(Data_Unit.unit));
});
module.exports = {
    FunctorWithIndex: FunctorWithIndex,
    mapWithIndex: mapWithIndex,
    functorWithIndexArray: functorWithIndexArray,
    functorWithIndexMaybe: functorWithIndexMaybe,
    functorWithIndexFirst: functorWithIndexFirst,
    functorWithIndexLast: functorWithIndexLast,
    functorWithIndexAdditive: functorWithIndexAdditive,
    functorWithIndexDual: functorWithIndexDual,
    functorWithIndexConj: functorWithIndexConj,
    functorWithIndexDisj: functorWithIndexDisj,
    functorWithIndexMultiplicative: functorWithIndexMultiplicative
};

},{"../Data.Function":95,"../Data.Functor":98,"../Data.Maybe":108,"../Data.Maybe.First":106,"../Data.Maybe.Last":107,"../Data.Monoid.Additive":109,"../Data.Monoid.Conj":110,"../Data.Monoid.Disj":111,"../Data.Monoid.Dual":112,"../Data.Monoid.Multiplicative":114,"../Data.Unit":145,"../Prelude":152,"./foreign":99}],101:[function(require,module,exports){
const H = require("@funkia/hareactive");

function apply(f, a) {
  return a.ap(f);
}

function bind(mf, f) {
  return mf.chain(f);
}

exports._memptyStream = H.empty;

exports._mapStream = function _map(f, s) {
  return s.map(f);
}

exports._mapBehavior = exports._mapStream;

exports._applyBehavior = apply;

exports._bindBehavior = bind;

exports._pureBehavior = H.Behavior.of;

exports._filter = H.filter;

exports._combine = H.combine;

exports._keepWhen = H.keepWhen;

exports._scan = H.scan;

exports._scanS = H.scanS;

exports.switchStream = H.switchStream;

exports.sample = H.sample

exports._mapNow = exports._mapStream;

exports._applyNow = apply;

exports._pureNow = H.Now.of;

exports._bindNow = bind;

},{"@funkia/hareactive":6}],102:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var $foreign = require("./foreign");
var Control_Applicative = require("../Control.Applicative");
var Control_Apply = require("../Control.Apply");
var Control_Bind = require("../Control.Bind");
var Control_Monad = require("../Control.Monad");
var Control_Monad_Eff = require("../Control.Monad.Eff");
var Control_Semigroupoid = require("../Control.Semigroupoid");
var Data_Function_Uncurried = require("../Data.Function.Uncurried");
var Data_Functor = require("../Data.Functor");
var Data_Monoid = require("../Data.Monoid");
var Data_Semigroup = require("../Data.Semigroup");
var Prelude = require("../Prelude");
var semigroupStream = new Data_Semigroup.Semigroup(Data_Function_Uncurried.runFn2($foreign._combine));
var scanS = function ($0) {
    return Data_Function_Uncurried.runFn3($foreign._scanS)(Data_Function_Uncurried.mkFn2($0));
};
var scan = function ($1) {
    return Data_Function_Uncurried.runFn3($foreign._scan)(Data_Function_Uncurried.mkFn2($1));
};
var monoidStream = new Data_Monoid.Monoid(function () {
    return semigroupStream;
}, $foreign._memptyStream);
var keepWhen = Data_Function_Uncurried.runFn2($foreign._keepWhen);
var functorStream = new Data_Functor.Functor(Data_Function_Uncurried.runFn2($foreign._mapStream));
var functorNow = new Data_Functor.Functor(Data_Function_Uncurried.runFn2($foreign._mapNow));
var functorBehavior = new Data_Functor.Functor(Data_Function_Uncurried.runFn2($foreign._mapBehavior));
var filter = Data_Function_Uncurried.runFn2($foreign._filter);
var applyNow = new Control_Apply.Apply(function () {
    return functorNow;
}, Data_Function_Uncurried.runFn2($foreign._applyNow));
var bindNow = new Control_Bind.Bind(function () {
    return applyNow;
}, Data_Function_Uncurried.runFn2($foreign._bindNow));
var applyBehavior = new Control_Apply.Apply(function () {
    return functorBehavior;
}, Data_Function_Uncurried.runFn2($foreign._applyBehavior));
var bindBehavior = new Control_Bind.Bind(function () {
    return applyBehavior;
}, Data_Function_Uncurried.runFn2($foreign._bindBehavior));
var applicativeNow = new Control_Applicative.Applicative(function () {
    return applyNow;
}, $foreign._pureNow);
var monadNow = new Control_Monad.Monad(function () {
    return applicativeNow;
}, function () {
    return bindNow;
});
var applicativeBehavior = new Control_Applicative.Applicative(function () {
    return applyBehavior;
}, $foreign._pureBehavior);
var monadBehavior = new Control_Monad.Monad(function () {
    return applicativeBehavior;
}, function () {
    return bindBehavior;
});
module.exports = {
    filter: filter,
    keepWhen: keepWhen,
    scan: scan,
    scanS: scanS,
    semigroupStream: semigroupStream,
    monoidStream: monoidStream,
    functorStream: functorStream,
    functorBehavior: functorBehavior,
    applyBehavior: applyBehavior,
    applicativeBehavior: applicativeBehavior,
    bindBehavior: bindBehavior,
    monadBehavior: monadBehavior,
    functorNow: functorNow,
    applyNow: applyNow,
    applicativeNow: applicativeNow,
    bindNow: bindNow,
    monadNow: monadNow,
    sample: $foreign.sample,
    switchStream: $foreign.switchStream
};

},{"../Control.Applicative":35,"../Control.Apply":37,"../Control.Bind":41,"../Control.Monad":58,"../Control.Monad.Eff":54,"../Control.Semigroupoid":61,"../Data.Function.Uncurried":94,"../Data.Functor":98,"../Data.Monoid":115,"../Data.Semigroup":130,"../Prelude":152,"./foreign":101}],103:[function(require,module,exports){
"use strict";

exports.boolConj = function (b1) {
  return function (b2) {
    return b1 && b2;
  };
};

exports.boolDisj = function (b1) {
  return function (b2) {
    return b1 || b2;
  };
};

exports.boolNot = function (b) {
  return !b;
};

},{}],104:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var $foreign = require("./foreign");
var Data_Unit = require("../Data.Unit");
var HeytingAlgebra = function (conj, disj, ff, implies, not, tt) {
    this.conj = conj;
    this.disj = disj;
    this.ff = ff;
    this.implies = implies;
    this.not = not;
    this.tt = tt;
};
var tt = function (dict) {
    return dict.tt;
};
var not = function (dict) {
    return dict.not;
};
var implies = function (dict) {
    return dict.implies;
};
var heytingAlgebraUnit = new HeytingAlgebra(function (v) {
    return function (v1) {
        return Data_Unit.unit;
    };
}, function (v) {
    return function (v1) {
        return Data_Unit.unit;
    };
}, Data_Unit.unit, function (v) {
    return function (v1) {
        return Data_Unit.unit;
    };
}, function (v) {
    return Data_Unit.unit;
}, Data_Unit.unit);
var ff = function (dict) {
    return dict.ff;
};
var disj = function (dict) {
    return dict.disj;
};
var heytingAlgebraBoolean = new HeytingAlgebra($foreign.boolConj, $foreign.boolDisj, false, function (a) {
    return function (b) {
        return disj(heytingAlgebraBoolean)(not(heytingAlgebraBoolean)(a))(b);
    };
}, $foreign.boolNot, true);
var conj = function (dict) {
    return dict.conj;
};
var heytingAlgebraFunction = function (dictHeytingAlgebra) {
    return new HeytingAlgebra(function (f) {
        return function (g) {
            return function (a) {
                return conj(dictHeytingAlgebra)(f(a))(g(a));
            };
        };
    }, function (f) {
        return function (g) {
            return function (a) {
                return disj(dictHeytingAlgebra)(f(a))(g(a));
            };
        };
    }, function (v) {
        return ff(dictHeytingAlgebra);
    }, function (f) {
        return function (g) {
            return function (a) {
                return implies(dictHeytingAlgebra)(f(a))(g(a));
            };
        };
    }, function (f) {
        return function (a) {
            return not(dictHeytingAlgebra)(f(a));
        };
    }, function (v) {
        return tt(dictHeytingAlgebra);
    });
};
module.exports = {
    HeytingAlgebra: HeytingAlgebra,
    tt: tt,
    ff: ff,
    implies: implies,
    conj: conj,
    disj: disj,
    not: not,
    heytingAlgebraBoolean: heytingAlgebraBoolean,
    heytingAlgebraUnit: heytingAlgebraUnit,
    heytingAlgebraFunction: heytingAlgebraFunction
};

},{"../Data.Unit":145,"./foreign":103}],105:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Alt = require("../Control.Alt");
var Control_Applicative = require("../Control.Applicative");
var Control_Apply = require("../Control.Apply");
var Control_Bind = require("../Control.Bind");
var Control_Comonad = require("../Control.Comonad");
var Control_Extend = require("../Control.Extend");
var Control_Lazy = require("../Control.Lazy");
var Control_Monad = require("../Control.Monad");
var Data_BooleanAlgebra = require("../Data.BooleanAlgebra");
var Data_Bounded = require("../Data.Bounded");
var Data_CommutativeRing = require("../Data.CommutativeRing");
var Data_Eq = require("../Data.Eq");
var Data_EuclideanRing = require("../Data.EuclideanRing");
var Data_Field = require("../Data.Field");
var Data_Foldable = require("../Data.Foldable");
var Data_Functor = require("../Data.Functor");
var Data_Functor_Invariant = require("../Data.Functor.Invariant");
var Data_HeytingAlgebra = require("../Data.HeytingAlgebra");
var Data_Monoid = require("../Data.Monoid");
var Data_Newtype = require("../Data.Newtype");
var Data_Ord = require("../Data.Ord");
var Data_Ring = require("../Data.Ring");
var Data_Semigroup = require("../Data.Semigroup");
var Data_Semiring = require("../Data.Semiring");
var Data_Show = require("../Data.Show");
var Data_Traversable = require("../Data.Traversable");
var Prelude = require("../Prelude");
var Identity = function (x) {
    return x;
};
var showIdentity = function (dictShow) {
    return new Data_Show.Show(function (v) {
        return "(Identity " + (Data_Show.show(dictShow)(v) + ")");
    });
};
var semiringIdentity = function (dictSemiring) {
    return dictSemiring;
};
var semigroupIdenity = function (dictSemigroup) {
    return dictSemigroup;
};
var ringIdentity = function (dictRing) {
    return dictRing;
};
var ordIdentity = function (dictOrd) {
    return dictOrd;
};
var newtypeIdentity = new Data_Newtype.Newtype(function (n) {
    return n;
}, Identity);
var monoidIdentity = function (dictMonoid) {
    return dictMonoid;
};
var lazyIdentity = function (dictLazy) {
    return dictLazy;
};
var heytingAlgebraIdentity = function (dictHeytingAlgebra) {
    return dictHeytingAlgebra;
};
var functorIdentity = new Data_Functor.Functor(function (f) {
    return function (v) {
        return f(v);
    };
});
var invariantIdentity = new Data_Functor_Invariant.Invariant(Data_Functor_Invariant.imapF(functorIdentity));
var foldableIdentity = new Data_Foldable.Foldable(function (dictMonoid) {
    return function (f) {
        return function (v) {
            return f(v);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return f(z)(v);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return f(v)(z);
        };
    };
});
var traversableIdentity = new Data_Traversable.Traversable(function () {
    return foldableIdentity;
}, function () {
    return functorIdentity;
}, function (dictApplicative) {
    return function (v) {
        return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Identity)(v);
    };
}, function (dictApplicative) {
    return function (f) {
        return function (v) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Identity)(f(v));
        };
    };
});
var fieldIdentity = function (dictField) {
    return dictField;
};
var extendIdentity = new Control_Extend.Extend(function () {
    return functorIdentity;
}, function (f) {
    return function (m) {
        return f(m);
    };
});
var euclideanRingIdentity = function (dictEuclideanRing) {
    return dictEuclideanRing;
};
var eqIdentity = function (dictEq) {
    return dictEq;
};
var eq1Identity = new Data_Eq.Eq1(function (dictEq) {
    return Data_Eq.eq(eqIdentity(dictEq));
});
var ord1Identity = new Data_Ord.Ord1(function () {
    return eq1Identity;
}, function (dictOrd) {
    return Data_Ord.compare(ordIdentity(dictOrd));
});
var comonadIdentity = new Control_Comonad.Comonad(function () {
    return extendIdentity;
}, function (v) {
    return v;
});
var commutativeRingIdentity = function (dictCommutativeRing) {
    return dictCommutativeRing;
};
var boundedIdentity = function (dictBounded) {
    return dictBounded;
};
var booleanAlgebraIdentity = function (dictBooleanAlgebra) {
    return dictBooleanAlgebra;
};
var applyIdentity = new Control_Apply.Apply(function () {
    return functorIdentity;
}, function (v) {
    return function (v1) {
        return v(v1);
    };
});
var bindIdentity = new Control_Bind.Bind(function () {
    return applyIdentity;
}, function (v) {
    return function (f) {
        return f(v);
    };
});
var applicativeIdentity = new Control_Applicative.Applicative(function () {
    return applyIdentity;
}, Identity);
var monadIdentity = new Control_Monad.Monad(function () {
    return applicativeIdentity;
}, function () {
    return bindIdentity;
});
var altIdentity = new Control_Alt.Alt(function () {
    return functorIdentity;
}, function (x) {
    return function (v) {
        return x;
    };
});
module.exports = {
    Identity: Identity,
    newtypeIdentity: newtypeIdentity,
    eqIdentity: eqIdentity,
    ordIdentity: ordIdentity,
    boundedIdentity: boundedIdentity,
    heytingAlgebraIdentity: heytingAlgebraIdentity,
    booleanAlgebraIdentity: booleanAlgebraIdentity,
    semigroupIdenity: semigroupIdenity,
    monoidIdentity: monoidIdentity,
    semiringIdentity: semiringIdentity,
    euclideanRingIdentity: euclideanRingIdentity,
    ringIdentity: ringIdentity,
    commutativeRingIdentity: commutativeRingIdentity,
    fieldIdentity: fieldIdentity,
    lazyIdentity: lazyIdentity,
    showIdentity: showIdentity,
    eq1Identity: eq1Identity,
    ord1Identity: ord1Identity,
    functorIdentity: functorIdentity,
    invariantIdentity: invariantIdentity,
    altIdentity: altIdentity,
    applyIdentity: applyIdentity,
    applicativeIdentity: applicativeIdentity,
    bindIdentity: bindIdentity,
    monadIdentity: monadIdentity,
    extendIdentity: extendIdentity,
    comonadIdentity: comonadIdentity,
    foldableIdentity: foldableIdentity,
    traversableIdentity: traversableIdentity
};

},{"../Control.Alt":33,"../Control.Applicative":35,"../Control.Apply":37,"../Control.Bind":41,"../Control.Comonad":43,"../Control.Extend":45,"../Control.Lazy":46,"../Control.Monad":58,"../Data.BooleanAlgebra":78,"../Data.Bounded":80,"../Data.CommutativeRing":81,"../Data.Eq":86,"../Data.EuclideanRing":88,"../Data.Field":89,"../Data.Foldable":91,"../Data.Functor":98,"../Data.Functor.Invariant":96,"../Data.HeytingAlgebra":104,"../Data.Monoid":115,"../Data.Newtype":117,"../Data.Ord":122,"../Data.Ring":127,"../Data.Semigroup":130,"../Data.Semiring":132,"../Data.Show":134,"../Data.Traversable":139,"../Prelude":152}],106:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Applicative = require("../Control.Applicative");
var Control_Apply = require("../Control.Apply");
var Control_Bind = require("../Control.Bind");
var Control_Extend = require("../Control.Extend");
var Control_Monad = require("../Control.Monad");
var Data_Bounded = require("../Data.Bounded");
var Data_Eq = require("../Data.Eq");
var Data_Functor = require("../Data.Functor");
var Data_Functor_Invariant = require("../Data.Functor.Invariant");
var Data_Maybe = require("../Data.Maybe");
var Data_Monoid = require("../Data.Monoid");
var Data_Newtype = require("../Data.Newtype");
var Data_Ord = require("../Data.Ord");
var Data_Semigroup = require("../Data.Semigroup");
var Data_Show = require("../Data.Show");
var Prelude = require("../Prelude");
var First = function (x) {
    return x;
};
var showFirst = function (dictShow) {
    return new Data_Show.Show(function (v) {
        return "First (" + (Data_Show.show(Data_Maybe.showMaybe(dictShow))(v) + ")");
    });
};
var semigroupFirst = new Data_Semigroup.Semigroup(function (v) {
    return function (v1) {
        if (v instanceof Data_Maybe.Just) {
            return v;
        };
        return v1;
    };
});
var ordFirst = function (dictOrd) {
    return Data_Maybe.ordMaybe(dictOrd);
};
var ord1First = Data_Maybe.ord1Maybe;
var newtypeFirst = new Data_Newtype.Newtype(function (n) {
    return n;
}, First);
var monoidFirst = new Data_Monoid.Monoid(function () {
    return semigroupFirst;
}, Data_Maybe.Nothing.value);
var monadFirst = Data_Maybe.monadMaybe;
var invariantFirst = Data_Maybe.invariantMaybe;
var functorFirst = Data_Maybe.functorMaybe;
var extendFirst = Data_Maybe.extendMaybe;
var eqFirst = function (dictEq) {
    return Data_Maybe.eqMaybe(dictEq);
};
var eq1First = Data_Maybe.eq1Maybe;
var boundedFirst = function (dictBounded) {
    return Data_Maybe.boundedMaybe(dictBounded);
};
var bindFirst = Data_Maybe.bindMaybe;
var applyFirst = Data_Maybe.applyMaybe;
var applicativeFirst = Data_Maybe.applicativeMaybe;
module.exports = {
    First: First,
    newtypeFirst: newtypeFirst,
    eqFirst: eqFirst,
    eq1First: eq1First,
    ordFirst: ordFirst,
    ord1First: ord1First,
    boundedFirst: boundedFirst,
    functorFirst: functorFirst,
    invariantFirst: invariantFirst,
    applyFirst: applyFirst,
    applicativeFirst: applicativeFirst,
    bindFirst: bindFirst,
    monadFirst: monadFirst,
    extendFirst: extendFirst,
    showFirst: showFirst,
    semigroupFirst: semigroupFirst,
    monoidFirst: monoidFirst
};

},{"../Control.Applicative":35,"../Control.Apply":37,"../Control.Bind":41,"../Control.Extend":45,"../Control.Monad":58,"../Data.Bounded":80,"../Data.Eq":86,"../Data.Functor":98,"../Data.Functor.Invariant":96,"../Data.Maybe":108,"../Data.Monoid":115,"../Data.Newtype":117,"../Data.Ord":122,"../Data.Semigroup":130,"../Data.Show":134,"../Prelude":152}],107:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Applicative = require("../Control.Applicative");
var Control_Apply = require("../Control.Apply");
var Control_Bind = require("../Control.Bind");
var Control_Extend = require("../Control.Extend");
var Control_Monad = require("../Control.Monad");
var Data_Bounded = require("../Data.Bounded");
var Data_Eq = require("../Data.Eq");
var Data_Functor = require("../Data.Functor");
var Data_Functor_Invariant = require("../Data.Functor.Invariant");
var Data_Maybe = require("../Data.Maybe");
var Data_Monoid = require("../Data.Monoid");
var Data_Newtype = require("../Data.Newtype");
var Data_Ord = require("../Data.Ord");
var Data_Semigroup = require("../Data.Semigroup");
var Data_Show = require("../Data.Show");
var Prelude = require("../Prelude");
var Last = function (x) {
    return x;
};
var showLast = function (dictShow) {
    return new Data_Show.Show(function (v) {
        return "(Last " + (Data_Show.show(Data_Maybe.showMaybe(dictShow))(v) + ")");
    });
};
var semigroupLast = new Data_Semigroup.Semigroup(function (v) {
    return function (v1) {
        if (v1 instanceof Data_Maybe.Just) {
            return v1;
        };
        if (v1 instanceof Data_Maybe.Nothing) {
            return v;
        };
        throw new Error("Failed pattern match at Data.Maybe.Last line 53, column 1 - line 53, column 45: " + [ v.constructor.name, v1.constructor.name ]);
    };
});
var ordLast = function (dictOrd) {
    return Data_Maybe.ordMaybe(dictOrd);
};
var ord1Last = Data_Maybe.ord1Maybe;
var newtypeLast = new Data_Newtype.Newtype(function (n) {
    return n;
}, Last);
var monoidLast = new Data_Monoid.Monoid(function () {
    return semigroupLast;
}, Data_Maybe.Nothing.value);
var monadLast = Data_Maybe.monadMaybe;
var invariantLast = Data_Maybe.invariantMaybe;
var functorLast = Data_Maybe.functorMaybe;
var extendLast = Data_Maybe.extendMaybe;
var eqLast = function (dictEq) {
    return Data_Maybe.eqMaybe(dictEq);
};
var eq1Last = Data_Maybe.eq1Maybe;
var boundedLast = function (dictBounded) {
    return Data_Maybe.boundedMaybe(dictBounded);
};
var bindLast = Data_Maybe.bindMaybe;
var applyLast = Data_Maybe.applyMaybe;
var applicativeLast = Data_Maybe.applicativeMaybe;
module.exports = {
    Last: Last,
    newtypeLast: newtypeLast,
    eqLast: eqLast,
    eq1Last: eq1Last,
    ordLast: ordLast,
    ord1Last: ord1Last,
    boundedLast: boundedLast,
    functorLast: functorLast,
    invariantLast: invariantLast,
    applyLast: applyLast,
    applicativeLast: applicativeLast,
    bindLast: bindLast,
    monadLast: monadLast,
    extendLast: extendLast,
    showLast: showLast,
    semigroupLast: semigroupLast,
    monoidLast: monoidLast
};

},{"../Control.Applicative":35,"../Control.Apply":37,"../Control.Bind":41,"../Control.Extend":45,"../Control.Monad":58,"../Data.Bounded":80,"../Data.Eq":86,"../Data.Functor":98,"../Data.Functor.Invariant":96,"../Data.Maybe":108,"../Data.Monoid":115,"../Data.Newtype":117,"../Data.Ord":122,"../Data.Semigroup":130,"../Data.Show":134,"../Prelude":152}],108:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Alt = require("../Control.Alt");
var Control_Alternative = require("../Control.Alternative");
var Control_Applicative = require("../Control.Applicative");
var Control_Apply = require("../Control.Apply");
var Control_Bind = require("../Control.Bind");
var Control_Category = require("../Control.Category");
var Control_Extend = require("../Control.Extend");
var Control_Monad = require("../Control.Monad");
var Control_MonadZero = require("../Control.MonadZero");
var Control_Plus = require("../Control.Plus");
var Data_Bounded = require("../Data.Bounded");
var Data_Eq = require("../Data.Eq");
var Data_Function = require("../Data.Function");
var Data_Functor = require("../Data.Functor");
var Data_Functor_Invariant = require("../Data.Functor.Invariant");
var Data_Monoid = require("../Data.Monoid");
var Data_Ord = require("../Data.Ord");
var Data_Ordering = require("../Data.Ordering");
var Data_Semigroup = require("../Data.Semigroup");
var Data_Show = require("../Data.Show");
var Data_Unit = require("../Data.Unit");
var Prelude = require("../Prelude");
var Nothing = (function () {
    function Nothing() {

    };
    Nothing.value = new Nothing();
    return Nothing;
})();
var Just = (function () {
    function Just(value0) {
        this.value0 = value0;
    };
    Just.create = function (value0) {
        return new Just(value0);
    };
    return Just;
})();
var showMaybe = function (dictShow) {
    return new Data_Show.Show(function (v) {
        if (v instanceof Just) {
            return "(Just " + (Data_Show.show(dictShow)(v.value0) + ")");
        };
        if (v instanceof Nothing) {
            return "Nothing";
        };
        throw new Error("Failed pattern match at Data.Maybe line 207, column 1 - line 207, column 47: " + [ v.constructor.name ]);
    });
};
var semigroupMaybe = function (dictSemigroup) {
    return new Data_Semigroup.Semigroup(function (v) {
        return function (v1) {
            if (v instanceof Nothing) {
                return v1;
            };
            if (v1 instanceof Nothing) {
                return v;
            };
            if (v instanceof Just && v1 instanceof Just) {
                return new Just(Data_Semigroup.append(dictSemigroup)(v.value0)(v1.value0));
            };
            throw new Error("Failed pattern match at Data.Maybe line 176, column 1 - line 176, column 62: " + [ v.constructor.name, v1.constructor.name ]);
        };
    });
};
var monoidMaybe = function (dictSemigroup) {
    return new Data_Monoid.Monoid(function () {
        return semigroupMaybe(dictSemigroup);
    }, Nothing.value);
};
var maybe$prime = function (v) {
    return function (v1) {
        return function (v2) {
            if (v2 instanceof Nothing) {
                return v(Data_Unit.unit);
            };
            if (v2 instanceof Just) {
                return v1(v2.value0);
            };
            throw new Error("Failed pattern match at Data.Maybe line 232, column 1 - line 232, column 62: " + [ v.constructor.name, v1.constructor.name, v2.constructor.name ]);
        };
    };
};
var maybe = function (v) {
    return function (v1) {
        return function (v2) {
            if (v2 instanceof Nothing) {
                return v;
            };
            if (v2 instanceof Just) {
                return v1(v2.value0);
            };
            throw new Error("Failed pattern match at Data.Maybe line 219, column 1 - line 219, column 51: " + [ v.constructor.name, v1.constructor.name, v2.constructor.name ]);
        };
    };
};
var isNothing = maybe(true)(Data_Function["const"](false));
var isJust = maybe(false)(Data_Function["const"](true));
var functorMaybe = new Data_Functor.Functor(function (v) {
    return function (v1) {
        if (v1 instanceof Just) {
            return new Just(v(v1.value0));
        };
        return Nothing.value;
    };
});
var invariantMaybe = new Data_Functor_Invariant.Invariant(Data_Functor_Invariant.imapF(functorMaybe));
var fromMaybe$prime = function (a) {
    return maybe$prime(a)(Control_Category.id(Control_Category.categoryFn));
};
var fromMaybe = function (a) {
    return maybe(a)(Control_Category.id(Control_Category.categoryFn));
};
var fromJust = function (dictPartial) {
    return function (v) {
        var __unused = function (dictPartial1) {
            return function ($dollar34) {
                return $dollar34;
            };
        };
        return __unused(dictPartial)((function () {
            if (v instanceof Just) {
                return v.value0;
            };
            throw new Error("Failed pattern match at Data.Maybe line 270, column 1 - line 270, column 46: " + [ v.constructor.name ]);
        })());
    };
};
var extendMaybe = new Control_Extend.Extend(function () {
    return functorMaybe;
}, function (v) {
    return function (v1) {
        if (v1 instanceof Nothing) {
            return Nothing.value;
        };
        return new Just(v(v1));
    };
});
var eqMaybe = function (dictEq) {
    return new Data_Eq.Eq(function (x) {
        return function (y) {
            if (x instanceof Nothing && y instanceof Nothing) {
                return true;
            };
            if (x instanceof Just && y instanceof Just) {
                return Data_Eq.eq(dictEq)(x.value0)(y.value0);
            };
            return false;
        };
    });
};
var ordMaybe = function (dictOrd) {
    return new Data_Ord.Ord(function () {
        return eqMaybe(dictOrd.Eq0());
    }, function (x) {
        return function (y) {
            if (x instanceof Nothing && y instanceof Nothing) {
                return Data_Ordering.EQ.value;
            };
            if (x instanceof Nothing) {
                return Data_Ordering.LT.value;
            };
            if (y instanceof Nothing) {
                return Data_Ordering.GT.value;
            };
            if (x instanceof Just && y instanceof Just) {
                return Data_Ord.compare(dictOrd)(x.value0)(y.value0);
            };
            throw new Error("Failed pattern match at Data.Maybe line 196, column 8 - line 196, column 51: " + [ x.constructor.name, y.constructor.name ]);
        };
    });
};
var eq1Maybe = new Data_Eq.Eq1(function (dictEq) {
    return Data_Eq.eq(eqMaybe(dictEq));
});
var ord1Maybe = new Data_Ord.Ord1(function () {
    return eq1Maybe;
}, function (dictOrd) {
    return Data_Ord.compare(ordMaybe(dictOrd));
});
var boundedMaybe = function (dictBounded) {
    return new Data_Bounded.Bounded(function () {
        return ordMaybe(dictBounded.Ord0());
    }, Nothing.value, new Just(Data_Bounded.top(dictBounded)));
};
var applyMaybe = new Control_Apply.Apply(function () {
    return functorMaybe;
}, function (v) {
    return function (v1) {
        if (v instanceof Just) {
            return Data_Functor.map(functorMaybe)(v.value0)(v1);
        };
        if (v instanceof Nothing) {
            return Nothing.value;
        };
        throw new Error("Failed pattern match at Data.Maybe line 68, column 1 - line 68, column 35: " + [ v.constructor.name, v1.constructor.name ]);
    };
});
var bindMaybe = new Control_Bind.Bind(function () {
    return applyMaybe;
}, function (v) {
    return function (v1) {
        if (v instanceof Just) {
            return v1(v.value0);
        };
        if (v instanceof Nothing) {
            return Nothing.value;
        };
        throw new Error("Failed pattern match at Data.Maybe line 127, column 1 - line 127, column 33: " + [ v.constructor.name, v1.constructor.name ]);
    };
});
var applicativeMaybe = new Control_Applicative.Applicative(function () {
    return applyMaybe;
}, Just.create);
var monadMaybe = new Control_Monad.Monad(function () {
    return applicativeMaybe;
}, function () {
    return bindMaybe;
});
var altMaybe = new Control_Alt.Alt(function () {
    return functorMaybe;
}, function (v) {
    return function (v1) {
        if (v instanceof Nothing) {
            return v1;
        };
        return v;
    };
});
var plusMaybe = new Control_Plus.Plus(function () {
    return altMaybe;
}, Nothing.value);
var alternativeMaybe = new Control_Alternative.Alternative(function () {
    return applicativeMaybe;
}, function () {
    return plusMaybe;
});
var monadZeroMaybe = new Control_MonadZero.MonadZero(function () {
    return alternativeMaybe;
}, function () {
    return monadMaybe;
});
module.exports = {
    Nothing: Nothing,
    Just: Just,
    maybe: maybe,
    "maybe'": maybe$prime,
    fromMaybe: fromMaybe,
    "fromMaybe'": fromMaybe$prime,
    isJust: isJust,
    isNothing: isNothing,
    fromJust: fromJust,
    functorMaybe: functorMaybe,
    applyMaybe: applyMaybe,
    applicativeMaybe: applicativeMaybe,
    altMaybe: altMaybe,
    plusMaybe: plusMaybe,
    alternativeMaybe: alternativeMaybe,
    bindMaybe: bindMaybe,
    monadMaybe: monadMaybe,
    monadZeroMaybe: monadZeroMaybe,
    extendMaybe: extendMaybe,
    invariantMaybe: invariantMaybe,
    semigroupMaybe: semigroupMaybe,
    monoidMaybe: monoidMaybe,
    eqMaybe: eqMaybe,
    eq1Maybe: eq1Maybe,
    ordMaybe: ordMaybe,
    ord1Maybe: ord1Maybe,
    boundedMaybe: boundedMaybe,
    showMaybe: showMaybe
};

},{"../Control.Alt":33,"../Control.Alternative":34,"../Control.Applicative":35,"../Control.Apply":37,"../Control.Bind":41,"../Control.Category":42,"../Control.Extend":45,"../Control.Monad":58,"../Control.MonadZero":59,"../Control.Plus":60,"../Data.Bounded":80,"../Data.Eq":86,"../Data.Function":95,"../Data.Functor":98,"../Data.Functor.Invariant":96,"../Data.Monoid":115,"../Data.Ord":122,"../Data.Ordering":123,"../Data.Semigroup":130,"../Data.Show":134,"../Data.Unit":145,"../Prelude":152}],109:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Applicative = require("../Control.Applicative");
var Control_Apply = require("../Control.Apply");
var Control_Bind = require("../Control.Bind");
var Control_Comonad = require("../Control.Comonad");
var Control_Extend = require("../Control.Extend");
var Control_Monad = require("../Control.Monad");
var Data_Bounded = require("../Data.Bounded");
var Data_Eq = require("../Data.Eq");
var Data_Functor = require("../Data.Functor");
var Data_Functor_Invariant = require("../Data.Functor.Invariant");
var Data_Monoid = require("../Data.Monoid");
var Data_Newtype = require("../Data.Newtype");
var Data_Ord = require("../Data.Ord");
var Data_Semigroup = require("../Data.Semigroup");
var Data_Semiring = require("../Data.Semiring");
var Data_Show = require("../Data.Show");
var Prelude = require("../Prelude");
var Additive = function (x) {
    return x;
};
var showAdditive = function (dictShow) {
    return new Data_Show.Show(function (v) {
        return "(Additive " + (Data_Show.show(dictShow)(v) + ")");
    });
};
var semigroupAdditive = function (dictSemiring) {
    return new Data_Semigroup.Semigroup(function (v) {
        return function (v1) {
            return Data_Semiring.add(dictSemiring)(v)(v1);
        };
    });
};
var ordAdditive = function (dictOrd) {
    return dictOrd;
};
var newtypeAdditive = new Data_Newtype.Newtype(function (n) {
    return n;
}, Additive);
var monoidAdditive = function (dictSemiring) {
    return new Data_Monoid.Monoid(function () {
        return semigroupAdditive(dictSemiring);
    }, Data_Semiring.zero(dictSemiring));
};
var invariantAdditive = new Data_Functor_Invariant.Invariant(function (f) {
    return function (v) {
        return function (v1) {
            return f(v1);
        };
    };
});
var functorAdditive = new Data_Functor.Functor(function (f) {
    return function (v) {
        return f(v);
    };
});
var extendAdditive = new Control_Extend.Extend(function () {
    return functorAdditive;
}, function (f) {
    return function (x) {
        return f(x);
    };
});
var eqAdditive = function (dictEq) {
    return dictEq;
};
var comonadAdditive = new Control_Comonad.Comonad(function () {
    return extendAdditive;
}, Data_Newtype.unwrap(newtypeAdditive));
var boundedAdditive = function (dictBounded) {
    return dictBounded;
};
var applyAdditive = new Control_Apply.Apply(function () {
    return functorAdditive;
}, function (v) {
    return function (v1) {
        return v(v1);
    };
});
var bindAdditive = new Control_Bind.Bind(function () {
    return applyAdditive;
}, function (v) {
    return function (f) {
        return f(v);
    };
});
var applicativeAdditive = new Control_Applicative.Applicative(function () {
    return applyAdditive;
}, Additive);
var monadAdditive = new Control_Monad.Monad(function () {
    return applicativeAdditive;
}, function () {
    return bindAdditive;
});
module.exports = {
    Additive: Additive,
    newtypeAdditive: newtypeAdditive,
    eqAdditive: eqAdditive,
    ordAdditive: ordAdditive,
    boundedAdditive: boundedAdditive,
    functorAdditive: functorAdditive,
    invariantAdditive: invariantAdditive,
    applyAdditive: applyAdditive,
    applicativeAdditive: applicativeAdditive,
    bindAdditive: bindAdditive,
    monadAdditive: monadAdditive,
    extendAdditive: extendAdditive,
    comonadAdditive: comonadAdditive,
    showAdditive: showAdditive,
    semigroupAdditive: semigroupAdditive,
    monoidAdditive: monoidAdditive
};

},{"../Control.Applicative":35,"../Control.Apply":37,"../Control.Bind":41,"../Control.Comonad":43,"../Control.Extend":45,"../Control.Monad":58,"../Data.Bounded":80,"../Data.Eq":86,"../Data.Functor":98,"../Data.Functor.Invariant":96,"../Data.Monoid":115,"../Data.Newtype":117,"../Data.Ord":122,"../Data.Semigroup":130,"../Data.Semiring":132,"../Data.Show":134,"../Prelude":152}],110:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Applicative = require("../Control.Applicative");
var Control_Apply = require("../Control.Apply");
var Control_Bind = require("../Control.Bind");
var Control_Comonad = require("../Control.Comonad");
var Control_Extend = require("../Control.Extend");
var Control_Monad = require("../Control.Monad");
var Data_Bounded = require("../Data.Bounded");
var Data_Eq = require("../Data.Eq");
var Data_Functor = require("../Data.Functor");
var Data_Functor_Invariant = require("../Data.Functor.Invariant");
var Data_HeytingAlgebra = require("../Data.HeytingAlgebra");
var Data_Monoid = require("../Data.Monoid");
var Data_Newtype = require("../Data.Newtype");
var Data_Ord = require("../Data.Ord");
var Data_Semigroup = require("../Data.Semigroup");
var Data_Semiring = require("../Data.Semiring");
var Data_Show = require("../Data.Show");
var Prelude = require("../Prelude");
var Conj = function (x) {
    return x;
};
var showConj = function (dictShow) {
    return new Data_Show.Show(function (v) {
        return "(Conj " + (Data_Show.show(dictShow)(v) + ")");
    });
};
var semiringConj = function (dictHeytingAlgebra) {
    return new Data_Semiring.Semiring(function (v) {
        return function (v1) {
            return Data_HeytingAlgebra.conj(dictHeytingAlgebra)(v)(v1);
        };
    }, function (v) {
        return function (v1) {
            return Data_HeytingAlgebra.disj(dictHeytingAlgebra)(v)(v1);
        };
    }, Data_HeytingAlgebra.ff(dictHeytingAlgebra), Data_HeytingAlgebra.tt(dictHeytingAlgebra));
};
var semigroupConj = function (dictHeytingAlgebra) {
    return new Data_Semigroup.Semigroup(function (v) {
        return function (v1) {
            return Data_HeytingAlgebra.conj(dictHeytingAlgebra)(v)(v1);
        };
    });
};
var ordConj = function (dictOrd) {
    return dictOrd;
};
var newtypeConj = new Data_Newtype.Newtype(function (n) {
    return n;
}, Conj);
var monoidConj = function (dictHeytingAlgebra) {
    return new Data_Monoid.Monoid(function () {
        return semigroupConj(dictHeytingAlgebra);
    }, Data_HeytingAlgebra.tt(dictHeytingAlgebra));
};
var invariantConj = new Data_Functor_Invariant.Invariant(function (f) {
    return function (v) {
        return function (v1) {
            return f(v1);
        };
    };
});
var functorConj = new Data_Functor.Functor(function (f) {
    return function (v) {
        return f(v);
    };
});
var extendConj = new Control_Extend.Extend(function () {
    return functorConj;
}, function (f) {
    return function (x) {
        return f(x);
    };
});
var eqConj = function (dictEq) {
    return dictEq;
};
var comonadConj = new Control_Comonad.Comonad(function () {
    return extendConj;
}, Data_Newtype.unwrap(newtypeConj));
var boundedConj = function (dictBounded) {
    return dictBounded;
};
var applyConj = new Control_Apply.Apply(function () {
    return functorConj;
}, function (v) {
    return function (v1) {
        return v(v1);
    };
});
var bindConj = new Control_Bind.Bind(function () {
    return applyConj;
}, function (v) {
    return function (f) {
        return f(v);
    };
});
var applicativeConj = new Control_Applicative.Applicative(function () {
    return applyConj;
}, Conj);
var monadConj = new Control_Monad.Monad(function () {
    return applicativeConj;
}, function () {
    return bindConj;
});
module.exports = {
    Conj: Conj,
    newtypeConj: newtypeConj,
    eqConj: eqConj,
    ordConj: ordConj,
    boundedConj: boundedConj,
    functorConj: functorConj,
    invariantConj: invariantConj,
    applyConj: applyConj,
    applicativeConj: applicativeConj,
    bindConj: bindConj,
    monadConj: monadConj,
    extendConj: extendConj,
    comonadConj: comonadConj,
    showConj: showConj,
    semigroupConj: semigroupConj,
    monoidConj: monoidConj,
    semiringConj: semiringConj
};

},{"../Control.Applicative":35,"../Control.Apply":37,"../Control.Bind":41,"../Control.Comonad":43,"../Control.Extend":45,"../Control.Monad":58,"../Data.Bounded":80,"../Data.Eq":86,"../Data.Functor":98,"../Data.Functor.Invariant":96,"../Data.HeytingAlgebra":104,"../Data.Monoid":115,"../Data.Newtype":117,"../Data.Ord":122,"../Data.Semigroup":130,"../Data.Semiring":132,"../Data.Show":134,"../Prelude":152}],111:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Applicative = require("../Control.Applicative");
var Control_Apply = require("../Control.Apply");
var Control_Bind = require("../Control.Bind");
var Control_Comonad = require("../Control.Comonad");
var Control_Extend = require("../Control.Extend");
var Control_Monad = require("../Control.Monad");
var Data_Bounded = require("../Data.Bounded");
var Data_Eq = require("../Data.Eq");
var Data_Functor = require("../Data.Functor");
var Data_Functor_Invariant = require("../Data.Functor.Invariant");
var Data_HeytingAlgebra = require("../Data.HeytingAlgebra");
var Data_Monoid = require("../Data.Monoid");
var Data_Newtype = require("../Data.Newtype");
var Data_Ord = require("../Data.Ord");
var Data_Semigroup = require("../Data.Semigroup");
var Data_Semiring = require("../Data.Semiring");
var Data_Show = require("../Data.Show");
var Prelude = require("../Prelude");
var Disj = function (x) {
    return x;
};
var showDisj = function (dictShow) {
    return new Data_Show.Show(function (v) {
        return "(Disj " + (Data_Show.show(dictShow)(v) + ")");
    });
};
var semiringDisj = function (dictHeytingAlgebra) {
    return new Data_Semiring.Semiring(function (v) {
        return function (v1) {
            return Data_HeytingAlgebra.disj(dictHeytingAlgebra)(v)(v1);
        };
    }, function (v) {
        return function (v1) {
            return Data_HeytingAlgebra.conj(dictHeytingAlgebra)(v)(v1);
        };
    }, Data_HeytingAlgebra.tt(dictHeytingAlgebra), Data_HeytingAlgebra.ff(dictHeytingAlgebra));
};
var semigroupDisj = function (dictHeytingAlgebra) {
    return new Data_Semigroup.Semigroup(function (v) {
        return function (v1) {
            return Data_HeytingAlgebra.disj(dictHeytingAlgebra)(v)(v1);
        };
    });
};
var ordDisj = function (dictOrd) {
    return dictOrd;
};
var newtypeDisj = new Data_Newtype.Newtype(function (n) {
    return n;
}, Disj);
var monoidDisj = function (dictHeytingAlgebra) {
    return new Data_Monoid.Monoid(function () {
        return semigroupDisj(dictHeytingAlgebra);
    }, Data_HeytingAlgebra.ff(dictHeytingAlgebra));
};
var invariantDisj = new Data_Functor_Invariant.Invariant(function (f) {
    return function (v) {
        return function (v1) {
            return f(v1);
        };
    };
});
var functorDisj = new Data_Functor.Functor(function (f) {
    return function (v) {
        return f(v);
    };
});
var extendDisj = new Control_Extend.Extend(function () {
    return functorDisj;
}, function (f) {
    return function (x) {
        return f(x);
    };
});
var eqDisj = function (dictEq) {
    return dictEq;
};
var comonadDisj = new Control_Comonad.Comonad(function () {
    return extendDisj;
}, Data_Newtype.unwrap(newtypeDisj));
var boundedDisj = function (dictBounded) {
    return dictBounded;
};
var applyDisj = new Control_Apply.Apply(function () {
    return functorDisj;
}, function (v) {
    return function (v1) {
        return v(v1);
    };
});
var bindDisj = new Control_Bind.Bind(function () {
    return applyDisj;
}, function (v) {
    return function (f) {
        return f(v);
    };
});
var applicativeDisj = new Control_Applicative.Applicative(function () {
    return applyDisj;
}, Disj);
var monadDisj = new Control_Monad.Monad(function () {
    return applicativeDisj;
}, function () {
    return bindDisj;
});
module.exports = {
    Disj: Disj,
    newtypeDisj: newtypeDisj,
    eqDisj: eqDisj,
    ordDisj: ordDisj,
    boundedDisj: boundedDisj,
    functorDisj: functorDisj,
    invariantDisj: invariantDisj,
    applyDisj: applyDisj,
    applicativeDisj: applicativeDisj,
    bindDisj: bindDisj,
    monadDisj: monadDisj,
    extendDisj: extendDisj,
    comonadDisj: comonadDisj,
    showDisj: showDisj,
    semigroupDisj: semigroupDisj,
    monoidDisj: monoidDisj,
    semiringDisj: semiringDisj
};

},{"../Control.Applicative":35,"../Control.Apply":37,"../Control.Bind":41,"../Control.Comonad":43,"../Control.Extend":45,"../Control.Monad":58,"../Data.Bounded":80,"../Data.Eq":86,"../Data.Functor":98,"../Data.Functor.Invariant":96,"../Data.HeytingAlgebra":104,"../Data.Monoid":115,"../Data.Newtype":117,"../Data.Ord":122,"../Data.Semigroup":130,"../Data.Semiring":132,"../Data.Show":134,"../Prelude":152}],112:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Applicative = require("../Control.Applicative");
var Control_Apply = require("../Control.Apply");
var Control_Bind = require("../Control.Bind");
var Control_Comonad = require("../Control.Comonad");
var Control_Extend = require("../Control.Extend");
var Control_Monad = require("../Control.Monad");
var Data_Bounded = require("../Data.Bounded");
var Data_Eq = require("../Data.Eq");
var Data_Functor = require("../Data.Functor");
var Data_Functor_Invariant = require("../Data.Functor.Invariant");
var Data_Monoid = require("../Data.Monoid");
var Data_Newtype = require("../Data.Newtype");
var Data_Ord = require("../Data.Ord");
var Data_Semigroup = require("../Data.Semigroup");
var Data_Show = require("../Data.Show");
var Prelude = require("../Prelude");
var Dual = function (x) {
    return x;
};
var showDual = function (dictShow) {
    return new Data_Show.Show(function (v) {
        return "(Dual " + (Data_Show.show(dictShow)(v) + ")");
    });
};
var semigroupDual = function (dictSemigroup) {
    return new Data_Semigroup.Semigroup(function (v) {
        return function (v1) {
            return Data_Semigroup.append(dictSemigroup)(v1)(v);
        };
    });
};
var ordDual = function (dictOrd) {
    return dictOrd;
};
var newtypeDual = new Data_Newtype.Newtype(function (n) {
    return n;
}, Dual);
var monoidDual = function (dictMonoid) {
    return new Data_Monoid.Monoid(function () {
        return semigroupDual(dictMonoid.Semigroup0());
    }, Data_Monoid.mempty(dictMonoid));
};
var invariantDual = new Data_Functor_Invariant.Invariant(function (f) {
    return function (v) {
        return function (v1) {
            return f(v1);
        };
    };
});
var functorDual = new Data_Functor.Functor(function (f) {
    return function (v) {
        return f(v);
    };
});
var extendDual = new Control_Extend.Extend(function () {
    return functorDual;
}, function (f) {
    return function (x) {
        return f(x);
    };
});
var eqDual = function (dictEq) {
    return dictEq;
};
var comonadDual = new Control_Comonad.Comonad(function () {
    return extendDual;
}, Data_Newtype.unwrap(newtypeDual));
var boundedDual = function (dictBounded) {
    return dictBounded;
};
var applyDual = new Control_Apply.Apply(function () {
    return functorDual;
}, function (v) {
    return function (v1) {
        return v(v1);
    };
});
var bindDual = new Control_Bind.Bind(function () {
    return applyDual;
}, function (v) {
    return function (f) {
        return f(v);
    };
});
var applicativeDual = new Control_Applicative.Applicative(function () {
    return applyDual;
}, Dual);
var monadDual = new Control_Monad.Monad(function () {
    return applicativeDual;
}, function () {
    return bindDual;
});
module.exports = {
    Dual: Dual,
    newtypeDual: newtypeDual,
    eqDual: eqDual,
    ordDual: ordDual,
    boundedDual: boundedDual,
    functorDual: functorDual,
    invariantDual: invariantDual,
    applyDual: applyDual,
    applicativeDual: applicativeDual,
    bindDual: bindDual,
    monadDual: monadDual,
    extendDual: extendDual,
    comonadDual: comonadDual,
    showDual: showDual,
    semigroupDual: semigroupDual,
    monoidDual: monoidDual
};

},{"../Control.Applicative":35,"../Control.Apply":37,"../Control.Bind":41,"../Control.Comonad":43,"../Control.Extend":45,"../Control.Monad":58,"../Data.Bounded":80,"../Data.Eq":86,"../Data.Functor":98,"../Data.Functor.Invariant":96,"../Data.Monoid":115,"../Data.Newtype":117,"../Data.Ord":122,"../Data.Semigroup":130,"../Data.Show":134,"../Prelude":152}],113:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Category = require("../Control.Category");
var Control_Semigroupoid = require("../Control.Semigroupoid");
var Data_Functor_Invariant = require("../Data.Functor.Invariant");
var Data_Monoid = require("../Data.Monoid");
var Data_Newtype = require("../Data.Newtype");
var Data_Semigroup = require("../Data.Semigroup");
var Prelude = require("../Prelude");
var Endo = function (x) {
    return x;
};
var semigroupEndo = new Data_Semigroup.Semigroup(function (v) {
    return function (v1) {
        return function ($11) {
            return v(v1($11));
        };
    };
});
var newtypeEndo = new Data_Newtype.Newtype(function (n) {
    return n;
}, Endo);
var monoidEndo = new Data_Monoid.Monoid(function () {
    return semigroupEndo;
}, Control_Category.id(Control_Category.categoryFn));
var invariantEndo = new Data_Functor_Invariant.Invariant(function (ab) {
    return function (ba) {
        return function (v) {
            return function ($12) {
                return ab(v(ba($12)));
            };
        };
    };
});
module.exports = {
    Endo: Endo,
    newtypeEndo: newtypeEndo,
    invariantEndo: invariantEndo,
    semigroupEndo: semigroupEndo,
    monoidEndo: monoidEndo
};

},{"../Control.Category":42,"../Control.Semigroupoid":61,"../Data.Functor.Invariant":96,"../Data.Monoid":115,"../Data.Newtype":117,"../Data.Semigroup":130,"../Prelude":152}],114:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Applicative = require("../Control.Applicative");
var Control_Apply = require("../Control.Apply");
var Control_Bind = require("../Control.Bind");
var Control_Comonad = require("../Control.Comonad");
var Control_Extend = require("../Control.Extend");
var Control_Monad = require("../Control.Monad");
var Data_Bounded = require("../Data.Bounded");
var Data_Eq = require("../Data.Eq");
var Data_Functor = require("../Data.Functor");
var Data_Functor_Invariant = require("../Data.Functor.Invariant");
var Data_Monoid = require("../Data.Monoid");
var Data_Newtype = require("../Data.Newtype");
var Data_Ord = require("../Data.Ord");
var Data_Semigroup = require("../Data.Semigroup");
var Data_Semiring = require("../Data.Semiring");
var Data_Show = require("../Data.Show");
var Prelude = require("../Prelude");
var Multiplicative = function (x) {
    return x;
};
var showMultiplicative = function (dictShow) {
    return new Data_Show.Show(function (v) {
        return "(Multiplicative " + (Data_Show.show(dictShow)(v) + ")");
    });
};
var semigroupMultiplicative = function (dictSemiring) {
    return new Data_Semigroup.Semigroup(function (v) {
        return function (v1) {
            return Data_Semiring.mul(dictSemiring)(v)(v1);
        };
    });
};
var ordMultiplicative = function (dictOrd) {
    return dictOrd;
};
var newtypeMultiplicative = new Data_Newtype.Newtype(function (n) {
    return n;
}, Multiplicative);
var monoidMultiplicative = function (dictSemiring) {
    return new Data_Monoid.Monoid(function () {
        return semigroupMultiplicative(dictSemiring);
    }, Data_Semiring.one(dictSemiring));
};
var invariantMultiplicative = new Data_Functor_Invariant.Invariant(function (f) {
    return function (v) {
        return function (v1) {
            return f(v1);
        };
    };
});
var functorMultiplicative = new Data_Functor.Functor(function (f) {
    return function (v) {
        return f(v);
    };
});
var extendMultiplicative = new Control_Extend.Extend(function () {
    return functorMultiplicative;
}, function (f) {
    return function (x) {
        return f(x);
    };
});
var eqMultiplicative = function (dictEq) {
    return dictEq;
};
var comonadMultiplicative = new Control_Comonad.Comonad(function () {
    return extendMultiplicative;
}, Data_Newtype.unwrap(newtypeMultiplicative));
var boundedMultiplicative = function (dictBounded) {
    return dictBounded;
};
var applyMultiplicative = new Control_Apply.Apply(function () {
    return functorMultiplicative;
}, function (v) {
    return function (v1) {
        return v(v1);
    };
});
var bindMultiplicative = new Control_Bind.Bind(function () {
    return applyMultiplicative;
}, function (v) {
    return function (f) {
        return f(v);
    };
});
var applicativeMultiplicative = new Control_Applicative.Applicative(function () {
    return applyMultiplicative;
}, Multiplicative);
var monadMultiplicative = new Control_Monad.Monad(function () {
    return applicativeMultiplicative;
}, function () {
    return bindMultiplicative;
});
module.exports = {
    Multiplicative: Multiplicative,
    newtypeMultiplicative: newtypeMultiplicative,
    eqMultiplicative: eqMultiplicative,
    ordMultiplicative: ordMultiplicative,
    boundedMultiplicative: boundedMultiplicative,
    functorMultiplicative: functorMultiplicative,
    invariantMultiplicative: invariantMultiplicative,
    applyMultiplicative: applyMultiplicative,
    applicativeMultiplicative: applicativeMultiplicative,
    bindMultiplicative: bindMultiplicative,
    monadMultiplicative: monadMultiplicative,
    extendMultiplicative: extendMultiplicative,
    comonadMultiplicative: comonadMultiplicative,
    showMultiplicative: showMultiplicative,
    semigroupMultiplicative: semigroupMultiplicative,
    monoidMultiplicative: monoidMultiplicative
};

},{"../Control.Applicative":35,"../Control.Apply":37,"../Control.Bind":41,"../Control.Comonad":43,"../Control.Extend":45,"../Control.Monad":58,"../Data.Bounded":80,"../Data.Eq":86,"../Data.Functor":98,"../Data.Functor.Invariant":96,"../Data.Monoid":115,"../Data.Newtype":117,"../Data.Ord":122,"../Data.Semigroup":130,"../Data.Semiring":132,"../Data.Show":134,"../Prelude":152}],115:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Data_Boolean = require("../Data.Boolean");
var Data_Eq = require("../Data.Eq");
var Data_EuclideanRing = require("../Data.EuclideanRing");
var Data_Function = require("../Data.Function");
var Data_Ord = require("../Data.Ord");
var Data_Ordering = require("../Data.Ordering");
var Data_Semigroup = require("../Data.Semigroup");
var Data_Unit = require("../Data.Unit");
var Prelude = require("../Prelude");
var Monoid = function (Semigroup0, mempty) {
    this.Semigroup0 = Semigroup0;
    this.mempty = mempty;
};
var monoidUnit = new Monoid(function () {
    return Data_Semigroup.semigroupUnit;
}, Data_Unit.unit);
var monoidString = new Monoid(function () {
    return Data_Semigroup.semigroupString;
}, "");
var monoidOrdering = new Monoid(function () {
    return Data_Ordering.semigroupOrdering;
}, Data_Ordering.EQ.value);
var monoidArray = new Monoid(function () {
    return Data_Semigroup.semigroupArray;
}, [  ]);
var mempty = function (dict) {
    return dict.mempty;
};
var monoidFn = function (dictMonoid) {
    return new Monoid(function () {
        return Data_Semigroup.semigroupFn(dictMonoid.Semigroup0());
    }, Data_Function["const"](mempty(dictMonoid)));
};
var power = function (dictMonoid) {
    return function (x) {
        var go = function (p) {
            if (p <= 0) {
                return mempty(dictMonoid);
            };
            if (p === 1) {
                return x;
            };
            if (p % 2 === 0) {
                var x$prime = go(p / 2 | 0);
                return Data_Semigroup.append(dictMonoid.Semigroup0())(x$prime)(x$prime);
            };
            if (Data_Boolean.otherwise) {
                var x$prime = go(p / 2 | 0);
                return Data_Semigroup.append(dictMonoid.Semigroup0())(x$prime)(Data_Semigroup.append(dictMonoid.Semigroup0())(x$prime)(x));
            };
            throw new Error("Failed pattern match at Data.Monoid line 52, column 3 - line 52, column 17: " + [ p.constructor.name ]);
        };
        return go;
    };
};
var guard = function (dictMonoid) {
    return function (v) {
        return function (v1) {
            if (v) {
                return v1;
            };
            if (!v) {
                return mempty(dictMonoid);
            };
            throw new Error("Failed pattern match at Data.Monoid line 60, column 1 - line 60, column 49: " + [ v.constructor.name, v1.constructor.name ]);
        };
    };
};
module.exports = {
    Monoid: Monoid,
    mempty: mempty,
    power: power,
    guard: guard,
    monoidUnit: monoidUnit,
    monoidOrdering: monoidOrdering,
    monoidFn: monoidFn,
    monoidString: monoidString,
    monoidArray: monoidArray
};

},{"../Data.Boolean":77,"../Data.Eq":86,"../Data.EuclideanRing":88,"../Data.Function":95,"../Data.Ord":122,"../Data.Ordering":123,"../Data.Semigroup":130,"../Data.Unit":145,"../Prelude":152}],116:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
module.exports = {};

},{}],117:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Semigroupoid = require("../Control.Semigroupoid");
var Data_Function = require("../Data.Function");
var Data_Functor = require("../Data.Functor");
var Prelude = require("../Prelude");
var Newtype = function (unwrap, wrap) {
    this.unwrap = unwrap;
    this.wrap = wrap;
};
var wrap = function (dict) {
    return dict.wrap;
};
var unwrap = function (dict) {
    return dict.unwrap;
};
var underF2 = function (dictFunctor) {
    return function (dictFunctor1) {
        return function (dictNewtype) {
            return function (dictNewtype1) {
                return function (v) {
                    return function (f) {
                        return function ($50) {
                            return function ($51) {
                                return Data_Functor.map(dictFunctor1)(unwrap(dictNewtype1))(Data_Function.on(f)(Data_Functor.map(dictFunctor)(wrap(dictNewtype)))($50)($51));
                            };
                        };
                    };
                };
            };
        };
    };
};
var underF = function (dictFunctor) {
    return function (dictFunctor1) {
        return function (dictNewtype) {
            return function (dictNewtype1) {
                return function (v) {
                    return function (f) {
                        return function ($52) {
                            return Data_Functor.map(dictFunctor1)(unwrap(dictNewtype1))(f(Data_Functor.map(dictFunctor)(wrap(dictNewtype))($52)));
                        };
                    };
                };
            };
        };
    };
};
var under2 = function (dictNewtype) {
    return function (dictNewtype1) {
        return function (v) {
            return function (f) {
                return function ($53) {
                    return function ($54) {
                        return unwrap(dictNewtype1)(Data_Function.on(f)(wrap(dictNewtype))($53)($54));
                    };
                };
            };
        };
    };
};
var under = function (dictNewtype) {
    return function (dictNewtype1) {
        return function (v) {
            return function (f) {
                return function ($55) {
                    return unwrap(dictNewtype1)(f(wrap(dictNewtype)($55)));
                };
            };
        };
    };
};
var un = function (dictNewtype) {
    return function (v) {
        return unwrap(dictNewtype);
    };
};
var traverse = function (dictFunctor) {
    return function (dictNewtype) {
        return function (v) {
            return function (f) {
                return function ($56) {
                    return Data_Functor.map(dictFunctor)(wrap(dictNewtype))(f(unwrap(dictNewtype)($56)));
                };
            };
        };
    };
};
var overF2 = function (dictFunctor) {
    return function (dictFunctor1) {
        return function (dictNewtype) {
            return function (dictNewtype1) {
                return function (v) {
                    return function (f) {
                        return function ($57) {
                            return function ($58) {
                                return Data_Functor.map(dictFunctor1)(wrap(dictNewtype1))(Data_Function.on(f)(Data_Functor.map(dictFunctor)(unwrap(dictNewtype)))($57)($58));
                            };
                        };
                    };
                };
            };
        };
    };
};
var overF = function (dictFunctor) {
    return function (dictFunctor1) {
        return function (dictNewtype) {
            return function (dictNewtype1) {
                return function (v) {
                    return function (f) {
                        return function ($59) {
                            return Data_Functor.map(dictFunctor1)(wrap(dictNewtype1))(f(Data_Functor.map(dictFunctor)(unwrap(dictNewtype))($59)));
                        };
                    };
                };
            };
        };
    };
};
var over2 = function (dictNewtype) {
    return function (dictNewtype1) {
        return function (v) {
            return function (f) {
                return function ($60) {
                    return function ($61) {
                        return wrap(dictNewtype1)(Data_Function.on(f)(unwrap(dictNewtype))($60)($61));
                    };
                };
            };
        };
    };
};
var over = function (dictNewtype) {
    return function (dictNewtype1) {
        return function (v) {
            return function (f) {
                return function ($62) {
                    return wrap(dictNewtype1)(f(unwrap(dictNewtype)($62)));
                };
            };
        };
    };
};
var op = function (dictNewtype) {
    return un(dictNewtype);
};
var collect = function (dictFunctor) {
    return function (dictNewtype) {
        return function (v) {
            return function (f) {
                return function ($63) {
                    return wrap(dictNewtype)(f(Data_Functor.map(dictFunctor)(unwrap(dictNewtype))($63)));
                };
            };
        };
    };
};
var alaF = function (dictFunctor) {
    return function (dictFunctor1) {
        return function (dictNewtype) {
            return function (dictNewtype1) {
                return function (v) {
                    return function (f) {
                        return function ($64) {
                            return Data_Functor.map(dictFunctor1)(unwrap(dictNewtype1))(f(Data_Functor.map(dictFunctor)(wrap(dictNewtype))($64)));
                        };
                    };
                };
            };
        };
    };
};
var ala = function (dictFunctor) {
    return function (dictNewtype) {
        return function (dictNewtype1) {
            return function (v) {
                return function (f) {
                    return Data_Functor.map(dictFunctor)(unwrap(dictNewtype))(f(wrap(dictNewtype1)));
                };
            };
        };
    };
};
module.exports = {
    unwrap: unwrap,
    wrap: wrap,
    Newtype: Newtype,
    un: un,
    op: op,
    ala: ala,
    alaF: alaF,
    over: over,
    overF: overF,
    under: under,
    underF: underF,
    over2: over2,
    overF2: overF2,
    under2: under2,
    underF2: underF2,
    traverse: traverse,
    collect: collect
};

},{"../Control.Semigroupoid":61,"../Data.Function":95,"../Data.Functor":98,"../Prelude":152}],118:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Alt = require("../Control.Alt");
var Control_Alternative = require("../Control.Alternative");
var Control_Applicative = require("../Control.Applicative");
var Control_Apply = require("../Control.Apply");
var Control_Category = require("../Control.Category");
var Control_Plus = require("../Control.Plus");
var Control_Semigroupoid = require("../Control.Semigroupoid");
var Data_Eq = require("../Data.Eq");
var Data_Foldable = require("../Data.Foldable");
var Data_FoldableWithIndex = require("../Data.FoldableWithIndex");
var Data_Functor = require("../Data.Functor");
var Data_FunctorWithIndex = require("../Data.FunctorWithIndex");
var Data_HeytingAlgebra = require("../Data.HeytingAlgebra");
var Data_Maybe = require("../Data.Maybe");
var Data_Ord = require("../Data.Ord");
var Data_Ordering = require("../Data.Ordering");
var Data_Semigroup = require("../Data.Semigroup");
var Data_Semigroup_Foldable = require("../Data.Semigroup.Foldable");
var Data_Show = require("../Data.Show");
var Data_Traversable = require("../Data.Traversable");
var Data_TraversableWithIndex = require("../Data.TraversableWithIndex");
var Prelude = require("../Prelude");
var NonEmpty = (function () {
    function NonEmpty(value0, value1) {
        this.value0 = value0;
        this.value1 = value1;
    };
    NonEmpty.create = function (value0) {
        return function (value1) {
            return new NonEmpty(value0, value1);
        };
    };
    return NonEmpty;
})();
var tail = function (v) {
    return v.value1;
};
var singleton = function (dictPlus) {
    return function (a) {
        return new NonEmpty(a, Control_Plus.empty(dictPlus));
    };
};
var showNonEmpty = function (dictShow) {
    return function (dictShow1) {
        return new Data_Show.Show(function (v) {
            return "(NonEmpty " + (Data_Show.show(dictShow)(v.value0) + (" " + (Data_Show.show(dictShow1)(v.value1) + ")")));
        });
    };
};
var oneOf = function (dictAlternative) {
    return function (v) {
        return Control_Alt.alt((dictAlternative.Plus1()).Alt0())(Control_Applicative.pure(dictAlternative.Applicative0())(v.value0))(v.value1);
    };
};
var head = function (v) {
    return v.value0;
};
var functorNonEmpty = function (dictFunctor) {
    return new Data_Functor.Functor(function (f) {
        return function (v) {
            return new NonEmpty(f(v.value0), Data_Functor.map(dictFunctor)(f)(v.value1));
        };
    });
};
var functorWithIndex = function (dictFunctorWithIndex) {
    return new Data_FunctorWithIndex.FunctorWithIndex(function () {
        return functorNonEmpty(dictFunctorWithIndex.Functor0());
    }, function (f) {
        return function (v) {
            return new NonEmpty(f(Data_Maybe.Nothing.value)(v.value0), Data_FunctorWithIndex.mapWithIndex(dictFunctorWithIndex)(function ($139) {
                return f(Data_Maybe.Just.create($139));
            })(v.value1));
        };
    });
};
var fromNonEmpty = function (f) {
    return function (v) {
        return f(v.value0)(v.value1);
    };
};
var foldl1 = function (dictFoldable) {
    return function (f) {
        return function (v) {
            return Data_Foldable.foldl(dictFoldable)(f)(v.value0)(v.value1);
        };
    };
};
var foldableNonEmpty = function (dictFoldable) {
    return new Data_Foldable.Foldable(function (dictMonoid) {
        return function (f) {
            return function (v) {
                return Data_Semigroup.append(dictMonoid.Semigroup0())(f(v.value0))(Data_Foldable.foldMap(dictFoldable)(dictMonoid)(f)(v.value1));
            };
        };
    }, function (f) {
        return function (b) {
            return function (v) {
                return Data_Foldable.foldl(dictFoldable)(f)(f(b)(v.value0))(v.value1);
            };
        };
    }, function (f) {
        return function (b) {
            return function (v) {
                return f(v.value0)(Data_Foldable.foldr(dictFoldable)(f)(b)(v.value1));
            };
        };
    });
};
var foldableWithIndexNonEmpty = function (dictFoldableWithIndex) {
    return new Data_FoldableWithIndex.FoldableWithIndex(function () {
        return foldableNonEmpty(dictFoldableWithIndex.Foldable0());
    }, function (dictMonoid) {
        return function (f) {
            return function (v) {
                return Data_Semigroup.append(dictMonoid.Semigroup0())(f(Data_Maybe.Nothing.value)(v.value0))(Data_FoldableWithIndex.foldMapWithIndex(dictFoldableWithIndex)(dictMonoid)(function ($140) {
                    return f(Data_Maybe.Just.create($140));
                })(v.value1));
            };
        };
    }, function (f) {
        return function (b) {
            return function (v) {
                return Data_FoldableWithIndex.foldlWithIndex(dictFoldableWithIndex)(function ($141) {
                    return f(Data_Maybe.Just.create($141));
                })(f(Data_Maybe.Nothing.value)(b)(v.value0))(v.value1);
            };
        };
    }, function (f) {
        return function (b) {
            return function (v) {
                return f(Data_Maybe.Nothing.value)(v.value0)(Data_FoldableWithIndex.foldrWithIndex(dictFoldableWithIndex)(function ($142) {
                    return f(Data_Maybe.Just.create($142));
                })(b)(v.value1));
            };
        };
    });
};
var traversableNonEmpty = function (dictTraversable) {
    return new Data_Traversable.Traversable(function () {
        return foldableNonEmpty(dictTraversable.Foldable1());
    }, function () {
        return functorNonEmpty(dictTraversable.Functor0());
    }, function (dictApplicative) {
        return function (v) {
            return Control_Apply.apply(dictApplicative.Apply0())(Data_Functor.map((dictApplicative.Apply0()).Functor0())(NonEmpty.create)(v.value0))(Data_Traversable.sequence(dictTraversable)(dictApplicative)(v.value1));
        };
    }, function (dictApplicative) {
        return function (f) {
            return function (v) {
                return Control_Apply.apply(dictApplicative.Apply0())(Data_Functor.map((dictApplicative.Apply0()).Functor0())(NonEmpty.create)(f(v.value0)))(Data_Traversable.traverse(dictTraversable)(dictApplicative)(f)(v.value1));
            };
        };
    });
};
var traversableWithIndexNonEmpty = function (dictTraversableWithIndex) {
    return new Data_TraversableWithIndex.TraversableWithIndex(function () {
        return foldableWithIndexNonEmpty(dictTraversableWithIndex.FoldableWithIndex1());
    }, function () {
        return functorWithIndex(dictTraversableWithIndex.FunctorWithIndex0());
    }, function () {
        return traversableNonEmpty(dictTraversableWithIndex.Traversable2());
    }, function (dictApplicative) {
        return function (f) {
            return function (v) {
                return Control_Apply.apply(dictApplicative.Apply0())(Data_Functor.map((dictApplicative.Apply0()).Functor0())(NonEmpty.create)(f(Data_Maybe.Nothing.value)(v.value0)))(Data_TraversableWithIndex.traverseWithIndex(dictTraversableWithIndex)(dictApplicative)(function ($143) {
                    return f(Data_Maybe.Just.create($143));
                })(v.value1));
            };
        };
    });
};
var foldable1NonEmpty = function (dictFoldable) {
    return new Data_Semigroup_Foldable.Foldable1(function () {
        return foldableNonEmpty(dictFoldable);
    }, function (dictSemigroup) {
        return foldMap1(dictSemigroup)(dictFoldable)(Control_Category.id(Control_Category.categoryFn));
    }, function (dictSemigroup) {
        return function (f) {
            return function (v) {
                return Data_Foldable.foldl(dictFoldable)(function (s) {
                    return function (a1) {
                        return Data_Semigroup.append(dictSemigroup)(s)(f(a1));
                    };
                })(f(v.value0))(v.value1);
            };
        };
    });
};
var foldMap1 = function (dictSemigroup) {
    return function (dictFoldable) {
        return Data_Semigroup_Foldable.foldMap1(foldable1NonEmpty(dictFoldable))(dictSemigroup);
    };
};
var fold1 = function (dictSemigroup) {
    return function (dictFoldable) {
        return Data_Semigroup_Foldable.fold1(foldable1NonEmpty(dictFoldable))(dictSemigroup);
    };
};
var eq1NonEmpty = function (dictEq1) {
    return new Data_Eq.Eq1(function (dictEq) {
        return function (v) {
            return function (v1) {
                return Data_Eq.eq(dictEq)(v.value0)(v1.value0) && Data_Eq.eq1(dictEq1)(dictEq)(v.value1)(v1.value1);
            };
        };
    });
};
var eqNonEmpty = function (dictEq1) {
    return function (dictEq) {
        return new Data_Eq.Eq(Data_Eq.eq1(eq1NonEmpty(dictEq1))(dictEq));
    };
};
var ord1NonEmpty = function (dictOrd1) {
    return new Data_Ord.Ord1(function () {
        return eq1NonEmpty(dictOrd1.Eq10());
    }, function (dictOrd) {
        return function (v) {
            return function (v1) {
                var v2 = Data_Ord.compare(dictOrd)(v.value0)(v1.value0);
                if (v2 instanceof Data_Ordering.EQ) {
                    return Data_Ord.compare1(dictOrd1)(dictOrd)(v.value1)(v1.value1);
                };
                return v2;
            };
        };
    });
};
var ordNonEmpty = function (dictOrd1) {
    return function (dictOrd) {
        return new Data_Ord.Ord(function () {
            return eqNonEmpty(dictOrd1.Eq10())(dictOrd.Eq0());
        }, Data_Ord.compare1(ord1NonEmpty(dictOrd1))(dictOrd));
    };
};
module.exports = {
    NonEmpty: NonEmpty,
    singleton: singleton,
    foldl1: foldl1,
    foldMap1: foldMap1,
    fold1: fold1,
    fromNonEmpty: fromNonEmpty,
    oneOf: oneOf,
    head: head,
    tail: tail,
    showNonEmpty: showNonEmpty,
    eqNonEmpty: eqNonEmpty,
    eq1NonEmpty: eq1NonEmpty,
    ordNonEmpty: ordNonEmpty,
    ord1NonEmpty: ord1NonEmpty,
    functorNonEmpty: functorNonEmpty,
    functorWithIndex: functorWithIndex,
    foldableNonEmpty: foldableNonEmpty,
    foldableWithIndexNonEmpty: foldableWithIndexNonEmpty,
    traversableNonEmpty: traversableNonEmpty,
    traversableWithIndexNonEmpty: traversableWithIndexNonEmpty,
    foldable1NonEmpty: foldable1NonEmpty
};

},{"../Control.Alt":33,"../Control.Alternative":34,"../Control.Applicative":35,"../Control.Apply":37,"../Control.Category":42,"../Control.Plus":60,"../Control.Semigroupoid":61,"../Data.Eq":86,"../Data.Foldable":91,"../Data.FoldableWithIndex":92,"../Data.Functor":98,"../Data.FunctorWithIndex":100,"../Data.HeytingAlgebra":104,"../Data.Maybe":108,"../Data.Ord":122,"../Data.Ordering":123,"../Data.Semigroup":130,"../Data.Semigroup.Foldable":128,"../Data.Show":134,"../Data.Traversable":139,"../Data.TraversableWithIndex":140,"../Prelude":152}],119:[function(require,module,exports){
"use strict";

exports.unsafeCompareImpl = function (lt) {
  return function (eq) {
    return function (gt) {
      return function (x) {
        return function (y) {
          return x < y ? lt : x === y ? eq : gt;
        };
      };
    };
  };
};

},{}],120:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var $foreign = require("./foreign");
var Data_Ordering = require("../Data.Ordering");
var unsafeCompare = $foreign.unsafeCompareImpl(Data_Ordering.LT.value)(Data_Ordering.EQ.value)(Data_Ordering.GT.value);
module.exports = {
    unsafeCompare: unsafeCompare
};

},{"../Data.Ordering":123,"./foreign":119}],121:[function(require,module,exports){
"use strict";

exports.ordArrayImpl = function (f) {
  return function (xs) {
    return function (ys) {
      var i = 0;
      var xlen = xs.length;
      var ylen = ys.length;
      while (i < xlen && i < ylen) {
        var x = xs[i];
        var y = ys[i];
        var o = f(x)(y);
        if (o !== 0) {
          return o;
        }
        i++;
      }
      if (xlen === ylen) {
        return 0;
      } else if (xlen > ylen) {
        return -1;
      } else {
        return 1;
      }
    };
  };
};

},{}],122:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var $foreign = require("./foreign");
var Data_Eq = require("../Data.Eq");
var Data_Function = require("../Data.Function");
var Data_Ord_Unsafe = require("../Data.Ord.Unsafe");
var Data_Ordering = require("../Data.Ordering");
var Data_Ring = require("../Data.Ring");
var Data_Semiring = require("../Data.Semiring");
var Data_Unit = require("../Data.Unit");
var Data_Void = require("../Data.Void");
var Ord = function (Eq0, compare) {
    this.Eq0 = Eq0;
    this.compare = compare;
};
var Ord1 = function (Eq10, compare1) {
    this.Eq10 = Eq10;
    this.compare1 = compare1;
};
var ordVoid = new Ord(function () {
    return Data_Eq.eqVoid;
}, function (v) {
    return function (v1) {
        return Data_Ordering.EQ.value;
    };
});
var ordUnit = new Ord(function () {
    return Data_Eq.eqUnit;
}, function (v) {
    return function (v1) {
        return Data_Ordering.EQ.value;
    };
});
var ordString = new Ord(function () {
    return Data_Eq.eqString;
}, Data_Ord_Unsafe.unsafeCompare);
var ordOrdering = new Ord(function () {
    return Data_Ordering.eqOrdering;
}, function (v) {
    return function (v1) {
        if (v instanceof Data_Ordering.LT && v1 instanceof Data_Ordering.LT) {
            return Data_Ordering.EQ.value;
        };
        if (v instanceof Data_Ordering.EQ && v1 instanceof Data_Ordering.EQ) {
            return Data_Ordering.EQ.value;
        };
        if (v instanceof Data_Ordering.GT && v1 instanceof Data_Ordering.GT) {
            return Data_Ordering.EQ.value;
        };
        if (v instanceof Data_Ordering.LT) {
            return Data_Ordering.LT.value;
        };
        if (v instanceof Data_Ordering.EQ && v1 instanceof Data_Ordering.LT) {
            return Data_Ordering.GT.value;
        };
        if (v instanceof Data_Ordering.EQ && v1 instanceof Data_Ordering.GT) {
            return Data_Ordering.LT.value;
        };
        if (v instanceof Data_Ordering.GT) {
            return Data_Ordering.GT.value;
        };
        throw new Error("Failed pattern match at Data.Ord line 68, column 1 - line 68, column 37: " + [ v.constructor.name, v1.constructor.name ]);
    };
});
var ordNumber = new Ord(function () {
    return Data_Eq.eqNumber;
}, Data_Ord_Unsafe.unsafeCompare);
var ordInt = new Ord(function () {
    return Data_Eq.eqInt;
}, Data_Ord_Unsafe.unsafeCompare);
var ordChar = new Ord(function () {
    return Data_Eq.eqChar;
}, Data_Ord_Unsafe.unsafeCompare);
var ordBoolean = new Ord(function () {
    return Data_Eq.eqBoolean;
}, Data_Ord_Unsafe.unsafeCompare);
var compare1 = function (dict) {
    return dict.compare1;
};
var compare = function (dict) {
    return dict.compare;
};
var comparing = function (dictOrd) {
    return function (f) {
        return Data_Function.on(compare(dictOrd))(f);
    };
};
var greaterThan = function (dictOrd) {
    return function (a1) {
        return function (a2) {
            var v = compare(dictOrd)(a1)(a2);
            if (v instanceof Data_Ordering.GT) {
                return true;
            };
            return false;
        };
    };
};
var greaterThanOrEq = function (dictOrd) {
    return function (a1) {
        return function (a2) {
            var v = compare(dictOrd)(a1)(a2);
            if (v instanceof Data_Ordering.LT) {
                return false;
            };
            return true;
        };
    };
};
var signum = function (dictOrd) {
    return function (dictRing) {
        return function (x) {
            var $33 = greaterThanOrEq(dictOrd)(x)(Data_Semiring.zero(dictRing.Semiring0()));
            if ($33) {
                return Data_Semiring.one(dictRing.Semiring0());
            };
            return Data_Ring.negate(dictRing)(Data_Semiring.one(dictRing.Semiring0()));
        };
    };
};
var lessThan = function (dictOrd) {
    return function (a1) {
        return function (a2) {
            var v = compare(dictOrd)(a1)(a2);
            if (v instanceof Data_Ordering.LT) {
                return true;
            };
            return false;
        };
    };
};
var lessThanOrEq = function (dictOrd) {
    return function (a1) {
        return function (a2) {
            var v = compare(dictOrd)(a1)(a2);
            if (v instanceof Data_Ordering.GT) {
                return false;
            };
            return true;
        };
    };
};
var max = function (dictOrd) {
    return function (x) {
        return function (y) {
            var v = compare(dictOrd)(x)(y);
            if (v instanceof Data_Ordering.LT) {
                return y;
            };
            if (v instanceof Data_Ordering.EQ) {
                return x;
            };
            if (v instanceof Data_Ordering.GT) {
                return x;
            };
            throw new Error("Failed pattern match at Data.Ord line 123, column 3 - line 126, column 12: " + [ v.constructor.name ]);
        };
    };
};
var min = function (dictOrd) {
    return function (x) {
        return function (y) {
            var v = compare(dictOrd)(x)(y);
            if (v instanceof Data_Ordering.LT) {
                return x;
            };
            if (v instanceof Data_Ordering.EQ) {
                return x;
            };
            if (v instanceof Data_Ordering.GT) {
                return y;
            };
            throw new Error("Failed pattern match at Data.Ord line 114, column 3 - line 117, column 12: " + [ v.constructor.name ]);
        };
    };
};
var ordArray = function (dictOrd) {
    return new Ord(function () {
        return Data_Eq.eqArray(dictOrd.Eq0());
    }, (function () {
        var toDelta = function (x) {
            return function (y) {
                var v = compare(dictOrd)(x)(y);
                if (v instanceof Data_Ordering.EQ) {
                    return 0;
                };
                if (v instanceof Data_Ordering.LT) {
                    return 1;
                };
                if (v instanceof Data_Ordering.GT) {
                    return -1 | 0;
                };
                throw new Error("Failed pattern match at Data.Ord line 61, column 7 - line 66, column 1: " + [ v.constructor.name ]);
            };
        };
        return function (xs) {
            return function (ys) {
                return compare(ordInt)(0)($foreign.ordArrayImpl(toDelta)(xs)(ys));
            };
        };
    })());
};
var ord1Array = new Ord1(function () {
    return Data_Eq.eq1Array;
}, function (dictOrd) {
    return compare(ordArray(dictOrd));
});
var clamp = function (dictOrd) {
    return function (low) {
        return function (hi) {
            return function (x) {
                return min(dictOrd)(hi)(max(dictOrd)(low)(x));
            };
        };
    };
};
var between = function (dictOrd) {
    return function (low) {
        return function (hi) {
            return function (x) {
                if (lessThan(dictOrd)(x)(low)) {
                    return false;
                };
                if (greaterThan(dictOrd)(x)(hi)) {
                    return false;
                };
                return true;
            };
        };
    };
};
var abs = function (dictOrd) {
    return function (dictRing) {
        return function (x) {
            var $42 = greaterThanOrEq(dictOrd)(x)(Data_Semiring.zero(dictRing.Semiring0()));
            if ($42) {
                return x;
            };
            return Data_Ring.negate(dictRing)(x);
        };
    };
};
module.exports = {
    Ord: Ord,
    compare: compare,
    Ord1: Ord1,
    compare1: compare1,
    lessThan: lessThan,
    lessThanOrEq: lessThanOrEq,
    greaterThan: greaterThan,
    greaterThanOrEq: greaterThanOrEq,
    comparing: comparing,
    min: min,
    max: max,
    clamp: clamp,
    between: between,
    abs: abs,
    signum: signum,
    ordBoolean: ordBoolean,
    ordInt: ordInt,
    ordNumber: ordNumber,
    ordString: ordString,
    ordChar: ordChar,
    ordUnit: ordUnit,
    ordVoid: ordVoid,
    ordArray: ordArray,
    ordOrdering: ordOrdering,
    ord1Array: ord1Array
};

},{"../Data.Eq":86,"../Data.Function":95,"../Data.Ord.Unsafe":120,"../Data.Ordering":123,"../Data.Ring":127,"../Data.Semiring":132,"../Data.Unit":145,"../Data.Void":146,"./foreign":121}],123:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Data_Eq = require("../Data.Eq");
var Data_Semigroup = require("../Data.Semigroup");
var Data_Show = require("../Data.Show");
var LT = (function () {
    function LT() {

    };
    LT.value = new LT();
    return LT;
})();
var GT = (function () {
    function GT() {

    };
    GT.value = new GT();
    return GT;
})();
var EQ = (function () {
    function EQ() {

    };
    EQ.value = new EQ();
    return EQ;
})();
var showOrdering = new Data_Show.Show(function (v) {
    if (v instanceof LT) {
        return "LT";
    };
    if (v instanceof GT) {
        return "GT";
    };
    if (v instanceof EQ) {
        return "EQ";
    };
    throw new Error("Failed pattern match at Data.Ordering line 26, column 1 - line 26, column 39: " + [ v.constructor.name ]);
});
var semigroupOrdering = new Data_Semigroup.Semigroup(function (v) {
    return function (v1) {
        if (v instanceof LT) {
            return LT.value;
        };
        if (v instanceof GT) {
            return GT.value;
        };
        if (v instanceof EQ) {
            return v1;
        };
        throw new Error("Failed pattern match at Data.Ordering line 21, column 1 - line 21, column 49: " + [ v.constructor.name, v1.constructor.name ]);
    };
});
var invert = function (v) {
    if (v instanceof GT) {
        return LT.value;
    };
    if (v instanceof EQ) {
        return EQ.value;
    };
    if (v instanceof LT) {
        return GT.value;
    };
    throw new Error("Failed pattern match at Data.Ordering line 33, column 1 - line 33, column 31: " + [ v.constructor.name ]);
};
var eqOrdering = new Data_Eq.Eq(function (v) {
    return function (v1) {
        if (v instanceof LT && v1 instanceof LT) {
            return true;
        };
        if (v instanceof GT && v1 instanceof GT) {
            return true;
        };
        if (v instanceof EQ && v1 instanceof EQ) {
            return true;
        };
        return false;
    };
});
module.exports = {
    LT: LT,
    GT: GT,
    EQ: EQ,
    invert: invert,
    eqOrdering: eqOrdering,
    semigroupOrdering: semigroupOrdering,
    showOrdering: showOrdering
};

},{"../Data.Eq":86,"../Data.Semigroup":130,"../Data.Show":134}],124:[function(require,module,exports){
"use strict";

exports.copyRecord = function(rec) {
  var copy = {};
  for (var key in rec) {
    if ({}.hasOwnProperty.call(rec, key)) {
      copy[key] = rec[key];
    }
  }
  return copy;
};

exports.unsafeInsert = function(l) {
  return function(a) {
    return function(rec) {
      rec[l] = a;
      return rec;
    };
  };
};

exports.unsafeModify = function(l) {
  return function (f) {
    return function(rec) {
      rec[l] = f(rec[l]);
      return rec;
    };
  };
};

exports.unsafeDelete = function(l) {
  return function(rec) {
    delete rec[l];
    return rec;
  };
};

exports.unsafeRename = function(l1) {
  return function (l2) {
    return function (rec) {
      rec[l2] = rec[l1];
      delete rec[l1];
      return rec;
    };
  };
};

exports.unsafeMerge = function(r1) {
  return function(r2) {
    var copy = {};
    for (var k1 in r2) {
      if ({}.hasOwnProperty.call(r2, k1)) {
        copy[k1] = r2[k1];
      }
    }
    for (var k2 in r1) {
      if ({}.hasOwnProperty.call(r1, k2)) {
        copy[k2] = r1[k2];
      }
    }
    return copy;
  };
};

},{}],125:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var $foreign = require("./foreign");
var Control_Category = require("../Control.Category");
var Control_Semigroupoid = require("../Control.Semigroupoid");
var Data_Symbol = require("../Data.Symbol");
var Prelude = require("../Prelude");
var Type_Row = require("../Type.Row");
var Builder = function (x) {
    return x;
};
var semigroupoidBuilder = Control_Semigroupoid.semigroupoidFn;
var rename = function (dictIsSymbol) {
    return function (dictIsSymbol1) {
        return function (dictRowCons) {
            return function (dictRowLacks) {
                return function (dictRowCons1) {
                    return function (dictRowLacks1) {
                        return function (l1) {
                            return function (l2) {
                                return function (r1) {
                                    return $foreign.unsafeRename(Data_Symbol.reflectSymbol(dictIsSymbol)(l1))(Data_Symbol.reflectSymbol(dictIsSymbol1)(l2))(r1);
                                };
                            };
                        };
                    };
                };
            };
        };
    };
};
var modify = function (dictRowCons) {
    return function (dictRowCons1) {
        return function (dictIsSymbol) {
            return function (l) {
                return function (f) {
                    return function (r1) {
                        return $foreign.unsafeModify(Data_Symbol.reflectSymbol(dictIsSymbol)(l))(f)(r1);
                    };
                };
            };
        };
    };
};
var merge = function (dictUnion) {
    return function (r2) {
        return function (r1) {
            return $foreign.unsafeMerge(r1)(r2);
        };
    };
};
var insert = function (dictRowCons) {
    return function (dictRowLacks) {
        return function (dictIsSymbol) {
            return function (l) {
                return function (a) {
                    return function (r1) {
                        return $foreign.unsafeInsert(Data_Symbol.reflectSymbol(dictIsSymbol)(l))(a)(r1);
                    };
                };
            };
        };
    };
};
var $$delete = function (dictIsSymbol) {
    return function (dictRowLacks) {
        return function (dictRowCons) {
            return function (l) {
                return function (r2) {
                    return $foreign.unsafeDelete(Data_Symbol.reflectSymbol(dictIsSymbol)(l))(r2);
                };
            };
        };
    };
};
var categoryBuilder = Control_Category.categoryFn;
var build = function (v) {
    return function (r1) {
        return v($foreign.copyRecord(r1));
    };
};
module.exports = {
    build: build,
    insert: insert,
    modify: modify,
    "delete": $$delete,
    rename: rename,
    merge: merge,
    semigroupoidBuilder: semigroupoidBuilder,
    categoryBuilder: categoryBuilder
};

},{"../Control.Category":42,"../Control.Semigroupoid":61,"../Data.Symbol":135,"../Prelude":152,"../Type.Row":162,"./foreign":124}],126:[function(require,module,exports){
"use strict";

exports.intSub = function (x) {
  return function (y) {
    /* jshint bitwise: false */
    return x - y | 0;
  };
};

exports.numSub = function (n1) {
  return function (n2) {
    return n1 - n2;
  };
};

},{}],127:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var $foreign = require("./foreign");
var Data_Semiring = require("../Data.Semiring");
var Data_Unit = require("../Data.Unit");
var Ring = function (Semiring0, sub) {
    this.Semiring0 = Semiring0;
    this.sub = sub;
};
var sub = function (dict) {
    return dict.sub;
};
var ringUnit = new Ring(function () {
    return Data_Semiring.semiringUnit;
}, function (v) {
    return function (v1) {
        return Data_Unit.unit;
    };
});
var ringNumber = new Ring(function () {
    return Data_Semiring.semiringNumber;
}, $foreign.numSub);
var ringInt = new Ring(function () {
    return Data_Semiring.semiringInt;
}, $foreign.intSub);
var ringFn = function (dictRing) {
    return new Ring(function () {
        return Data_Semiring.semiringFn(dictRing.Semiring0());
    }, function (f) {
        return function (g) {
            return function (x) {
                return sub(dictRing)(f(x))(g(x));
            };
        };
    });
};
var negate = function (dictRing) {
    return function (a) {
        return sub(dictRing)(Data_Semiring.zero(dictRing.Semiring0()))(a);
    };
};
module.exports = {
    Ring: Ring,
    sub: sub,
    negate: negate,
    ringInt: ringInt,
    ringNumber: ringNumber,
    ringUnit: ringUnit,
    ringFn: ringFn
};

},{"../Data.Semiring":132,"../Data.Unit":145,"./foreign":126}],128:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Apply = require("../Control.Apply");
var Control_Category = require("../Control.Category");
var Control_Semigroupoid = require("../Control.Semigroupoid");
var Data_Foldable = require("../Data.Foldable");
var Data_Function = require("../Data.Function");
var Data_Functor = require("../Data.Functor");
var Data_Monoid_Dual = require("../Data.Monoid.Dual");
var Data_Monoid_Multiplicative = require("../Data.Monoid.Multiplicative");
var Data_Semigroup = require("../Data.Semigroup");
var Data_Unit = require("../Data.Unit");
var Prelude = require("../Prelude");
var Act = function (x) {
    return x;
};
var Foldable1 = function (Foldable0, fold1, foldMap1) {
    this.Foldable0 = Foldable0;
    this.fold1 = fold1;
    this.foldMap1 = foldMap1;
};
var semigroupAct = function (dictApply) {
    return new Data_Semigroup.Semigroup(function (v) {
        return function (v1) {
            return Control_Apply.applySecond(dictApply)(v)(v1);
        };
    });
};
var getAct = function (v) {
    return v;
};
var foldMap1 = function (dict) {
    return dict.foldMap1;
};
var traverse1_ = function (dictFoldable1) {
    return function (dictApply) {
        return function (f) {
            return function (t) {
                return Data_Functor.voidRight(dictApply.Functor0())(Data_Unit.unit)(getAct(foldMap1(dictFoldable1)(semigroupAct(dictApply))(function ($28) {
                    return Act(f($28));
                })(t)));
            };
        };
    };
};
var for1_ = function (dictFoldable1) {
    return function (dictApply) {
        return Data_Function.flip(traverse1_(dictFoldable1)(dictApply));
    };
};
var sequence1_ = function (dictFoldable1) {
    return function (dictApply) {
        return traverse1_(dictFoldable1)(dictApply)(Control_Category.id(Control_Category.categoryFn));
    };
};
var fold1Default = function (dictFoldable1) {
    return function (dictSemigroup) {
        return foldMap1(dictFoldable1)(dictSemigroup)(Control_Category.id(Control_Category.categoryFn));
    };
};
var foldableDual = new Foldable1(function () {
    return Data_Foldable.foldableDual;
}, function (dictSemigroup) {
    return fold1Default(foldableDual)(dictSemigroup);
}, function (dictSemigroup) {
    return function (f) {
        return function (v) {
            return f(v);
        };
    };
});
var foldableMultiplicative = new Foldable1(function () {
    return Data_Foldable.foldableMultiplicative;
}, function (dictSemigroup) {
    return fold1Default(foldableMultiplicative)(dictSemigroup);
}, function (dictSemigroup) {
    return function (f) {
        return function (v) {
            return f(v);
        };
    };
});
var fold1 = function (dict) {
    return dict.fold1;
};
var foldMap1Default = function (dictFoldable1) {
    return function (dictFunctor) {
        return function (dictSemigroup) {
            return function (f) {
                return function ($29) {
                    return fold1(dictFoldable1)(dictSemigroup)(Data_Functor.map(dictFunctor)(f)($29));
                };
            };
        };
    };
};
module.exports = {
    Foldable1: Foldable1,
    foldMap1: foldMap1,
    fold1: fold1,
    traverse1_: traverse1_,
    for1_: for1_,
    sequence1_: sequence1_,
    foldMap1Default: foldMap1Default,
    fold1Default: fold1Default,
    foldableDual: foldableDual,
    foldableMultiplicative: foldableMultiplicative
};

},{"../Control.Apply":37,"../Control.Category":42,"../Control.Semigroupoid":61,"../Data.Foldable":91,"../Data.Function":95,"../Data.Functor":98,"../Data.Monoid.Dual":112,"../Data.Monoid.Multiplicative":114,"../Data.Semigroup":130,"../Data.Unit":145,"../Prelude":152}],129:[function(require,module,exports){
"use strict";

exports.concatString = function (s1) {
  return function (s2) {
    return s1 + s2;
  };
};

exports.concatArray = function (xs) {
  return function (ys) {
    if (xs.length === 0) return ys;
    if (ys.length === 0) return xs;
    return xs.concat(ys);
  };
};

},{}],130:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var $foreign = require("./foreign");
var Data_Unit = require("../Data.Unit");
var Data_Void = require("../Data.Void");
var Semigroup = function (append) {
    this.append = append;
};
var semigroupVoid = new Semigroup(function (v) {
    return Data_Void.absurd;
});
var semigroupUnit = new Semigroup(function (v) {
    return function (v1) {
        return Data_Unit.unit;
    };
});
var semigroupString = new Semigroup($foreign.concatString);
var semigroupArray = new Semigroup($foreign.concatArray);
var append = function (dict) {
    return dict.append;
};
var semigroupFn = function (dictSemigroup) {
    return new Semigroup(function (f) {
        return function (g) {
            return function (x) {
                return append(dictSemigroup)(f(x))(g(x));
            };
        };
    });
};
module.exports = {
    Semigroup: Semigroup,
    append: append,
    semigroupString: semigroupString,
    semigroupUnit: semigroupUnit,
    semigroupVoid: semigroupVoid,
    semigroupFn: semigroupFn,
    semigroupArray: semigroupArray
};

},{"../Data.Unit":145,"../Data.Void":146,"./foreign":129}],131:[function(require,module,exports){
"use strict";

exports.intAdd = function (x) {
  return function (y) {
    /* jshint bitwise: false */
    return x + y | 0;
  };
};

exports.intMul = function (x) {
  return function (y) {
    /* jshint bitwise: false */
    return x * y | 0;
  };
};

exports.numAdd = function (n1) {
  return function (n2) {
    return n1 + n2;
  };
};

exports.numMul = function (n1) {
  return function (n2) {
    return n1 * n2;
  };
};

},{}],132:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var $foreign = require("./foreign");
var Data_Unit = require("../Data.Unit");
var Semiring = function (add, mul, one, zero) {
    this.add = add;
    this.mul = mul;
    this.one = one;
    this.zero = zero;
};
var zero = function (dict) {
    return dict.zero;
};
var semiringUnit = new Semiring(function (v) {
    return function (v1) {
        return Data_Unit.unit;
    };
}, function (v) {
    return function (v1) {
        return Data_Unit.unit;
    };
}, Data_Unit.unit, Data_Unit.unit);
var semiringNumber = new Semiring($foreign.numAdd, $foreign.numMul, 1.0, 0.0);
var semiringInt = new Semiring($foreign.intAdd, $foreign.intMul, 1, 0);
var one = function (dict) {
    return dict.one;
};
var mul = function (dict) {
    return dict.mul;
};
var add = function (dict) {
    return dict.add;
};
var semiringFn = function (dictSemiring) {
    return new Semiring(function (f) {
        return function (g) {
            return function (x) {
                return add(dictSemiring)(f(x))(g(x));
            };
        };
    }, function (f) {
        return function (g) {
            return function (x) {
                return mul(dictSemiring)(f(x))(g(x));
            };
        };
    }, function (v) {
        return one(dictSemiring);
    }, function (v) {
        return zero(dictSemiring);
    });
};
module.exports = {
    Semiring: Semiring,
    add: add,
    zero: zero,
    mul: mul,
    one: one,
    semiringInt: semiringInt,
    semiringNumber: semiringNumber,
    semiringFn: semiringFn,
    semiringUnit: semiringUnit
};

},{"../Data.Unit":145,"./foreign":131}],133:[function(require,module,exports){
"use strict";

exports.showIntImpl = function (n) {
  return n.toString();
};

exports.showNumberImpl = function (n) {
  var str = n.toString();
  return isNaN(str + ".0") ? str : str + ".0";
};

exports.showCharImpl = function (c) {
  var code = c.charCodeAt(0);
  if (code < 0x20 || code === 0x7F) {
    switch (c) {
      case "\x07": return "'\\a'";
      case "\b": return "'\\b'";
      case "\f": return "'\\f'";
      case "\n": return "'\\n'";
      case "\r": return "'\\r'";
      case "\t": return "'\\t'";
      case "\v": return "'\\v'";
    }
    return "'\\" + code.toString(10) + "'";
  }
  return c === "'" || c === "\\" ? "'\\" + c + "'" : "'" + c + "'";
};

exports.showStringImpl = function (s) {
  var l = s.length;
  return "\"" + s.replace(
    /[\0-\x1F\x7F"\\]/g, // eslint-disable-line no-control-regex
    function (c, i) {
      switch (c) {
        case "\"":
        case "\\":
          return "\\" + c;
        case "\x07": return "\\a";
        case "\b": return "\\b";
        case "\f": return "\\f";
        case "\n": return "\\n";
        case "\r": return "\\r";
        case "\t": return "\\t";
        case "\v": return "\\v";
      }
      var k = i + 1;
      var empty = k < l && s[k] >= "0" && s[k] <= "9" ? "\\&" : "";
      return "\\" + c.charCodeAt(0).toString(10) + empty;
    }
  ) + "\"";
};

exports.showArrayImpl = function (f) {
  return function (xs) {
    var ss = [];
    for (var i = 0, l = xs.length; i < l; i++) {
      ss[i] = f(xs[i]);
    }
    return "[" + ss.join(",") + "]";
  };
};

},{}],134:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var $foreign = require("./foreign");
var Show = function (show) {
    this.show = show;
};
var showString = new Show($foreign.showStringImpl);
var showNumber = new Show($foreign.showNumberImpl);
var showInt = new Show($foreign.showIntImpl);
var showChar = new Show($foreign.showCharImpl);
var showBoolean = new Show(function (v) {
    if (v) {
        return "true";
    };
    if (!v) {
        return "false";
    };
    throw new Error("Failed pattern match at Data.Show line 12, column 1 - line 12, column 37: " + [ v.constructor.name ]);
});
var show = function (dict) {
    return dict.show;
};
var showArray = function (dictShow) {
    return new Show($foreign.showArrayImpl(show(dictShow)));
};
module.exports = {
    Show: Show,
    show: show,
    showBoolean: showBoolean,
    showInt: showInt,
    showNumber: showNumber,
    showChar: showChar,
    showString: showString,
    showArray: showArray
};

},{"./foreign":133}],135:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Data_Semigroup = require("../Data.Semigroup");
var Prelude = require("../Prelude");
var Unsafe_Coerce = require("../Unsafe.Coerce");
var SProxy = (function () {
    function SProxy() {

    };
    SProxy.value = new SProxy();
    return SProxy;
})();
var IsSymbol = function (reflectSymbol) {
    this.reflectSymbol = reflectSymbol;
};
var reifySymbol = function (s) {
    return function (f) {
        return (function (dictIsSymbol) {
            return f(dictIsSymbol);
        })({
            reflectSymbol: function (v) {
                return s;
            }
        })(SProxy.value);
    };
};
var reflectSymbol = function (dict) {
    return dict.reflectSymbol;
};
var isSymbolTypeConcat = function (dictIsSymbol) {
    return function (dictIsSymbol1) {
        return new IsSymbol(function (v) {
            return reflectSymbol(dictIsSymbol)(SProxy.value) + reflectSymbol(dictIsSymbol1)(SProxy.value);
        });
    };
};
module.exports = {
    IsSymbol: IsSymbol,
    reflectSymbol: reflectSymbol,
    reifySymbol: reifySymbol,
    SProxy: SProxy,
    isSymbolTypeConcat: isSymbolTypeConcat
};

},{"../Data.Semigroup":130,"../Prelude":152,"../Unsafe.Coerce":164}],136:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Applicative = require("../Control.Applicative");
var Control_Apply = require("../Control.Apply");
var Data_Functor = require("../Data.Functor");
var Data_Traversable_Accum = require("../Data.Traversable.Accum");
var Prelude = require("../Prelude");
var StateR = function (x) {
    return x;
};
var StateL = function (x) {
    return x;
};
var stateR = function (v) {
    return v;
};
var stateL = function (v) {
    return v;
};
var functorStateR = new Data_Functor.Functor(function (f) {
    return function (k) {
        return function (s) {
            var v = stateR(k)(s);
            return {
                accum: v.accum,
                value: f(v.value)
            };
        };
    };
});
var functorStateL = new Data_Functor.Functor(function (f) {
    return function (k) {
        return function (s) {
            var v = stateL(k)(s);
            return {
                accum: v.accum,
                value: f(v.value)
            };
        };
    };
});
var applyStateR = new Control_Apply.Apply(function () {
    return functorStateR;
}, function (f) {
    return function (x) {
        return function (s) {
            var v = stateR(x)(s);
            var v1 = stateR(f)(v.accum);
            return {
                accum: v1.accum,
                value: v1.value(v.value)
            };
        };
    };
});
var applyStateL = new Control_Apply.Apply(function () {
    return functorStateL;
}, function (f) {
    return function (x) {
        return function (s) {
            var v = stateL(f)(s);
            var v1 = stateL(x)(v.accum);
            return {
                accum: v1.accum,
                value: v.value(v1.value)
            };
        };
    };
});
var applicativeStateR = new Control_Applicative.Applicative(function () {
    return applyStateR;
}, function (a) {
    return function (s) {
        return {
            accum: s,
            value: a
        };
    };
});
var applicativeStateL = new Control_Applicative.Applicative(function () {
    return applyStateL;
}, function (a) {
    return function (s) {
        return {
            accum: s,
            value: a
        };
    };
});
module.exports = {
    StateL: StateL,
    stateL: stateL,
    StateR: StateR,
    stateR: stateR,
    functorStateL: functorStateL,
    applyStateL: applyStateL,
    applicativeStateL: applicativeStateL,
    functorStateR: functorStateR,
    applyStateR: applyStateR,
    applicativeStateR: applicativeStateR
};

},{"../Control.Applicative":35,"../Control.Apply":37,"../Data.Functor":98,"../Data.Traversable.Accum":137,"../Prelude":152}],137:[function(require,module,exports){
arguments[4][116][0].apply(exports,arguments)
},{"dup":116}],138:[function(require,module,exports){
"use strict";

// jshint maxparams: 3

exports.traverseArrayImpl = function () {
  function Cont(fn) {
    this.fn = fn;
  }

  var emptyList = {};

  var ConsCell = function (head, tail) {
    this.head = head;
    this.tail = tail;
  };

  function consList(x) {
    return function (xs) {
      return new ConsCell(x, xs);
    };
  }

  function listToArray(list) {
    var arr = [];
    var xs = list;
    while (xs !== emptyList) {
      arr.push(xs.head);
      xs = xs.tail;
    }
    return arr;
  }

  return function (apply) {
    return function (map) {
      return function (pure) {
        return function (f) {
          var buildFrom = function (x, ys) {
            return apply(map(consList)(f(x)))(ys);
          };

          var go = function (acc, currentLen, xs) {
            if (currentLen === 0) {
              return acc;
            } else {
              var last = xs[currentLen - 1];
              return new Cont(function () {
                return go(buildFrom(last, acc), currentLen - 1, xs);
              });
            }
          };

          return function (array) {
            var result = go(pure(emptyList), array.length, array);
            while (result instanceof Cont) {
              result = result.fn();
            }

            return map(listToArray)(result);
          };
        };
      };
    };
  };
}();

},{}],139:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var $foreign = require("./foreign");
var Control_Applicative = require("../Control.Applicative");
var Control_Apply = require("../Control.Apply");
var Control_Category = require("../Control.Category");
var Data_Foldable = require("../Data.Foldable");
var Data_Functor = require("../Data.Functor");
var Data_Maybe = require("../Data.Maybe");
var Data_Maybe_First = require("../Data.Maybe.First");
var Data_Maybe_Last = require("../Data.Maybe.Last");
var Data_Monoid_Additive = require("../Data.Monoid.Additive");
var Data_Monoid_Conj = require("../Data.Monoid.Conj");
var Data_Monoid_Disj = require("../Data.Monoid.Disj");
var Data_Monoid_Dual = require("../Data.Monoid.Dual");
var Data_Monoid_Multiplicative = require("../Data.Monoid.Multiplicative");
var Data_Traversable_Accum = require("../Data.Traversable.Accum");
var Data_Traversable_Accum_Internal = require("../Data.Traversable.Accum.Internal");
var Prelude = require("../Prelude");
var Traversable = function (Foldable1, Functor0, sequence, traverse) {
    this.Foldable1 = Foldable1;
    this.Functor0 = Functor0;
    this.sequence = sequence;
    this.traverse = traverse;
};
var traverse = function (dict) {
    return dict.traverse;
};
var traversableMultiplicative = new Traversable(function () {
    return Data_Foldable.foldableMultiplicative;
}, function () {
    return Data_Monoid_Multiplicative.functorMultiplicative;
}, function (dictApplicative) {
    return function (v) {
        return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Monoid_Multiplicative.Multiplicative)(v);
    };
}, function (dictApplicative) {
    return function (f) {
        return function (v) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Monoid_Multiplicative.Multiplicative)(f(v));
        };
    };
});
var traversableMaybe = new Traversable(function () {
    return Data_Foldable.foldableMaybe;
}, function () {
    return Data_Maybe.functorMaybe;
}, function (dictApplicative) {
    return function (v) {
        if (v instanceof Data_Maybe.Nothing) {
            return Control_Applicative.pure(dictApplicative)(Data_Maybe.Nothing.value);
        };
        if (v instanceof Data_Maybe.Just) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Maybe.Just.create)(v.value0);
        };
        throw new Error("Failed pattern match at Data.Traversable line 86, column 1 - line 86, column 47: " + [ v.constructor.name ]);
    };
}, function (dictApplicative) {
    return function (v) {
        return function (v1) {
            if (v1 instanceof Data_Maybe.Nothing) {
                return Control_Applicative.pure(dictApplicative)(Data_Maybe.Nothing.value);
            };
            if (v1 instanceof Data_Maybe.Just) {
                return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Maybe.Just.create)(v(v1.value0));
            };
            throw new Error("Failed pattern match at Data.Traversable line 86, column 1 - line 86, column 47: " + [ v.constructor.name, v1.constructor.name ]);
        };
    };
});
var traversableDual = new Traversable(function () {
    return Data_Foldable.foldableDual;
}, function () {
    return Data_Monoid_Dual.functorDual;
}, function (dictApplicative) {
    return function (v) {
        return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Monoid_Dual.Dual)(v);
    };
}, function (dictApplicative) {
    return function (f) {
        return function (v) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Monoid_Dual.Dual)(f(v));
        };
    };
});
var traversableDisj = new Traversable(function () {
    return Data_Foldable.foldableDisj;
}, function () {
    return Data_Monoid_Disj.functorDisj;
}, function (dictApplicative) {
    return function (v) {
        return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Monoid_Disj.Disj)(v);
    };
}, function (dictApplicative) {
    return function (f) {
        return function (v) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Monoid_Disj.Disj)(f(v));
        };
    };
});
var traversableConj = new Traversable(function () {
    return Data_Foldable.foldableConj;
}, function () {
    return Data_Monoid_Conj.functorConj;
}, function (dictApplicative) {
    return function (v) {
        return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Monoid_Conj.Conj)(v);
    };
}, function (dictApplicative) {
    return function (f) {
        return function (v) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Monoid_Conj.Conj)(f(v));
        };
    };
});
var traversableAdditive = new Traversable(function () {
    return Data_Foldable.foldableAdditive;
}, function () {
    return Data_Monoid_Additive.functorAdditive;
}, function (dictApplicative) {
    return function (v) {
        return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Monoid_Additive.Additive)(v);
    };
}, function (dictApplicative) {
    return function (f) {
        return function (v) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Monoid_Additive.Additive)(f(v));
        };
    };
});
var sequenceDefault = function (dictTraversable) {
    return function (dictApplicative) {
        return traverse(dictTraversable)(dictApplicative)(Control_Category.id(Control_Category.categoryFn));
    };
};
var traversableArray = new Traversable(function () {
    return Data_Foldable.foldableArray;
}, function () {
    return Data_Functor.functorArray;
}, function (dictApplicative) {
    return sequenceDefault(traversableArray)(dictApplicative);
}, function (dictApplicative) {
    return $foreign.traverseArrayImpl(Control_Apply.apply(dictApplicative.Apply0()))(Data_Functor.map((dictApplicative.Apply0()).Functor0()))(Control_Applicative.pure(dictApplicative));
});
var sequence = function (dict) {
    return dict.sequence;
};
var traversableFirst = new Traversable(function () {
    return Data_Foldable.foldableFirst;
}, function () {
    return Data_Maybe_First.functorFirst;
}, function (dictApplicative) {
    return function (v) {
        return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Maybe_First.First)(sequence(traversableMaybe)(dictApplicative)(v));
    };
}, function (dictApplicative) {
    return function (f) {
        return function (v) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Maybe_First.First)(traverse(traversableMaybe)(dictApplicative)(f)(v));
        };
    };
});
var traversableLast = new Traversable(function () {
    return Data_Foldable.foldableLast;
}, function () {
    return Data_Maybe_Last.functorLast;
}, function (dictApplicative) {
    return function (v) {
        return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Maybe_Last.Last)(sequence(traversableMaybe)(dictApplicative)(v));
    };
}, function (dictApplicative) {
    return function (f) {
        return function (v) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Data_Maybe_Last.Last)(traverse(traversableMaybe)(dictApplicative)(f)(v));
        };
    };
});
var traverseDefault = function (dictTraversable) {
    return function (dictApplicative) {
        return function (f) {
            return function (ta) {
                return sequence(dictTraversable)(dictApplicative)(Data_Functor.map(dictTraversable.Functor0())(f)(ta));
            };
        };
    };
};
var mapAccumR = function (dictTraversable) {
    return function (f) {
        return function (s0) {
            return function (xs) {
                return Data_Traversable_Accum_Internal.stateR(traverse(dictTraversable)(Data_Traversable_Accum_Internal.applicativeStateR)(function (a) {
                    return function (s) {
                        return f(s)(a);
                    };
                })(xs))(s0);
            };
        };
    };
};
var scanr = function (dictTraversable) {
    return function (f) {
        return function (b0) {
            return function (xs) {
                return (mapAccumR(dictTraversable)(function (b) {
                    return function (a) {
                        var b$prime = f(a)(b);
                        return {
                            accum: b$prime,
                            value: b$prime
                        };
                    };
                })(b0)(xs)).value;
            };
        };
    };
};
var mapAccumL = function (dictTraversable) {
    return function (f) {
        return function (s0) {
            return function (xs) {
                return Data_Traversable_Accum_Internal.stateL(traverse(dictTraversable)(Data_Traversable_Accum_Internal.applicativeStateL)(function (a) {
                    return function (s) {
                        return f(s)(a);
                    };
                })(xs))(s0);
            };
        };
    };
};
var scanl = function (dictTraversable) {
    return function (f) {
        return function (b0) {
            return function (xs) {
                return (mapAccumL(dictTraversable)(function (b) {
                    return function (a) {
                        var b$prime = f(b)(a);
                        return {
                            accum: b$prime,
                            value: b$prime
                        };
                    };
                })(b0)(xs)).value;
            };
        };
    };
};
var $$for = function (dictApplicative) {
    return function (dictTraversable) {
        return function (x) {
            return function (f) {
                return traverse(dictTraversable)(dictApplicative)(f)(x);
            };
        };
    };
};
module.exports = {
    Traversable: Traversable,
    traverse: traverse,
    sequence: sequence,
    traverseDefault: traverseDefault,
    sequenceDefault: sequenceDefault,
    "for": $$for,
    scanl: scanl,
    scanr: scanr,
    mapAccumL: mapAccumL,
    mapAccumR: mapAccumR,
    traversableArray: traversableArray,
    traversableMaybe: traversableMaybe,
    traversableFirst: traversableFirst,
    traversableLast: traversableLast,
    traversableAdditive: traversableAdditive,
    traversableDual: traversableDual,
    traversableConj: traversableConj,
    traversableDisj: traversableDisj,
    traversableMultiplicative: traversableMultiplicative
};

},{"../Control.Applicative":35,"../Control.Apply":37,"../Control.Category":42,"../Data.Foldable":91,"../Data.Functor":98,"../Data.Maybe":108,"../Data.Maybe.First":106,"../Data.Maybe.Last":107,"../Data.Monoid.Additive":109,"../Data.Monoid.Conj":110,"../Data.Monoid.Disj":111,"../Data.Monoid.Dual":112,"../Data.Monoid.Multiplicative":114,"../Data.Traversable.Accum":137,"../Data.Traversable.Accum.Internal":136,"../Prelude":152,"./foreign":138}],140:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Semigroupoid = require("../Control.Semigroupoid");
var Data_FoldableWithIndex = require("../Data.FoldableWithIndex");
var Data_Function = require("../Data.Function");
var Data_FunctorWithIndex = require("../Data.FunctorWithIndex");
var Data_Maybe = require("../Data.Maybe");
var Data_Maybe_First = require("../Data.Maybe.First");
var Data_Maybe_Last = require("../Data.Maybe.Last");
var Data_Monoid_Additive = require("../Data.Monoid.Additive");
var Data_Monoid_Conj = require("../Data.Monoid.Conj");
var Data_Monoid_Disj = require("../Data.Monoid.Disj");
var Data_Monoid_Dual = require("../Data.Monoid.Dual");
var Data_Monoid_Multiplicative = require("../Data.Monoid.Multiplicative");
var Data_Traversable = require("../Data.Traversable");
var Data_Traversable_Accum = require("../Data.Traversable.Accum");
var Data_Traversable_Accum_Internal = require("../Data.Traversable.Accum.Internal");
var Data_Unit = require("../Data.Unit");
var Prelude = require("../Prelude");
var TraversableWithIndex = function (FoldableWithIndex1, FunctorWithIndex0, Traversable2, traverseWithIndex) {
    this.FoldableWithIndex1 = FoldableWithIndex1;
    this.FunctorWithIndex0 = FunctorWithIndex0;
    this.Traversable2 = Traversable2;
    this.traverseWithIndex = traverseWithIndex;
};
var traverseWithIndexDefault = function (dictTraversableWithIndex) {
    return function (dictApplicative) {
        return function (f) {
            return function ($17) {
                return Data_Traversable.sequence(dictTraversableWithIndex.Traversable2())(dictApplicative)(Data_FunctorWithIndex.mapWithIndex(dictTraversableWithIndex.FunctorWithIndex0())(f)($17));
            };
        };
    };
};
var traverseWithIndex = function (dict) {
    return dict.traverseWithIndex;
};
var traversableWithIndexMultiplicative = new TraversableWithIndex(function () {
    return Data_FoldableWithIndex.foldableWithIndexMultiplicative;
}, function () {
    return Data_FunctorWithIndex.functorWithIndexMultiplicative;
}, function () {
    return Data_Traversable.traversableMultiplicative;
}, function (dictApplicative) {
    return function (f) {
        return Data_Traversable.traverse(Data_Traversable.traversableMultiplicative)(dictApplicative)(f(Data_Unit.unit));
    };
});
var traversableWithIndexMaybe = new TraversableWithIndex(function () {
    return Data_FoldableWithIndex.foldableWithIndexMaybe;
}, function () {
    return Data_FunctorWithIndex.functorWithIndexMaybe;
}, function () {
    return Data_Traversable.traversableMaybe;
}, function (dictApplicative) {
    return function (f) {
        return Data_Traversable.traverse(Data_Traversable.traversableMaybe)(dictApplicative)(f(Data_Unit.unit));
    };
});
var traversableWithIndexLast = new TraversableWithIndex(function () {
    return Data_FoldableWithIndex.foldableWithIndexLast;
}, function () {
    return Data_FunctorWithIndex.functorWithIndexLast;
}, function () {
    return Data_Traversable.traversableLast;
}, function (dictApplicative) {
    return function (f) {
        return Data_Traversable.traverse(Data_Traversable.traversableLast)(dictApplicative)(f(Data_Unit.unit));
    };
});
var traversableWithIndexFirst = new TraversableWithIndex(function () {
    return Data_FoldableWithIndex.foldableWithIndexFirst;
}, function () {
    return Data_FunctorWithIndex.functorWithIndexFirst;
}, function () {
    return Data_Traversable.traversableFirst;
}, function (dictApplicative) {
    return function (f) {
        return Data_Traversable.traverse(Data_Traversable.traversableFirst)(dictApplicative)(f(Data_Unit.unit));
    };
});
var traversableWithIndexDual = new TraversableWithIndex(function () {
    return Data_FoldableWithIndex.foldableWithIndexDual;
}, function () {
    return Data_FunctorWithIndex.functorWithIndexDual;
}, function () {
    return Data_Traversable.traversableDual;
}, function (dictApplicative) {
    return function (f) {
        return Data_Traversable.traverse(Data_Traversable.traversableDual)(dictApplicative)(f(Data_Unit.unit));
    };
});
var traversableWithIndexDisj = new TraversableWithIndex(function () {
    return Data_FoldableWithIndex.foldableWithIndexDisj;
}, function () {
    return Data_FunctorWithIndex.functorWithIndexDisj;
}, function () {
    return Data_Traversable.traversableDisj;
}, function (dictApplicative) {
    return function (f) {
        return Data_Traversable.traverse(Data_Traversable.traversableDisj)(dictApplicative)(f(Data_Unit.unit));
    };
});
var traversableWithIndexConj = new TraversableWithIndex(function () {
    return Data_FoldableWithIndex.foldableWithIndexConj;
}, function () {
    return Data_FunctorWithIndex.functorWithIndexConj;
}, function () {
    return Data_Traversable.traversableConj;
}, function (dictApplicative) {
    return function (f) {
        return Data_Traversable.traverse(Data_Traversable.traversableConj)(dictApplicative)(f(Data_Unit.unit));
    };
});
var traversableWithIndexArray = new TraversableWithIndex(function () {
    return Data_FoldableWithIndex.foldableWithIndexArray;
}, function () {
    return Data_FunctorWithIndex.functorWithIndexArray;
}, function () {
    return Data_Traversable.traversableArray;
}, function (dictApplicative) {
    return traverseWithIndexDefault(traversableWithIndexArray)(dictApplicative);
});
var traversableWithIndexAdditive = new TraversableWithIndex(function () {
    return Data_FoldableWithIndex.foldableWithIndexAdditive;
}, function () {
    return Data_FunctorWithIndex.functorWithIndexAdditive;
}, function () {
    return Data_Traversable.traversableAdditive;
}, function (dictApplicative) {
    return function (f) {
        return Data_Traversable.traverse(Data_Traversable.traversableAdditive)(dictApplicative)(f(Data_Unit.unit));
    };
});
var mapAccumRWithIndex = function (dictTraversableWithIndex) {
    return function (f) {
        return function (s0) {
            return function (xs) {
                return Data_Traversable_Accum_Internal.stateR(traverseWithIndex(dictTraversableWithIndex)(Data_Traversable_Accum_Internal.applicativeStateR)(function (i) {
                    return function (a) {
                        return function (s) {
                            return f(i)(s)(a);
                        };
                    };
                })(xs))(s0);
            };
        };
    };
};
var scanrWithIndex = function (dictTraversableWithIndex) {
    return function (f) {
        return function (b0) {
            return function (xs) {
                return (mapAccumRWithIndex(dictTraversableWithIndex)(function (i) {
                    return function (b) {
                        return function (a) {
                            var b$prime = f(i)(a)(b);
                            return {
                                accum: b$prime,
                                value: b$prime
                            };
                        };
                    };
                })(b0)(xs)).value;
            };
        };
    };
};
var mapAccumLWithIndex = function (dictTraversableWithIndex) {
    return function (f) {
        return function (s0) {
            return function (xs) {
                return Data_Traversable_Accum_Internal.stateL(traverseWithIndex(dictTraversableWithIndex)(Data_Traversable_Accum_Internal.applicativeStateL)(function (i) {
                    return function (a) {
                        return function (s) {
                            return f(i)(s)(a);
                        };
                    };
                })(xs))(s0);
            };
        };
    };
};
var scanlWithIndex = function (dictTraversableWithIndex) {
    return function (f) {
        return function (b0) {
            return function (xs) {
                return (mapAccumLWithIndex(dictTraversableWithIndex)(function (i) {
                    return function (b) {
                        return function (a) {
                            var b$prime = f(i)(b)(a);
                            return {
                                accum: b$prime,
                                value: b$prime
                            };
                        };
                    };
                })(b0)(xs)).value;
            };
        };
    };
};
var forWithIndex = function (dictApplicative) {
    return function (dictTraversableWithIndex) {
        return Data_Function.flip(traverseWithIndex(dictTraversableWithIndex)(dictApplicative));
    };
};
module.exports = {
    TraversableWithIndex: TraversableWithIndex,
    traverseWithIndex: traverseWithIndex,
    traverseWithIndexDefault: traverseWithIndexDefault,
    forWithIndex: forWithIndex,
    scanlWithIndex: scanlWithIndex,
    mapAccumLWithIndex: mapAccumLWithIndex,
    scanrWithIndex: scanrWithIndex,
    mapAccumRWithIndex: mapAccumRWithIndex,
    traversableWithIndexArray: traversableWithIndexArray,
    traversableWithIndexMaybe: traversableWithIndexMaybe,
    traversableWithIndexFirst: traversableWithIndexFirst,
    traversableWithIndexLast: traversableWithIndexLast,
    traversableWithIndexAdditive: traversableWithIndexAdditive,
    traversableWithIndexDual: traversableWithIndexDual,
    traversableWithIndexConj: traversableWithIndexConj,
    traversableWithIndexDisj: traversableWithIndexDisj,
    traversableWithIndexMultiplicative: traversableWithIndexMultiplicative
};

},{"../Control.Semigroupoid":61,"../Data.FoldableWithIndex":92,"../Data.Function":95,"../Data.FunctorWithIndex":100,"../Data.Maybe":108,"../Data.Maybe.First":106,"../Data.Maybe.Last":107,"../Data.Monoid.Additive":109,"../Data.Monoid.Conj":110,"../Data.Monoid.Disj":111,"../Data.Monoid.Dual":112,"../Data.Monoid.Multiplicative":114,"../Data.Traversable":139,"../Data.Traversable.Accum":137,"../Data.Traversable.Accum.Internal":136,"../Data.Unit":145,"../Prelude":152}],141:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Applicative = require("../Control.Applicative");
var Control_Apply = require("../Control.Apply");
var Control_Biapplicative = require("../Control.Biapplicative");
var Control_Biapply = require("../Control.Biapply");
var Control_Bind = require("../Control.Bind");
var Control_Comonad = require("../Control.Comonad");
var Control_Extend = require("../Control.Extend");
var Control_Lazy = require("../Control.Lazy");
var Control_Monad = require("../Control.Monad");
var Control_Semigroupoid = require("../Control.Semigroupoid");
var Data_Bifoldable = require("../Data.Bifoldable");
var Data_Bifunctor = require("../Data.Bifunctor");
var Data_Bitraversable = require("../Data.Bitraversable");
var Data_BooleanAlgebra = require("../Data.BooleanAlgebra");
var Data_Bounded = require("../Data.Bounded");
var Data_CommutativeRing = require("../Data.CommutativeRing");
var Data_Distributive = require("../Data.Distributive");
var Data_Eq = require("../Data.Eq");
var Data_Foldable = require("../Data.Foldable");
var Data_Function = require("../Data.Function");
var Data_Functor = require("../Data.Functor");
var Data_Functor_Invariant = require("../Data.Functor.Invariant");
var Data_HeytingAlgebra = require("../Data.HeytingAlgebra");
var Data_Maybe = require("../Data.Maybe");
var Data_Maybe_First = require("../Data.Maybe.First");
var Data_Monoid = require("../Data.Monoid");
var Data_Newtype = require("../Data.Newtype");
var Data_Ord = require("../Data.Ord");
var Data_Ordering = require("../Data.Ordering");
var Data_Ring = require("../Data.Ring");
var Data_Semigroup = require("../Data.Semigroup");
var Data_Semiring = require("../Data.Semiring");
var Data_Show = require("../Data.Show");
var Data_Traversable = require("../Data.Traversable");
var Data_Unit = require("../Data.Unit");
var Prelude = require("../Prelude");
var Type_Equality = require("../Type.Equality");
var Tuple = (function () {
    function Tuple(value0, value1) {
        this.value0 = value0;
        this.value1 = value1;
    };
    Tuple.create = function (value0) {
        return function (value1) {
            return new Tuple(value0, value1);
        };
    };
    return Tuple;
})();
var uncurry = function (f) {
    return function (v) {
        return f(v.value0)(v.value1);
    };
};
var swap = function (v) {
    return new Tuple(v.value1, v.value0);
};
var snd = function (v) {
    return v.value1;
};
var showTuple = function (dictShow) {
    return function (dictShow1) {
        return new Data_Show.Show(function (v) {
            return "(Tuple " + (Data_Show.show(dictShow)(v.value0) + (" " + (Data_Show.show(dictShow1)(v.value1) + ")")));
        });
    };
};
var semiringTuple = function (dictSemiring) {
    return function (dictSemiring1) {
        return new Data_Semiring.Semiring(function (v) {
            return function (v1) {
                return new Tuple(Data_Semiring.add(dictSemiring)(v.value0)(v1.value0), Data_Semiring.add(dictSemiring1)(v.value1)(v1.value1));
            };
        }, function (v) {
            return function (v1) {
                return new Tuple(Data_Semiring.mul(dictSemiring)(v.value0)(v1.value0), Data_Semiring.mul(dictSemiring1)(v.value1)(v1.value1));
            };
        }, new Tuple(Data_Semiring.one(dictSemiring), Data_Semiring.one(dictSemiring1)), new Tuple(Data_Semiring.zero(dictSemiring), Data_Semiring.zero(dictSemiring1)));
    };
};
var semigroupoidTuple = new Control_Semigroupoid.Semigroupoid(function (v) {
    return function (v1) {
        return new Tuple(v1.value0, v.value1);
    };
});
var semigroupTuple = function (dictSemigroup) {
    return function (dictSemigroup1) {
        return new Data_Semigroup.Semigroup(function (v) {
            return function (v1) {
                return new Tuple(Data_Semigroup.append(dictSemigroup)(v.value0)(v1.value0), Data_Semigroup.append(dictSemigroup1)(v.value1)(v1.value1));
            };
        });
    };
};
var ringTuple = function (dictRing) {
    return function (dictRing1) {
        return new Data_Ring.Ring(function () {
            return semiringTuple(dictRing.Semiring0())(dictRing1.Semiring0());
        }, function (v) {
            return function (v1) {
                return new Tuple(Data_Ring.sub(dictRing)(v.value0)(v1.value0), Data_Ring.sub(dictRing1)(v.value1)(v1.value1));
            };
        });
    };
};
var monoidTuple = function (dictMonoid) {
    return function (dictMonoid1) {
        return new Data_Monoid.Monoid(function () {
            return semigroupTuple(dictMonoid.Semigroup0())(dictMonoid1.Semigroup0());
        }, new Tuple(Data_Monoid.mempty(dictMonoid), Data_Monoid.mempty(dictMonoid1)));
    };
};
var lookup = function (dictFoldable) {
    return function (dictEq) {
        return function (a) {
            return function ($264) {
                return Data_Newtype.unwrap(Data_Maybe_First.newtypeFirst)(Data_Foldable.foldMap(dictFoldable)(Data_Maybe_First.monoidFirst)(function (v) {
                    var $146 = Data_Eq.eq(dictEq)(a)(v.value0);
                    if ($146) {
                        return new Data_Maybe.Just(v.value1);
                    };
                    return Data_Maybe.Nothing.value;
                })($264));
            };
        };
    };
};
var heytingAlgebraTuple = function (dictHeytingAlgebra) {
    return function (dictHeytingAlgebra1) {
        return new Data_HeytingAlgebra.HeytingAlgebra(function (v) {
            return function (v1) {
                return new Tuple(Data_HeytingAlgebra.conj(dictHeytingAlgebra)(v.value0)(v1.value0), Data_HeytingAlgebra.conj(dictHeytingAlgebra1)(v.value1)(v1.value1));
            };
        }, function (v) {
            return function (v1) {
                return new Tuple(Data_HeytingAlgebra.disj(dictHeytingAlgebra)(v.value0)(v1.value0), Data_HeytingAlgebra.disj(dictHeytingAlgebra1)(v.value1)(v1.value1));
            };
        }, new Tuple(Data_HeytingAlgebra.ff(dictHeytingAlgebra), Data_HeytingAlgebra.ff(dictHeytingAlgebra1)), function (v) {
            return function (v1) {
                return new Tuple(Data_HeytingAlgebra.implies(dictHeytingAlgebra)(v.value0)(v1.value0), Data_HeytingAlgebra.implies(dictHeytingAlgebra1)(v.value1)(v1.value1));
            };
        }, function (v) {
            return new Tuple(Data_HeytingAlgebra.not(dictHeytingAlgebra)(v.value0), Data_HeytingAlgebra.not(dictHeytingAlgebra1)(v.value1));
        }, new Tuple(Data_HeytingAlgebra.tt(dictHeytingAlgebra), Data_HeytingAlgebra.tt(dictHeytingAlgebra1)));
    };
};
var functorTuple = new Data_Functor.Functor(function (f) {
    return function (v) {
        return new Tuple(v.value0, f(v.value1));
    };
});
var invariantTuple = new Data_Functor_Invariant.Invariant(Data_Functor_Invariant.imapF(functorTuple));
var fst = function (v) {
    return v.value0;
};
var lazyTuple = function (dictLazy) {
    return function (dictLazy1) {
        return new Control_Lazy.Lazy(function (f) {
            return new Tuple(Control_Lazy.defer(dictLazy)(function (v) {
                return fst(f(Data_Unit.unit));
            }), Control_Lazy.defer(dictLazy1)(function (v) {
                return snd(f(Data_Unit.unit));
            }));
        });
    };
};
var foldableTuple = new Data_Foldable.Foldable(function (dictMonoid) {
    return function (f) {
        return function (v) {
            return f(v.value1);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return f(z)(v.value1);
        };
    };
}, function (f) {
    return function (z) {
        return function (v) {
            return f(v.value1)(z);
        };
    };
});
var traversableTuple = new Data_Traversable.Traversable(function () {
    return foldableTuple;
}, function () {
    return functorTuple;
}, function (dictApplicative) {
    return function (v) {
        return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Tuple.create(v.value0))(v.value1);
    };
}, function (dictApplicative) {
    return function (f) {
        return function (v) {
            return Data_Functor.map((dictApplicative.Apply0()).Functor0())(Tuple.create(v.value0))(f(v.value1));
        };
    };
});
var extendTuple = new Control_Extend.Extend(function () {
    return functorTuple;
}, function (f) {
    return function (v) {
        return new Tuple(v.value0, f(v));
    };
});
var eqTuple = function (dictEq) {
    return function (dictEq1) {
        return new Data_Eq.Eq(function (x) {
            return function (y) {
                return Data_Eq.eq(dictEq)(x.value0)(y.value0) && Data_Eq.eq(dictEq1)(x.value1)(y.value1);
            };
        });
    };
};
var ordTuple = function (dictOrd) {
    return function (dictOrd1) {
        return new Data_Ord.Ord(function () {
            return eqTuple(dictOrd.Eq0())(dictOrd1.Eq0());
        }, function (x) {
            return function (y) {
                var v = Data_Ord.compare(dictOrd)(x.value0)(y.value0);
                if (v instanceof Data_Ordering.LT) {
                    return Data_Ordering.LT.value;
                };
                if (v instanceof Data_Ordering.GT) {
                    return Data_Ordering.GT.value;
                };
                return Data_Ord.compare(dictOrd1)(x.value1)(y.value1);
            };
        });
    };
};
var eq1Tuple = function (dictEq) {
    return new Data_Eq.Eq1(function (dictEq1) {
        return Data_Eq.eq(eqTuple(dictEq)(dictEq1));
    });
};
var ord1Tuple = function (dictOrd) {
    return new Data_Ord.Ord1(function () {
        return eq1Tuple(dictOrd.Eq0());
    }, function (dictOrd1) {
        return Data_Ord.compare(ordTuple(dictOrd)(dictOrd1));
    });
};
var distributiveTuple = function (dictTypeEquals) {
    return new Data_Distributive.Distributive(function () {
        return functorTuple;
    }, function (dictFunctor) {
        return Data_Distributive.collectDefault(distributiveTuple(dictTypeEquals))(dictFunctor);
    }, function (dictFunctor) {
        return function ($265) {
            return Tuple.create(Type_Equality.from(dictTypeEquals)(Data_Unit.unit))(Data_Functor.map(dictFunctor)(snd)($265));
        };
    });
};
var curry = function (f) {
    return function (a) {
        return function (b) {
            return f(new Tuple(a, b));
        };
    };
};
var comonadTuple = new Control_Comonad.Comonad(function () {
    return extendTuple;
}, snd);
var commutativeRingTuple = function (dictCommutativeRing) {
    return function (dictCommutativeRing1) {
        return new Data_CommutativeRing.CommutativeRing(function () {
            return ringTuple(dictCommutativeRing.Ring0())(dictCommutativeRing1.Ring0());
        });
    };
};
var boundedTuple = function (dictBounded) {
    return function (dictBounded1) {
        return new Data_Bounded.Bounded(function () {
            return ordTuple(dictBounded.Ord0())(dictBounded1.Ord0());
        }, new Tuple(Data_Bounded.bottom(dictBounded), Data_Bounded.bottom(dictBounded1)), new Tuple(Data_Bounded.top(dictBounded), Data_Bounded.top(dictBounded1)));
    };
};
var booleanAlgebraTuple = function (dictBooleanAlgebra) {
    return function (dictBooleanAlgebra1) {
        return new Data_BooleanAlgebra.BooleanAlgebra(function () {
            return heytingAlgebraTuple(dictBooleanAlgebra.HeytingAlgebra0())(dictBooleanAlgebra1.HeytingAlgebra0());
        });
    };
};
var bifunctorTuple = new Data_Bifunctor.Bifunctor(function (f) {
    return function (g) {
        return function (v) {
            return new Tuple(f(v.value0), g(v.value1));
        };
    };
});
var bifoldableTuple = new Data_Bifoldable.Bifoldable(function (dictMonoid) {
    return function (f) {
        return function (g) {
            return function (v) {
                return Data_Semigroup.append(dictMonoid.Semigroup0())(f(v.value0))(g(v.value1));
            };
        };
    };
}, function (f) {
    return function (g) {
        return function (z) {
            return function (v) {
                return g(f(z)(v.value0))(v.value1);
            };
        };
    };
}, function (f) {
    return function (g) {
        return function (z) {
            return function (v) {
                return f(v.value0)(g(v.value1)(z));
            };
        };
    };
});
var bitraversableTuple = new Data_Bitraversable.Bitraversable(function () {
    return bifoldableTuple;
}, function () {
    return bifunctorTuple;
}, function (dictApplicative) {
    return function (v) {
        return Control_Apply.apply(dictApplicative.Apply0())(Data_Functor.map((dictApplicative.Apply0()).Functor0())(Tuple.create)(v.value0))(v.value1);
    };
}, function (dictApplicative) {
    return function (f) {
        return function (g) {
            return function (v) {
                return Control_Apply.apply(dictApplicative.Apply0())(Data_Functor.map((dictApplicative.Apply0()).Functor0())(Tuple.create)(f(v.value0)))(g(v.value1));
            };
        };
    };
});
var biapplyTuple = new Control_Biapply.Biapply(function () {
    return bifunctorTuple;
}, function (v) {
    return function (v1) {
        return new Tuple(v.value0(v1.value0), v.value1(v1.value1));
    };
});
var biapplicativeTuple = new Control_Biapplicative.Biapplicative(function () {
    return biapplyTuple;
}, Tuple.create);
var applyTuple = function (dictSemigroup) {
    return new Control_Apply.Apply(function () {
        return functorTuple;
    }, function (v) {
        return function (v1) {
            return new Tuple(Data_Semigroup.append(dictSemigroup)(v.value0)(v1.value0), v.value1(v1.value1));
        };
    });
};
var bindTuple = function (dictSemigroup) {
    return new Control_Bind.Bind(function () {
        return applyTuple(dictSemigroup);
    }, function (v) {
        return function (f) {
            var v1 = f(v.value1);
            return new Tuple(Data_Semigroup.append(dictSemigroup)(v.value0)(v1.value0), v1.value1);
        };
    });
};
var applicativeTuple = function (dictMonoid) {
    return new Control_Applicative.Applicative(function () {
        return applyTuple(dictMonoid.Semigroup0());
    }, Tuple.create(Data_Monoid.mempty(dictMonoid)));
};
var monadTuple = function (dictMonoid) {
    return new Control_Monad.Monad(function () {
        return applicativeTuple(dictMonoid);
    }, function () {
        return bindTuple(dictMonoid.Semigroup0());
    });
};
module.exports = {
    Tuple: Tuple,
    fst: fst,
    snd: snd,
    curry: curry,
    uncurry: uncurry,
    swap: swap,
    lookup: lookup,
    showTuple: showTuple,
    eqTuple: eqTuple,
    eq1Tuple: eq1Tuple,
    ordTuple: ordTuple,
    ord1Tuple: ord1Tuple,
    boundedTuple: boundedTuple,
    semigroupoidTuple: semigroupoidTuple,
    semigroupTuple: semigroupTuple,
    monoidTuple: monoidTuple,
    semiringTuple: semiringTuple,
    ringTuple: ringTuple,
    commutativeRingTuple: commutativeRingTuple,
    heytingAlgebraTuple: heytingAlgebraTuple,
    booleanAlgebraTuple: booleanAlgebraTuple,
    functorTuple: functorTuple,
    invariantTuple: invariantTuple,
    bifunctorTuple: bifunctorTuple,
    applyTuple: applyTuple,
    biapplyTuple: biapplyTuple,
    applicativeTuple: applicativeTuple,
    biapplicativeTuple: biapplicativeTuple,
    bindTuple: bindTuple,
    monadTuple: monadTuple,
    extendTuple: extendTuple,
    comonadTuple: comonadTuple,
    lazyTuple: lazyTuple,
    foldableTuple: foldableTuple,
    bifoldableTuple: bifoldableTuple,
    traversableTuple: traversableTuple,
    bitraversableTuple: bitraversableTuple,
    distributiveTuple: distributiveTuple
};

},{"../Control.Applicative":35,"../Control.Apply":37,"../Control.Biapplicative":38,"../Control.Biapply":39,"../Control.Bind":41,"../Control.Comonad":43,"../Control.Extend":45,"../Control.Lazy":46,"../Control.Monad":58,"../Control.Semigroupoid":61,"../Data.Bifoldable":69,"../Data.Bifunctor":75,"../Data.Bitraversable":76,"../Data.BooleanAlgebra":78,"../Data.Bounded":80,"../Data.CommutativeRing":81,"../Data.Distributive":82,"../Data.Eq":86,"../Data.Foldable":91,"../Data.Function":95,"../Data.Functor":98,"../Data.Functor.Invariant":96,"../Data.HeytingAlgebra":104,"../Data.Maybe":108,"../Data.Maybe.First":106,"../Data.Monoid":115,"../Data.Newtype":117,"../Data.Ord":122,"../Data.Ordering":123,"../Data.Ring":127,"../Data.Semigroup":130,"../Data.Semiring":132,"../Data.Show":134,"../Data.Traversable":139,"../Data.Unit":145,"../Prelude":152,"../Type.Equality":160}],142:[function(require,module,exports){
"use strict";

exports.unfoldrArrayImpl = function (isNothing) {
  return function (fromJust) {
    return function (fst) {
      return function (snd) {
        return function (f) {
          return function (b) {
            var result = [];
            var value = b;
            while (true) { // eslint-disable-line no-constant-condition
              var maybe = f(value);
              if (isNothing(maybe)) return result;
              var tuple = fromJust(maybe);
              result.push(fst(tuple));
              value = snd(tuple);
            }
          };
        };
      };
    };
  };
};

},{}],143:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var $foreign = require("./foreign");
var Data_Function = require("../Data.Function");
var Data_Functor = require("../Data.Functor");
var Data_Maybe = require("../Data.Maybe");
var Data_Ord = require("../Data.Ord");
var Data_Ring = require("../Data.Ring");
var Data_Semiring = require("../Data.Semiring");
var Data_Traversable = require("../Data.Traversable");
var Data_Tuple = require("../Data.Tuple");
var Data_Unit = require("../Data.Unit");
var Partial_Unsafe = require("../Partial.Unsafe");
var Prelude = require("../Prelude");
var Unfoldable = function (unfoldr) {
    this.unfoldr = unfoldr;
};
var unfoldr = function (dict) {
    return dict.unfoldr;
};
var unfoldableArray = new Unfoldable($foreign.unfoldrArrayImpl(Data_Maybe.isNothing)(Data_Maybe.fromJust())(Data_Tuple.fst)(Data_Tuple.snd));
var replicate = function (dictUnfoldable) {
    return function (n) {
        return function (v) {
            var step = function (i) {
                var $9 = i <= 0;
                if ($9) {
                    return Data_Maybe.Nothing.value;
                };
                return new Data_Maybe.Just(new Data_Tuple.Tuple(v, i - 1 | 0));
            };
            return unfoldr(dictUnfoldable)(step)(n);
        };
    };
};
var replicateA = function (dictApplicative) {
    return function (dictUnfoldable) {
        return function (dictTraversable) {
            return function (n) {
                return function (m) {
                    return Data_Traversable.sequence(dictTraversable)(dictApplicative)(replicate(dictUnfoldable)(n)(m));
                };
            };
        };
    };
};
var singleton = function (dictUnfoldable) {
    return replicate(dictUnfoldable)(1);
};
var range = function (dictUnfoldable) {
    return function (start) {
        return function (end) {
            return unfoldr(dictUnfoldable)(function (i) {
                var $10 = i <= end;
                if ($10) {
                    return new Data_Maybe.Just(Data_Tuple.Tuple.create(i)(i + 1 | 0));
                };
                return Data_Maybe.Nothing.value;
            })(start);
        };
    };
};
var none = function (dictUnfoldable) {
    return unfoldr(dictUnfoldable)(Data_Function["const"](Data_Maybe.Nothing.value))(Data_Unit.unit);
};
var fromMaybe = function (dictUnfoldable) {
    return unfoldr(dictUnfoldable)(function (b) {
        return Data_Functor.map(Data_Maybe.functorMaybe)(Data_Function.flip(Data_Tuple.Tuple.create)(Data_Maybe.Nothing.value))(b);
    });
};
module.exports = {
    Unfoldable: Unfoldable,
    unfoldr: unfoldr,
    replicate: replicate,
    replicateA: replicateA,
    none: none,
    singleton: singleton,
    range: range,
    fromMaybe: fromMaybe,
    unfoldableArray: unfoldableArray
};

},{"../Data.Function":95,"../Data.Functor":98,"../Data.Maybe":108,"../Data.Ord":122,"../Data.Ring":127,"../Data.Semiring":132,"../Data.Traversable":139,"../Data.Tuple":141,"../Data.Unit":145,"../Partial.Unsafe":149,"../Prelude":152,"./foreign":142}],144:[function(require,module,exports){
"use strict";

exports.unit = {};

},{}],145:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var $foreign = require("./foreign");
var Data_Show = require("../Data.Show");
var showUnit = new Data_Show.Show(function (v) {
    return "unit";
});
module.exports = {
    showUnit: showUnit,
    unit: $foreign.unit
};

},{"../Data.Show":134,"./foreign":144}],146:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Data_Show = require("../Data.Show");
var Void = function (x) {
    return x;
};
var absurd = function (a) {
    var spin = function ($copy_v) {
        var $tco_result;
        function $tco_loop(v) {
            $copy_v = v;
            return;
        };
        while (!false) {
            $tco_result = $tco_loop($copy_v);
        };
        return $tco_result;
    };
    return spin(a);
};
var showVoid = new Data_Show.Show(absurd);
module.exports = {
    absurd: absurd,
    showVoid: showVoid
};

},{"../Data.Show":134}],147:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Applicative = require("../Control.Applicative");
var Control_Apply = require("../Control.Apply");
var Control_Bind = require("../Control.Bind");
var Control_Category = require("../Control.Category");
var Control_Monad_Eff = require("../Control.Monad.Eff");
var Control_Monad_Eff_Console = require("../Control.Monad.Eff.Console");
var Control_Semigroupoid = require("../Control.Semigroupoid");
var Counters_Version1 = require("../Counters.Version1");
var DOM = require("../DOM");
var Data_Array = require("../Data.Array");
var Data_Eq = require("../Data.Eq");
var Data_Foldable = require("../Data.Foldable");
var Data_Function = require("../Data.Function");
var Data_Functor = require("../Data.Functor");
var Data_Hareactive = require("../Data.Hareactive");
var Data_Monoid = require("../Data.Monoid");
var Data_Ring = require("../Data.Ring");
var Data_Semigroup = require("../Data.Semigroup");
var Data_Semiring = require("../Data.Semiring");
var Data_Show = require("../Data.Show");
var Prelude = require("../Prelude");
var Turbine = require("../Turbine");
var Turbine_HTML = require("../Turbine.HTML");
var counterView = function (dictShow) {
    return function (v) {
        return Turbine_HTML.div(Turbine.merge()(Turbine.merge()(Turbine.merge()(Turbine.merge()(Turbine_HTML.text("Counter"))(Turbine_HTML.span(Turbine_HTML.textB(Data_Functor.map(Data_Hareactive.functorBehavior)(Data_Show.show(dictShow))(v.count)))))(Turbine.output()(Turbine_HTML.button("+"))(function (o) {
            return {
                increment: o.click
            };
        })))(Turbine.output()(Turbine_HTML.button("-"))(function (o) {
            return {
                decrement: o.click
            };
        })))(Turbine.output()(Turbine_HTML.button("x"))(function (o) {
            return {
                "delete": o.click
            };
        })));
    };
};
var counterModel = function (v) {
    return function (id) {
        var changes = Data_Semigroup.append(Data_Hareactive.semigroupStream)(Data_Functor.voidLeft(Data_Hareactive.functorStream)(v.increment)(1))(Data_Functor.voidLeft(Data_Hareactive.functorStream)(v.decrement)(-1 | 0));
        return Control_Bind.bind(Data_Hareactive.bindNow)(Data_Hareactive.sample(Data_Hareactive.scan(Data_Semiring.add(Data_Semiring.semiringInt))(0)(changes)))(function (v1) {
            return Control_Applicative.pure(Data_Hareactive.applicativeNow)({
                count: v1,
                "delete": Data_Functor.voidLeft(Data_Hareactive.functorStream)(v["delete"])(id)
            });
        });
    };
};
var counterListModel = function (v) {
    return function (init) {
        var sum = Control_Bind.bind(Data_Hareactive.bindBehavior)(v.listOut)(function ($29) {
            return Data_Foldable.foldr(Data_Foldable.foldableArray)(Control_Apply.lift2(Data_Hareactive.applyBehavior)(Data_Semiring.add(Data_Semiring.semiringInt)))(Control_Applicative.pure(Data_Hareactive.applicativeBehavior)(0))(Data_Functor.map(Data_Functor.functorArray)(function (v1) {
                return v1.count;
            })($29));
        });
        var removeId = Data_Functor.map(Data_Hareactive.functorBehavior)(function ($30) {
            return Data_Foldable.fold(Data_Foldable.foldableArray)(Data_Hareactive.monoidStream)(Data_Functor.map(Data_Functor.functorArray)(function (v1) {
                return v1["delete"];
            })($30));
        })(v.listOut);
        var removeCounter = Data_Functor.map(Data_Hareactive.functorStream)(function (i) {
            return Data_Array.filter(function (v1) {
                return i !== v1;
            });
        })(Data_Hareactive.switchStream(removeId));
        return Control_Bind.bind(Data_Hareactive.bindNow)(Data_Hareactive.sample(Data_Hareactive.scanS(Data_Semiring.add(Data_Semiring.semiringInt))(0)(Data_Functor.voidLeft(Data_Hareactive.functorStream)(v.addCounter)(1))))(function (v1) {
            var appendCounter = Data_Functor.map(Data_Hareactive.functorStream)(Data_Array.cons)(v1);
            return Control_Bind.bind(Data_Hareactive.bindNow)(Data_Hareactive.sample(Data_Hareactive.scan(Data_Function.apply)(init)(Data_Semigroup.append(Data_Hareactive.semigroupStream)(appendCounter)(removeCounter))))(function (v2) {
                return Control_Applicative.pure(Data_Hareactive.applicativeNow)({
                    sum: sum,
                    counterIds: v2
                });
            });
        });
    };
};
var counter = Turbine.modelView(counterModel)(counterView(Data_Show.showInt));
var counterListView = function (dictShow) {
    return function (v) {
        return Turbine_HTML.div(Turbine.merge()(Turbine.merge()(Turbine.merge()(Turbine.merge()(Turbine.merge()(Turbine.merge()(Turbine_HTML.h1(Turbine_HTML.text("Version 1")))(Counters_Version1.counter(0)))(Turbine_HTML.br))(Turbine_HTML.h1(Turbine_HTML.text("Counters"))))(Turbine_HTML.span(Turbine_HTML.textB(Data_Functor.map(Data_Hareactive.functorBehavior)(function (n) {
            return "Sum " + Data_Show.show(dictShow)(n);
        })(v.sum)))))(Turbine.output()(Turbine_HTML.button("Add counter"))(function (o) {
            return {
                addCounter: o.click
            };
        })))(Turbine.output()(Turbine.list(counter)(v.counterIds)(Control_Category.id(Control_Category.categoryFn)))(function (o) {
            return {
                listOut: o
            };
        })));
    };
};
var counterList = Turbine.modelView(counterListModel)(counterListView(Data_Show.showInt));
var main = Turbine.runComponent("#mount")(counterList([ 0 ]));
module.exports = {
    counterModel: counterModel,
    counterView: counterView,
    counter: counter,
    counterListModel: counterListModel,
    counterListView: counterListView,
    counterList: counterList,
    main: main
};

},{"../Control.Applicative":35,"../Control.Apply":37,"../Control.Bind":41,"../Control.Category":42,"../Control.Monad.Eff":54,"../Control.Monad.Eff.Console":48,"../Control.Semigroupoid":61,"../Counters.Version1":62,"../DOM":63,"../Data.Array":68,"../Data.Eq":86,"../Data.Foldable":91,"../Data.Function":95,"../Data.Functor":98,"../Data.Hareactive":102,"../Data.Monoid":115,"../Data.Ring":127,"../Data.Semigroup":130,"../Data.Semiring":132,"../Data.Show":134,"../Prelude":152,"../Turbine":156,"../Turbine.HTML":154}],148:[function(require,module,exports){
"use strict";

// module Partial.Unsafe

exports.unsafePartial = function (f) {
  return f();
};

},{}],149:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var $foreign = require("./foreign");
var Partial = require("../Partial");
var unsafePartialBecause = function (v) {
    return function (x) {
        return $foreign.unsafePartial(function (dictPartial) {
            return x(dictPartial);
        });
    };
};
var unsafeCrashWith = function (msg) {
    return $foreign.unsafePartial(function (dictPartial) {
        return Partial.crashWith(dictPartial)(msg);
    });
};
module.exports = {
    unsafePartialBecause: unsafePartialBecause,
    unsafeCrashWith: unsafeCrashWith,
    unsafePartial: $foreign.unsafePartial
};

},{"../Partial":151,"./foreign":148}],150:[function(require,module,exports){
"use strict";

// module Partial

exports.crashWith = function () {
  return function (msg) {
    throw new Error(msg);
  };
};

},{}],151:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var $foreign = require("./foreign");
var crash = function (dictPartial) {
    return $foreign.crashWith(dictPartial)("Partial.crash: partial function");
};
module.exports = {
    crash: crash,
    crashWith: $foreign.crashWith
};

},{"./foreign":150}],152:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Applicative = require("../Control.Applicative");
var Control_Apply = require("../Control.Apply");
var Control_Bind = require("../Control.Bind");
var Control_Category = require("../Control.Category");
var Control_Monad = require("../Control.Monad");
var Control_Semigroupoid = require("../Control.Semigroupoid");
var Data_Boolean = require("../Data.Boolean");
var Data_BooleanAlgebra = require("../Data.BooleanAlgebra");
var Data_Bounded = require("../Data.Bounded");
var Data_CommutativeRing = require("../Data.CommutativeRing");
var Data_DivisionRing = require("../Data.DivisionRing");
var Data_Eq = require("../Data.Eq");
var Data_EuclideanRing = require("../Data.EuclideanRing");
var Data_Field = require("../Data.Field");
var Data_Function = require("../Data.Function");
var Data_Functor = require("../Data.Functor");
var Data_HeytingAlgebra = require("../Data.HeytingAlgebra");
var Data_NaturalTransformation = require("../Data.NaturalTransformation");
var Data_Ord = require("../Data.Ord");
var Data_Ordering = require("../Data.Ordering");
var Data_Ring = require("../Data.Ring");
var Data_Semigroup = require("../Data.Semigroup");
var Data_Semiring = require("../Data.Semiring");
var Data_Show = require("../Data.Show");
var Data_Unit = require("../Data.Unit");
var Data_Void = require("../Data.Void");
module.exports = {};

},{"../Control.Applicative":35,"../Control.Apply":37,"../Control.Bind":41,"../Control.Category":42,"../Control.Monad":58,"../Control.Semigroupoid":61,"../Data.Boolean":77,"../Data.BooleanAlgebra":78,"../Data.Bounded":80,"../Data.CommutativeRing":81,"../Data.DivisionRing":83,"../Data.Eq":86,"../Data.EuclideanRing":88,"../Data.Field":89,"../Data.Function":95,"../Data.Functor":98,"../Data.HeytingAlgebra":104,"../Data.NaturalTransformation":116,"../Data.Ord":122,"../Data.Ordering":123,"../Data.Ring":127,"../Data.Semigroup":130,"../Data.Semiring":132,"../Data.Show":134,"../Data.Unit":145,"../Data.Void":146}],153:[function(require,module,exports){
var T = require('@funkia/turbine');

exports._h1 = T.elements.h1;

exports._span = T.elements.span;

exports._div = T.elements.div;

exports._input = T.elements.input;

exports._a = T.elements.a;

exports._button = T.elements.button;

exports._text = T.text;

exports._textB = T.dynamic;

exports.br = T.elements.br;

},{"@funkia/turbine":200}],154:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var $foreign = require("./foreign");
var Data_Function_Uncurried = require("../Data.Function.Uncurried");
var Data_Hareactive = require("../Data.Hareactive");
var Prelude = require("../Prelude");
var Turbine = require("../Turbine");
var textB = $foreign._textB;
var text = $foreign._text;
var span = $foreign._span;
var input = $foreign._input();
var h1 = $foreign._h1;
var div = $foreign._div;
var button = $foreign._button;
var a = $foreign._a;
module.exports = {
    h1: h1,
    div: div,
    text: text,
    textB: textB,
    span: span,
    input: input,
    button: button,
    br: $foreign.br
};

},{"../Data.Function.Uncurried":94,"../Data.Hareactive":102,"../Prelude":152,"../Turbine":156,"./foreign":153}],155:[function(require,module,exports){
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

},{"@funkia/turbine":200}],156:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var $foreign = require("./foreign");
var Control_Applicative = require("../Control.Applicative");
var Control_Apply = require("../Control.Apply");
var Control_Category = require("../Control.Category");
var Control_Monad_Eff = require("../Control.Monad.Eff");
var Control_Monad_Eff_Uncurried = require("../Control.Monad.Eff.Uncurried");
var DOM = require("../DOM");
var Data_Function_Uncurried = require("../Data.Function.Uncurried");
var Data_Functor = require("../Data.Functor");
var Data_Hareactive = require("../Data.Hareactive");
var Data_Monoid = require("../Data.Monoid");
var Data_Record_Builder = require("../Data.Record.Builder");
var Data_Semigroup = require("../Data.Semigroup");
var Prelude = require("../Prelude");
var IsBehavior = function (toBehavior) {
    this.toBehavior = toBehavior;
};
var toBehavior = function (dict) {
    return dict.toBehavior;
};
var runComponent = Control_Monad_Eff_Uncurried.runEffFn2($foreign._runComponent);
var output = function (dictUnion) {
    return Data_Function_Uncurried.runFn2($foreign._output(dictUnion));
};
var modelView = function (m) {
    return function (v) {
        return $foreign._modelView(Data_Function_Uncurried.mkFn2(m), v);
    };
};
var merge = function (dictUnion) {
    return Data_Function_Uncurried.runFn2($foreign._merge(dictUnion));
};
var list = Data_Function_Uncurried.runFn3($foreign._list);
var isBehaviorString = new IsBehavior(Control_Applicative.pure(Data_Hareactive.applicativeBehavior));
var isBehaviorBehavior = new IsBehavior(Control_Category.id(Control_Category.categoryFn));
var functorComponent = new Data_Functor.Functor(Data_Function_Uncurried.runFn2($foreign._map));
var applyComponent = new Control_Apply.Apply(function () {
    return functorComponent;
}, Data_Function_Uncurried.runFn2($foreign._apply));
var semigroupComponent = function (dictSemigroup) {
    return new Data_Semigroup.Semigroup(Control_Apply.lift2(applyComponent)(Data_Semigroup.append(dictSemigroup)));
};
module.exports = {
    runComponent: runComponent,
    IsBehavior: IsBehavior,
    toBehavior: toBehavior,
    modelView: modelView,
    merge: merge,
    output: output,
    list: list,
    functorComponent: functorComponent,
    applyComponent: applyComponent,
    semigroupComponent: semigroupComponent,
    isBehaviorBehavior: isBehaviorBehavior,
    isBehaviorString: isBehaviorString,
    dynamic: $foreign.dynamic
};

},{"../Control.Applicative":35,"../Control.Apply":37,"../Control.Category":42,"../Control.Monad.Eff":54,"../Control.Monad.Eff.Uncurried":50,"../DOM":63,"../Data.Function.Uncurried":94,"../Data.Functor":98,"../Data.Hareactive":102,"../Data.Monoid":115,"../Data.Record.Builder":125,"../Data.Semigroup":130,"../Prelude":152,"./foreign":155}],157:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Type_Proxy = require("../Type.Proxy");
var BProxy = (function () {
    function BProxy() {

    };
    BProxy.value = new BProxy();
    return BProxy;
})();
var IsBoolean = function (reflectBoolean) {
    this.reflectBoolean = reflectBoolean;
};
var And = {};
var Or = {};
var Not = {};
var If = {};
var reflectBoolean = function (dict) {
    return dict.reflectBoolean;
};
var orTrue = Or;
var orFalse = Or;
var or = function (dictOr) {
    return function (v) {
        return function (v1) {
            return BProxy.value;
        };
    };
};
var notTrue = Not;
var notFalse = Not;
var not = function (dictNot) {
    return function (v) {
        return BProxy.value;
    };
};
var isBooleanTrue = new IsBoolean(function (v) {
    return true;
});
var isBooleanFalse = new IsBoolean(function (v) {
    return false;
});
var reifyBoolean = function (v) {
    return function (f) {
        if (v) {
            return f(isBooleanTrue)(BProxy.value);
        };
        if (!v) {
            return f(isBooleanFalse)(BProxy.value);
        };
        throw new Error("Failed pattern match at Type.Data.Boolean line 36, column 1 - line 36, column 83: " + [ v.constructor.name, f.constructor.name ]);
    };
};
var if_ = function (dictIf) {
    return function (v) {
        return function (v1) {
            return function (v2) {
                return Type_Proxy["Proxy"].value;
            };
        };
    };
};
var ifTrue = If;
var ifFalse = If;
var andTrue = And;
var andFalse = And;
var and = function (dictAnd) {
    return function (v) {
        return function (v1) {
            return BProxy.value;
        };
    };
};
module.exports = {
    BProxy: BProxy,
    IsBoolean: IsBoolean,
    reflectBoolean: reflectBoolean,
    reifyBoolean: reifyBoolean,
    And: And,
    and: and,
    Or: Or,
    or: or,
    Not: Not,
    not: not,
    If: If,
    if_: if_,
    isBooleanTrue: isBooleanTrue,
    isBooleanFalse: isBooleanFalse,
    andTrue: andTrue,
    andFalse: andFalse,
    orTrue: orTrue,
    orFalse: orFalse,
    notTrue: notTrue,
    notFalse: notFalse,
    ifTrue: ifTrue,
    ifFalse: ifFalse
};

},{"../Type.Proxy":161}],158:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Data_Ordering = require("../Data.Ordering");
var Type_Data_Boolean = require("../Type.Data.Boolean");
var OProxy = (function () {
    function OProxy() {

    };
    OProxy.value = new OProxy();
    return OProxy;
})();
var IsOrdering = function (reflectOrdering) {
    this.reflectOrdering = reflectOrdering;
};
var AppendOrdering = {};
var InvertOrdering = {};
var Equals = {};
var reflectOrdering = function (dict) {
    return dict.reflectOrdering;
};
var isOrderingLT = new IsOrdering(function (v) {
    return Data_Ordering.LT.value;
});
var isOrderingGT = new IsOrdering(function (v) {
    return Data_Ordering.GT.value;
});
var isOrderingEQ = new IsOrdering(function (v) {
    return Data_Ordering.EQ.value;
});
var reifyOrdering = function (v) {
    return function (f) {
        if (v instanceof Data_Ordering.LT) {
            return f(isOrderingLT)(OProxy.value);
        };
        if (v instanceof Data_Ordering.EQ) {
            return f(isOrderingEQ)(OProxy.value);
        };
        if (v instanceof Data_Ordering.GT) {
            return f(isOrderingGT)(OProxy.value);
        };
        throw new Error("Failed pattern match at Type.Data.Ordering line 38, column 1 - line 38, column 86: " + [ v.constructor.name, f.constructor.name ]);
    };
};
var invertOrderingLT = InvertOrdering;
var invertOrderingGT = InvertOrdering;
var invertOrderingEQ = InvertOrdering;
var invertOrdering = function (dictInvertOrdering) {
    return function (v) {
        return OProxy.value;
    };
};
var equalsLTLT = Equals;
var equalsLTGT = Equals;
var equalsLTEQ = Equals;
var equalsGTLT = Equals;
var equalsGTGT = Equals;
var equalsGTEQ = Equals;
var equalsEQLT = Equals;
var equalsEQGT = Equals;
var equalsEQEQ = Equals;
var equals = function (dictEquals) {
    return function (v) {
        return function (v1) {
            return Type_Data_Boolean.BProxy.value;
        };
    };
};
var appendOrderingLT = AppendOrdering;
var appendOrderingGT = AppendOrdering;
var appendOrderingEQ = AppendOrdering;
var appendOrdering = function (dictAppendOrdering) {
    return function (v) {
        return function (v1) {
            return OProxy.value;
        };
    };
};
module.exports = {
    OProxy: OProxy,
    IsOrdering: IsOrdering,
    reflectOrdering: reflectOrdering,
    reifyOrdering: reifyOrdering,
    AppendOrdering: AppendOrdering,
    appendOrdering: appendOrdering,
    InvertOrdering: InvertOrdering,
    invertOrdering: invertOrdering,
    Equals: Equals,
    equals: equals,
    isOrderingLT: isOrderingLT,
    isOrderingEQ: isOrderingEQ,
    isOrderingGT: isOrderingGT,
    appendOrderingLT: appendOrderingLT,
    appendOrderingEQ: appendOrderingEQ,
    appendOrderingGT: appendOrderingGT,
    invertOrderingLT: invertOrderingLT,
    invertOrderingEQ: invertOrderingEQ,
    invertOrderingGT: invertOrderingGT,
    equalsEQEQ: equalsEQEQ,
    equalsLTLT: equalsLTLT,
    equalsGTGT: equalsGTGT,
    equalsEQLT: equalsEQLT,
    equalsEQGT: equalsEQGT,
    equalsLTEQ: equalsLTEQ,
    equalsLTGT: equalsLTGT,
    equalsGTLT: equalsGTLT,
    equalsGTEQ: equalsGTEQ
};

},{"../Data.Ordering":123,"../Type.Data.Boolean":157}],159:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Data_Symbol = require("../Data.Symbol");
var Type_Data_Boolean = require("../Type.Data.Boolean");
var Type_Data_Ordering = require("../Type.Data.Ordering");
var CompareSymbol = {};
var AppendSymbol = {};
var Equals = {};
var equalsSymbol = function (dictCompareSymbol) {
    return function (dictEquals) {
        return Equals;
    };
};
var equals = function (dictEquals) {
    return function (v) {
        return function (v1) {
            return Type_Data_Boolean.BProxy.value;
        };
    };
};
var compareSymbol = function (dictCompareSymbol) {
    return function (v) {
        return function (v1) {
            return Type_Data_Ordering.OProxy.value;
        };
    };
};
var appendSymbol = function (dictAppendSymbol) {
    return function (v) {
        return function (v1) {
            return Data_Symbol.SProxy.value;
        };
    };
};
module.exports = {
    CompareSymbol: CompareSymbol,
    compareSymbol: compareSymbol,
    AppendSymbol: AppendSymbol,
    appendSymbol: appendSymbol,
    Equals: Equals,
    equals: equals,
    equalsSymbol: equalsSymbol
};

},{"../Data.Symbol":135,"../Type.Data.Boolean":157,"../Type.Data.Ordering":158}],160:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var TypeEquals = function (from, to) {
    this.from = from;
    this.to = to;
};
var to = function (dict) {
    return dict.to;
};
var refl = new TypeEquals(function (a) {
    return a;
}, function (a) {
    return a;
});
var from = function (dict) {
    return dict.from;
};
module.exports = {
    TypeEquals: TypeEquals,
    to: to,
    from: from,
    refl: refl
};

},{}],161:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Control_Applicative = require("../Control.Applicative");
var Control_Apply = require("../Control.Apply");
var Control_Bind = require("../Control.Bind");
var Control_Monad = require("../Control.Monad");
var Data_BooleanAlgebra = require("../Data.BooleanAlgebra");
var Data_Bounded = require("../Data.Bounded");
var Data_CommutativeRing = require("../Data.CommutativeRing");
var Data_Eq = require("../Data.Eq");
var Data_Functor = require("../Data.Functor");
var Data_HeytingAlgebra = require("../Data.HeytingAlgebra");
var Data_Ord = require("../Data.Ord");
var Data_Ordering = require("../Data.Ordering");
var Data_Ring = require("../Data.Ring");
var Data_Semigroup = require("../Data.Semigroup");
var Data_Semiring = require("../Data.Semiring");
var Data_Show = require("../Data.Show");
var Prelude = require("../Prelude");
var Proxy3 = (function () {
    function Proxy3() {

    };
    Proxy3.value = new Proxy3();
    return Proxy3;
})();
var Proxy2 = (function () {
    function Proxy2() {

    };
    Proxy2.value = new Proxy2();
    return Proxy2;
})();
var $$Proxy = (function () {
    function $$Proxy() {

    };
    $$Proxy.value = new $$Proxy();
    return $$Proxy;
})();
var showProxy3 = new Data_Show.Show(function (v) {
    return "Proxy3";
});
var showProxy2 = new Data_Show.Show(function (v) {
    return "Proxy2";
});
var showProxy = new Data_Show.Show(function (v) {
    return "Proxy";
});
var semiringProxy3 = new Data_Semiring.Semiring(function (v) {
    return function (v1) {
        return Proxy3.value;
    };
}, function (v) {
    return function (v1) {
        return Proxy3.value;
    };
}, Proxy3.value, Proxy3.value);
var semiringProxy2 = new Data_Semiring.Semiring(function (v) {
    return function (v1) {
        return Proxy2.value;
    };
}, function (v) {
    return function (v1) {
        return Proxy2.value;
    };
}, Proxy2.value, Proxy2.value);
var semiringProxy = new Data_Semiring.Semiring(function (v) {
    return function (v1) {
        return $$Proxy.value;
    };
}, function (v) {
    return function (v1) {
        return $$Proxy.value;
    };
}, $$Proxy.value, $$Proxy.value);
var semigroupProxy3 = new Data_Semigroup.Semigroup(function (v) {
    return function (v1) {
        return Proxy3.value;
    };
});
var semigroupProxy2 = new Data_Semigroup.Semigroup(function (v) {
    return function (v1) {
        return Proxy2.value;
    };
});
var semigroupProxy = new Data_Semigroup.Semigroup(function (v) {
    return function (v1) {
        return $$Proxy.value;
    };
});
var ringProxy3 = new Data_Ring.Ring(function () {
    return semiringProxy3;
}, function (v) {
    return function (v1) {
        return Proxy3.value;
    };
});
var ringProxy2 = new Data_Ring.Ring(function () {
    return semiringProxy2;
}, function (v) {
    return function (v1) {
        return Proxy2.value;
    };
});
var ringProxy = new Data_Ring.Ring(function () {
    return semiringProxy;
}, function (v) {
    return function (v1) {
        return $$Proxy.value;
    };
});
var heytingAlgebraProxy3 = new Data_HeytingAlgebra.HeytingAlgebra(function (v) {
    return function (v1) {
        return Proxy3.value;
    };
}, function (v) {
    return function (v1) {
        return Proxy3.value;
    };
}, Proxy3.value, function (v) {
    return function (v1) {
        return Proxy3.value;
    };
}, function (v) {
    return Proxy3.value;
}, Proxy3.value);
var heytingAlgebraProxy2 = new Data_HeytingAlgebra.HeytingAlgebra(function (v) {
    return function (v1) {
        return Proxy2.value;
    };
}, function (v) {
    return function (v1) {
        return Proxy2.value;
    };
}, Proxy2.value, function (v) {
    return function (v1) {
        return Proxy2.value;
    };
}, function (v) {
    return Proxy2.value;
}, Proxy2.value);
var heytingAlgebraProxy = new Data_HeytingAlgebra.HeytingAlgebra(function (v) {
    return function (v1) {
        return $$Proxy.value;
    };
}, function (v) {
    return function (v1) {
        return $$Proxy.value;
    };
}, $$Proxy.value, function (v) {
    return function (v1) {
        return $$Proxy.value;
    };
}, function (v) {
    return $$Proxy.value;
}, $$Proxy.value);
var functorProxy = new Data_Functor.Functor(function (f) {
    return function (m) {
        return $$Proxy.value;
    };
});
var eqProxy3 = new Data_Eq.Eq(function (x) {
    return function (y) {
        return true;
    };
});
var ordProxy3 = new Data_Ord.Ord(function () {
    return eqProxy3;
}, function (x) {
    return function (y) {
        return Data_Ordering.EQ.value;
    };
});
var eqProxy2 = new Data_Eq.Eq(function (x) {
    return function (y) {
        return true;
    };
});
var ordProxy2 = new Data_Ord.Ord(function () {
    return eqProxy2;
}, function (x) {
    return function (y) {
        return Data_Ordering.EQ.value;
    };
});
var eqProxy = new Data_Eq.Eq(function (x) {
    return function (y) {
        return true;
    };
});
var ordProxy = new Data_Ord.Ord(function () {
    return eqProxy;
}, function (x) {
    return function (y) {
        return Data_Ordering.EQ.value;
    };
});
var discardProxy3 = new Control_Bind.Discard(function (dictBind) {
    return Control_Bind.bind(dictBind);
});
var discardProxy2 = new Control_Bind.Discard(function (dictBind) {
    return Control_Bind.bind(dictBind);
});
var discardProxy = new Control_Bind.Discard(function (dictBind) {
    return Control_Bind.bind(dictBind);
});
var commutativeRingProxy3 = new Data_CommutativeRing.CommutativeRing(function () {
    return ringProxy3;
});
var commutativeRingProxy2 = new Data_CommutativeRing.CommutativeRing(function () {
    return ringProxy2;
});
var commutativeRingProxy = new Data_CommutativeRing.CommutativeRing(function () {
    return ringProxy;
});
var boundedProxy3 = new Data_Bounded.Bounded(function () {
    return ordProxy3;
}, Proxy3.value, Proxy3.value);
var boundedProxy2 = new Data_Bounded.Bounded(function () {
    return ordProxy2;
}, Proxy2.value, Proxy2.value);
var boundedProxy = new Data_Bounded.Bounded(function () {
    return ordProxy;
}, $$Proxy.value, $$Proxy.value);
var booleanAlgebraProxy3 = new Data_BooleanAlgebra.BooleanAlgebra(function () {
    return heytingAlgebraProxy3;
});
var booleanAlgebraProxy2 = new Data_BooleanAlgebra.BooleanAlgebra(function () {
    return heytingAlgebraProxy2;
});
var booleanAlgebraProxy = new Data_BooleanAlgebra.BooleanAlgebra(function () {
    return heytingAlgebraProxy;
});
var applyProxy = new Control_Apply.Apply(function () {
    return functorProxy;
}, function (v) {
    return function (v1) {
        return $$Proxy.value;
    };
});
var bindProxy = new Control_Bind.Bind(function () {
    return applyProxy;
}, function (v) {
    return function (v1) {
        return $$Proxy.value;
    };
});
var applicativeProxy = new Control_Applicative.Applicative(function () {
    return applyProxy;
}, function (v) {
    return $$Proxy.value;
});
var monadProxy = new Control_Monad.Monad(function () {
    return applicativeProxy;
}, function () {
    return bindProxy;
});
module.exports = {
    "Proxy": $$Proxy,
    Proxy2: Proxy2,
    Proxy3: Proxy3,
    eqProxy: eqProxy,
    functorProxy: functorProxy,
    ordProxy: ordProxy,
    applicativeProxy: applicativeProxy,
    applyProxy: applyProxy,
    bindProxy: bindProxy,
    booleanAlgebraProxy: booleanAlgebraProxy,
    boundedProxy: boundedProxy,
    commutativeRingProxy: commutativeRingProxy,
    discardProxy: discardProxy,
    heytingAlgebraProxy: heytingAlgebraProxy,
    monadProxy: monadProxy,
    ringProxy: ringProxy,
    semigroupProxy: semigroupProxy,
    semiringProxy: semiringProxy,
    showProxy: showProxy,
    eqProxy2: eqProxy2,
    ordProxy2: ordProxy2,
    booleanAlgebraProxy2: booleanAlgebraProxy2,
    boundedProxy2: boundedProxy2,
    commutativeRingProxy2: commutativeRingProxy2,
    discardProxy2: discardProxy2,
    heytingAlgebraProxy2: heytingAlgebraProxy2,
    ringProxy2: ringProxy2,
    semigroupProxy2: semigroupProxy2,
    semiringProxy2: semiringProxy2,
    showProxy2: showProxy2,
    eqProxy3: eqProxy3,
    ordProxy3: ordProxy3,
    booleanAlgebraProxy3: booleanAlgebraProxy3,
    boundedProxy3: boundedProxy3,
    commutativeRingProxy3: commutativeRingProxy3,
    discardProxy3: discardProxy3,
    heytingAlgebraProxy3: heytingAlgebraProxy3,
    ringProxy3: ringProxy3,
    semigroupProxy3: semigroupProxy3,
    semiringProxy3: semiringProxy3,
    showProxy3: showProxy3
};

},{"../Control.Applicative":35,"../Control.Apply":37,"../Control.Bind":41,"../Control.Monad":58,"../Data.BooleanAlgebra":78,"../Data.Bounded":80,"../Data.CommutativeRing":81,"../Data.Eq":86,"../Data.Functor":98,"../Data.HeytingAlgebra":104,"../Data.Ord":122,"../Data.Ordering":123,"../Data.Ring":127,"../Data.Semigroup":130,"../Data.Semiring":132,"../Data.Show":134,"../Prelude":152}],162:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var Type_Data_Boolean = require("../Type.Data.Boolean");
var Type_Data_Symbol = require("../Type.Data.Symbol");
var Type_Equality = require("../Type.Equality");
var RProxy = (function () {
    function RProxy() {

    };
    RProxy.value = new RProxy();
    return RProxy;
})();
var RLProxy = (function () {
    function RLProxy() {

    };
    RLProxy.value = new RLProxy();
    return RLProxy;
})();
var RowLacking = {};
var RowLacks = {};
var RowToList = {};
var ListToRow = {};
var RowListRemove = {};
var RowListSet = {};
var RowListNub = {};
var RowListAppend = {};
var rowListSetImpl = function (dictTypeEquals) {
    return function (dictTypeEquals1) {
        return function (dictRowListRemove) {
            return RowListSet;
        };
    };
};
var rowListRemoveNil = RowListRemove;
var rowListRemoveCons = function (dictRowListRemove) {
    return function (dictEquals) {
        return function (dictIf) {
            return RowListRemove;
        };
    };
};
var rowListNubNil = RowListNub;
var rowListNubCons = function (dictTypeEquals) {
    return function (dictTypeEquals1) {
        return function (dictTypeEquals2) {
            return function (dictRowListRemove) {
                return function (dictRowListNub) {
                    return RowListNub;
                };
            };
        };
    };
};
var rowListAppendNil = function (dictTypeEquals) {
    return RowListAppend;
};
var rowListAppendCons = function (dictRowListAppend) {
    return function (dictTypeEquals) {
        return RowListAppend;
    };
};
var rowLacks = function (dictRowCons) {
    return function (dictUnion) {
        return function (dictRowCons1) {
            return function (dictRowLacking) {
                return RowLacks;
            };
        };
    };
};
var rowLacking = RowLacking;
var listToRowNil = ListToRow;
var listToRowCons = function (dictListToRow) {
    return function (dictRowCons) {
        return ListToRow;
    };
};
module.exports = {
    RProxy: RProxy,
    RowLacks: RowLacks,
    RowLacking: RowLacking,
    RLProxy: RLProxy,
    RowToList: RowToList,
    ListToRow: ListToRow,
    RowListRemove: RowListRemove,
    RowListSet: RowListSet,
    RowListNub: RowListNub,
    RowListAppend: RowListAppend,
    rowLacking: rowLacking,
    rowLacks: rowLacks,
    listToRowNil: listToRowNil,
    listToRowCons: listToRowCons,
    rowListRemoveNil: rowListRemoveNil,
    rowListRemoveCons: rowListRemoveCons,
    rowListSetImpl: rowListSetImpl,
    rowListNubNil: rowListNubNil,
    rowListNubCons: rowListNubCons,
    rowListAppendNil: rowListAppendNil,
    rowListAppendCons: rowListAppendCons
};

},{"../Type.Data.Boolean":157,"../Type.Data.Symbol":159,"../Type.Equality":160}],163:[function(require,module,exports){
"use strict";

// module Unsafe.Coerce

exports.unsafeCoerce = function (x) {
  return x;
};

},{}],164:[function(require,module,exports){
// Generated by purs version 0.11.7
"use strict";
var $foreign = require("./foreign");
module.exports = {
    unsafeCoerce: $foreign.unsafeCoerce
};

},{"./foreign":163}],165:[function(require,module,exports){
require('Main').main();

},{"Main":147}],166:[function(require,module,exports){
arguments[4][1][0].apply(exports,arguments)
},{"./":171,"@funkia/jabz":186,"dup":1,"tslib":202}],167:[function(require,module,exports){
arguments[4][2][0].apply(exports,arguments)
},{"./common":168,"./future":170,"./linkedlist":172,"@funkia/jabz":186,"dup":2,"tslib":202}],168:[function(require,module,exports){
arguments[4][3][0].apply(exports,arguments)
},{"dup":3}],169:[function(require,module,exports){
arguments[4][4][0].apply(exports,arguments)
},{"./behavior":167,"./stream":175,"dup":4,"tslib":202}],170:[function(require,module,exports){
arguments[4][5][0].apply(exports,arguments)
},{"./common":168,"./linkedlist":172,"@funkia/jabz":186,"dup":5,"tslib":202}],171:[function(require,module,exports){
arguments[4][6][0].apply(exports,arguments)
},{"./animation":166,"./behavior":167,"./common":168,"./dom":169,"./future":170,"./now":173,"./placeholder":174,"./stream":175,"./test":176,"./time":177,"dup":6,"tslib":202}],172:[function(require,module,exports){
arguments[4][7][0].apply(exports,arguments)
},{"dup":7}],173:[function(require,module,exports){
arguments[4][8][0].apply(exports,arguments)
},{"./behavior":167,"./future":170,"./placeholder":174,"./stream":175,"@funkia/jabz":186,"dup":8,"tslib":202}],174:[function(require,module,exports){
arguments[4][9][0].apply(exports,arguments)
},{"./behavior":167,"./stream":175,"dup":9,"tslib":202}],175:[function(require,module,exports){
arguments[4][10][0].apply(exports,arguments)
},{"./behavior":167,"./common":168,"./linkedlist":172,"dup":10,"tslib":202}],176:[function(require,module,exports){
arguments[4][11][0].apply(exports,arguments)
},{"./stream":175,"dup":11,"tslib":202}],177:[function(require,module,exports){
arguments[4][12][0].apply(exports,arguments)
},{"./behavior":167,"./linkedlist":172,"./stream":175,"dup":12,"tslib":202}],178:[function(require,module,exports){
arguments[4][13][0].apply(exports,arguments)
},{"./functor":184,"./utils":195,"dup":13,"tslib":202}],179:[function(require,module,exports){
arguments[4][14][0].apply(exports,arguments)
},{"./applicative":178,"./monad":190,"./traversable":194,"dup":14,"tslib":202}],180:[function(require,module,exports){
arguments[4][15][0].apply(exports,arguments)
},{"./applicative":178,"./monoids/endo":192,"dup":15,"tslib":202}],181:[function(require,module,exports){
arguments[4][16][0].apply(exports,arguments)
},{"dup":16,"tslib":202}],182:[function(require,module,exports){
arguments[4][17][0].apply(exports,arguments)
},{"./applicative":178,"./either":181,"./maybe":189,"./utils":195,"dup":17}],183:[function(require,module,exports){
arguments[4][18][0].apply(exports,arguments)
},{"./monad":190,"dup":18,"tslib":202}],184:[function(require,module,exports){
arguments[4][19][0].apply(exports,arguments)
},{"./utils":195,"dup":19}],185:[function(require,module,exports){
arguments[4][20][0].apply(exports,arguments)
},{"./monad":190,"dup":20,"tslib":202}],186:[function(require,module,exports){
arguments[4][21][0].apply(exports,arguments)
},{"./applicative":178,"./conslist":179,"./either":181,"./foldable":182,"./functor":184,"./infinitelist":187,"./io":188,"./maybe":189,"./monad":190,"./monoid":191,"./semigroup":193,"./traversable":194,"./writer":196,"dup":21,"tslib":202}],187:[function(require,module,exports){
arguments[4][22][0].apply(exports,arguments)
},{"./either":181,"./utils":195,"dup":22}],188:[function(require,module,exports){
arguments[4][23][0].apply(exports,arguments)
},{"./freer":183,"./utils":195,"dup":23}],189:[function(require,module,exports){
arguments[4][24][0].apply(exports,arguments)
},{"./foldable":182,"./utils":195,"dup":24,"tslib":202}],190:[function(require,module,exports){
arguments[4][25][0].apply(exports,arguments)
},{"./utils":195,"dup":25}],191:[function(require,module,exports){
arguments[4][26][0].apply(exports,arguments)
},{"./semigroup":193,"dup":26}],192:[function(require,module,exports){
arguments[4][27][0].apply(exports,arguments)
},{"../utils":195,"dup":27}],193:[function(require,module,exports){
arguments[4][28][0].apply(exports,arguments)
},{"./utils":195,"dup":28}],194:[function(require,module,exports){
arguments[4][29][0].apply(exports,arguments)
},{"./applicative":178,"./const":180,"./foldable":182,"./identity":185,"./monoids/endo":192,"./utils":195,"dup":29,"tslib":202}],195:[function(require,module,exports){
arguments[4][30][0].apply(exports,arguments)
},{"dup":30}],196:[function(require,module,exports){
arguments[4][31][0].apply(exports,arguments)
},{"./monad":190,"./monoid":191,"dup":31,"tslib":202}],197:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var jabz_1 = require("@funkia/jabz");
var hareactive_1 = require("@funkia/hareactive");
var utils_1 = require("./utils");
var supportsProxy = "Proxy" in window;
function isShowable(s) {
    return typeof s === "string" || typeof s === "number";
}
function isGeneratorFunction(fn) {
    return (fn !== undefined &&
        fn.constructor !== undefined &&
        fn.constructor.name === "GeneratorFunction");
}
exports.isGeneratorFunction = isGeneratorFunction;
/**
 * A component is a function from a parent DOM node to a now
 * computation I.e. something like `type Component<A> = (p: Node) =>
 * Now<A>`. We don't define it as a type alias because we want to
 * make it a monad in different way than Now.
 */
var Component = /** @class */ (function () {
    function Component() {
        this.multi = false;
    }
    Component.of = function (b) {
        return new OfComponent(b);
    };
    Component.prototype.of = function (b) {
        return new OfComponent(b);
    };
    Component.prototype.chain = function (f) {
        return new ChainComponent(this, f);
    };
    Component.prototype.output = function (handler) {
        if (typeof handler === "function") {
            return new HandleOutput(function (e, o) { return utils_1.mergeObj(e, handler(o)); }, this);
        }
        else {
            return new HandleOutput(function (e, o) { return utils_1.mergeObj(e, utils_1.copyRemaps(handler, o)); }, this);
        }
        // return new OutputComponent(remaps, this);
    };
    // explicitOutput: string[] | undefined;
    Component.multi = false;
    Component = __decorate([
        jabz_1.monad
    ], Component);
    return Component;
}());
exports.Component = Component;
var OfComponent = /** @class */ (function (_super) {
    __extends(OfComponent, _super);
    function OfComponent(value) {
        var _this = _super.call(this) || this;
        _this.value = value;
        return _this;
    }
    OfComponent.prototype.run = function (_1, _2) {
        return { explicit: {}, output: this.value };
    };
    return OfComponent;
}(Component));
var OutputComponent = /** @class */ (function (_super) {
    __extends(OutputComponent, _super);
    function OutputComponent(remaps, comp) {
        var _this = _super.call(this) || this;
        _this.remaps = remaps;
        _this.comp = comp;
        return _this;
        // this.explicitOutput = Object.keys(remaps);
    }
    OutputComponent.prototype.run = function (parent, destroyed) {
        var _a = this.comp.run(parent, destroyed), explicit = _a.explicit, output = _a.output;
        var newExplicit = utils_1.copyRemaps(this.remaps, output);
        var finalExplicit = utils_1.mergeObj(output, newExplicit);
        return { explicit: newExplicit, output: output };
    };
    return OutputComponent;
}(Component));
var HandleOutput = /** @class */ (function (_super) {
    __extends(HandleOutput, _super);
    function HandleOutput(handler, c) {
        var _this = _super.call(this) || this;
        _this.handler = handler;
        _this.c = c;
        return _this;
    }
    HandleOutput.prototype.run = function (parent, destroyed) {
        var _a = this.c.run(parent, destroyed), explicit = _a.explicit, output = _a.output;
        var newExplicit = this.handler(explicit, output);
        return { explicit: newExplicit, output: output };
    };
    return HandleOutput;
}(Component));
function output(remaps, component) {
    return component.output(remaps);
}
exports.output = output;
/**
 * An empty component that adds no elements to the DOM and produces an
 * empty object as output.
 */
exports.emptyComponent = Component.of({});
var ChainComponent = /** @class */ (function (_super) {
    __extends(ChainComponent, _super);
    function ChainComponent(component, f) {
        var _this = _super.call(this) || this;
        _this.component = component;
        _this.f = f;
        return _this;
    }
    ChainComponent.prototype.run = function (parent, destroyed) {
        var _a = this.component.run(parent, destroyed), explicit = _a.explicit, outputFirst = _a.output;
        var _b = this.f(outputFirst).run(parent, destroyed), _discarded = _b.explicit, output = _b.output;
        return { explicit: explicit, output: output };
    };
    return ChainComponent;
}(Component));
/**
 * Run component and the now-computation inside.
 * @param parent A selector string or a DOM node under which the
 * component will be created
 * @param component The component to run
 */
function runComponent(parent, component, destroy) {
    if (destroy === void 0) { destroy = hareactive_1.sinkFuture(); }
    if (typeof parent === "string") {
        parent = document.querySelector(parent);
    }
    return toComponent(component).run(parent, destroy).output;
}
exports.runComponent = runComponent;
function testComponent(c) {
    var dom = document.createElement("div");
    var destroyed = hareactive_1.sinkFuture();
    var _a = c.run(dom, destroyed), out = _a.output, explicit = _a.explicit;
    var destroy = destroyed.resolve.bind(destroyed);
    return { out: out, dom: dom, destroy: destroy, explicit: explicit };
}
exports.testComponent = testComponent;
function isComponent(c) {
    return c instanceof Component;
}
exports.isComponent = isComponent;
var placeholderProxyHandler = {
    get: function (target, name) {
        if (!(name in target)) {
            target[name] = hareactive_1.placeholder();
        }
        return target[name];
    }
};
var LoopComponent = /** @class */ (function (_super) {
    __extends(LoopComponent, _super);
    function LoopComponent(f, placeholderNames) {
        var _this = _super.call(this) || this;
        _this.f = f;
        _this.placeholderNames = placeholderNames;
        return _this;
    }
    LoopComponent.prototype.run = function (parent, destroyed) {
        var placeholderObject = { destroyed: destroyed };
        if (supportsProxy) {
            placeholderObject = new Proxy(placeholderObject, placeholderProxyHandler);
        }
        else {
            if (this.placeholderNames !== undefined) {
                for (var _i = 0, _a = this.placeholderNames; _i < _a.length; _i++) {
                    var name_1 = _a[_i];
                    placeholderObject[name_1] = hareactive_1.placeholder();
                }
            }
        }
        var _b = toComponent(this.f(placeholderObject)).run(parent, destroyed), explicit = _b.explicit, output = _b.output;
        var returned = Object.keys(output);
        for (var _c = 0, returned_1 = returned; _c < returned_1.length; _c++) {
            var name_2 = returned_1[_c];
            placeholderObject[name_2].replaceWith(output[name_2]);
        }
        return { explicit: explicit, output: output };
    };
    return LoopComponent;
}(Component));
function loop(f, placeholderNames) {
    var f2 = isGeneratorFunction(f) ? jabz_1.fgo(f) : f;
    return new LoopComponent(f2, placeholderNames);
}
exports.loop = loop;
var MergeComponent = /** @class */ (function (_super) {
    __extends(MergeComponent, _super);
    function MergeComponent(c1, c2) {
        var _this = _super.call(this) || this;
        _this.c1 = c1;
        _this.c2 = c2;
        return _this;
    }
    MergeComponent.prototype.run = function (parent, destroyed) {
        var explicit1 = this.c1.run(parent, destroyed).explicit;
        var _a = this.c2.run(parent, destroyed), explicit2 = _a.explicit, output = _a.output;
        return { explicit: Object.assign({}, explicit1, explicit2), output: output };
    };
    return MergeComponent;
}(Component));
/**
 * Merges two components. Their explicit output is combined.
 */
function merge(c1, c2) {
    return new MergeComponent(c1, c2);
}
exports.merge = merge;
function addErrorHandler(modelName, viewName, obj) {
    if (modelName === "") {
        modelName = "anonymous";
    }
    if (viewName === "") {
        viewName = "anonymous";
    }
    if (!supportsProxy) {
        return obj;
    }
    return new Proxy(obj, {
        get: function (object, prop) {
            if (prop in obj) {
                return object[prop];
            }
            throw new Error("The model, " + modelName + ", expected a property \"" + prop + "\" but the view, " + viewName + ", returned an object without the property.");
        }
    });
}
var ModelViewComponent = /** @class */ (function (_super) {
    __extends(ModelViewComponent, _super);
    function ModelViewComponent(args, model, view, placeholderNames) {
        var _this = _super.call(this) || this;
        _this.args = args;
        _this.model = model;
        _this.view = view;
        _this.placeholderNames = placeholderNames;
        return _this;
    }
    ModelViewComponent.prototype.run = function (parent, destroyed) {
        var _a = this, view = _a.view, model = _a.model, args = _a.args;
        var placeholders;
        if (supportsProxy) {
            placeholders = new Proxy({}, placeholderProxyHandler);
        }
        else {
            placeholders = {};
            if (this.placeholderNames !== undefined) {
                for (var _i = 0, _b = this.placeholderNames; _i < _b.length; _i++) {
                    var name_3 = _b[_i];
                    placeholders[name_3] = hareactive_1.placeholder();
                }
            }
        }
        var viewOutput = view.apply(void 0, [placeholders].concat(args)).run(parent, destroyed).output;
        var helpfulViewOutput = addErrorHandler(model.name, view.name, Object.assign(viewOutput, { destroyed: destroyed }));
        var behaviors = model.apply(void 0, [helpfulViewOutput].concat(args)).run();
        // Tie the recursive knot
        for (var _c = 0, _d = Object.keys(behaviors); _c < _d.length; _c++) {
            var name_4 = _d[_c];
            placeholders[name_4].replaceWith(behaviors[name_4]);
        }
        return { explicit: {}, output: behaviors };
    };
    return ModelViewComponent;
}(Component));
function modelView(model, view, toViewReactiveNames) {
    var m = isGeneratorFunction(model) ? jabz_1.fgo(model) : model;
    var v = isGeneratorFunction(view)
        ? jabz_1.fgo(view)
        : function () {
            var as = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                as[_i] = arguments[_i];
            }
            return toComponent(view.apply(void 0, as));
        };
    return function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return new ModelViewComponent(args, m, v, toViewReactiveNames);
    };
}
exports.modelView = modelView;
function viewObserve(update, behavior) {
    var isPulling = false;
    hareactive_1.observe(update, function () {
        isPulling = true;
        var lastVal;
        function pull() {
            var newVal = behavior.pull();
            if (lastVal !== newVal) {
                lastVal = newVal;
                update(newVal);
            }
            if (isPulling) {
                requestAnimationFrame(pull);
            }
        }
        pull();
    }, function () {
        isPulling = false;
    }, behavior);
}
exports.viewObserve = viewObserve;
function isChild(a) {
    return (isComponent(a) ||
        isGeneratorFunction(a) ||
        hareactive_1.isBehavior(a) ||
        isShowable(a) ||
        Array.isArray(a));
}
exports.isChild = isChild;
var TextComponent = /** @class */ (function (_super) {
    __extends(TextComponent, _super);
    function TextComponent(t) {
        var _this = _super.call(this) || this;
        _this.t = t;
        return _this;
    }
    TextComponent.prototype.run = function (parent, destroyed) {
        var node = document.createTextNode(this.t.toString());
        parent.appendChild(node);
        destroyed.subscribe(function (toplevel) {
            if (toplevel) {
                parent.removeChild(node);
            }
        });
        return { explicit: {}, output: {} };
    };
    return TextComponent;
}(Component));
function text(showable) {
    return new TextComponent(showable);
}
exports.text = text;
var ListComponent = /** @class */ (function (_super) {
    __extends(ListComponent, _super);
    function ListComponent(children) {
        var _this = _super.call(this) || this;
        _this.components = [];
        for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
            var child = children_1[_i];
            var component = toComponent(child);
            _this.components.push(component);
        }
        return _this;
    }
    ListComponent.prototype.run = function (parent, destroyed) {
        var output = {};
        for (var i = 0; i < this.components.length; ++i) {
            var component = this.components[i];
            var explicit = component.run(parent, destroyed).explicit;
            Object.assign(output, explicit);
        }
        return { explicit: output, output: output };
    };
    return ListComponent;
}(Component));
function toComponent(child) {
    if (isComponent(child)) {
        return child;
    }
    else if (hareactive_1.isBehavior(child)) {
        return dynamic(child).mapTo({});
    }
    else if (isGeneratorFunction(child)) {
        return jabz_1.go(child);
    }
    else if (isShowable(child)) {
        return text(child);
    }
    else if (Array.isArray(child)) {
        return new ListComponent(child);
    }
    else {
        throw "Child could not be converted to component";
    }
}
exports.toComponent = toComponent;
var FixedDomPosition = /** @class */ (function () {
    function FixedDomPosition(parent, destroy) {
        var _this = this;
        this.parent = parent;
        this.end = document.createComment("Fixed point");
        parent.appendChild(this.end);
        destroy.subscribe(function () { return parent.removeChild(_this.end); });
    }
    FixedDomPosition.prototype.appendChild = function (child) {
        this.parent.insertBefore(child, this.end);
    };
    FixedDomPosition.prototype.insertBefore = function (e, a) {
        this.parent.insertBefore(e, a);
    };
    FixedDomPosition.prototype.removeChild = function (c) {
        this.parent.removeChild(c);
    };
    return FixedDomPosition;
}());
var DynamicComponent = /** @class */ (function (_super) {
    __extends(DynamicComponent, _super);
    function DynamicComponent(behavior) {
        var _this = _super.call(this) || this;
        _this.behavior = behavior;
        return _this;
    }
    DynamicComponent.prototype.run = function (parent, dynamicDestroyed) {
        var destroyPrevious;
        var parentWrap = new FixedDomPosition(parent, dynamicDestroyed);
        var output = this.behavior.map(function (child) {
            if (destroyPrevious !== undefined) {
                destroyPrevious.resolve(true);
            }
            destroyPrevious = hareactive_1.sinkFuture();
            var result = toComponent(child).run(parentWrap, destroyPrevious.combine(dynamicDestroyed));
            return result.explicit;
        });
        // To activate behavior
        viewObserve(function (v) { }, output);
        return { explicit: {}, output: output };
    };
    return DynamicComponent;
}(Component));
function dynamic(behavior) {
    return new DynamicComponent(behavior);
}
exports.dynamic = dynamic;
var DomRecorder = /** @class */ (function () {
    function DomRecorder(parent) {
        this.parent = parent;
        this.elms = [];
    }
    DomRecorder.prototype.appendChild = function (child) {
        this.parent.appendChild(child);
        this.elms.push(child);
    };
    DomRecorder.prototype.insertBefore = function (a, b) {
        this.parent.insertBefore(a, b);
        var index = this.elms.indexOf(b);
        this.elms.splice(index, 0, a);
    };
    DomRecorder.prototype.removeChild = function (c) {
        this.parent.removeChild(c);
        var index = this.elms.indexOf(c);
        this.elms.splice(index, 1);
    };
    return DomRecorder;
}());
var ComponentList = /** @class */ (function (_super) {
    __extends(ComponentList, _super);
    function ComponentList(compFn, listB, getKey) {
        var _this = _super.call(this) || this;
        _this.compFn = compFn;
        _this.listB = listB;
        _this.getKey = getKey;
        return _this;
    }
    ComponentList.prototype.run = function (parent, listDestroyed) {
        var _this = this;
        // The reordering code below is neither pretty nor fast. But it at
        // least avoids recreating elements and is quite simple.
        var resultB = hareactive_1.sinkBehavior([]);
        var keyToElm = {};
        var parentWrap = new FixedDomPosition(parent, listDestroyed);
        this.listB.subscribe(function (newAs) {
            var newKeyToElm = {};
            var newArray = [];
            // Re-add existing elements and new elements
            for (var i = 0; i < newAs.length; i++) {
                var a = newAs[i];
                var key = _this.getKey(a, i);
                var stuff = keyToElm[key];
                if (stuff === undefined) {
                    var destroy = hareactive_1.sinkFuture();
                    var recorder = new DomRecorder(parentWrap);
                    var out = runComponent(recorder, _this.compFn(a), destroy.combine(listDestroyed));
                    stuff = { elms: recorder.elms, out: out, destroy: destroy };
                }
                else {
                    for (var _i = 0, _a = stuff.elms; _i < _a.length; _i++) {
                        var elm = _a[_i];
                        parentWrap.appendChild(elm);
                    }
                }
                newArray.push(stuff.out);
                newKeyToElm[key] = stuff;
            }
            // Remove elements that are no longer present
            var oldKeys = Object.keys(keyToElm);
            for (var _b = 0, oldKeys_1 = oldKeys; _b < oldKeys_1.length; _b++) {
                var key = oldKeys_1[_b];
                if (newKeyToElm[key] === undefined) {
                    keyToElm[key].destroy.resolve(true);
                }
            }
            keyToElm = newKeyToElm;
            resultB.push(newArray);
        });
        return { explicit: {}, output: resultB };
    };
    return ComponentList;
}(Component));
function list(componentCreator, listB, getKey) {
    if (getKey === void 0) { getKey = utils_1.id; }
    return new ComponentList(componentCreator, listB, getKey);
}
exports.list = list;

},{"./utils":201,"@funkia/hareactive":171,"@funkia/jabz":186}],198:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var hareactive_1 = require("@funkia/hareactive");
var component_1 = require("./component");
var utils_1 = require("./utils");
function streamDescription(eventName, f) {
    return [eventName, f]; // The third value don't exist it's for type info only
}
exports.streamDescription = streamDescription;
function behaviorDescription(eventName, f, init) {
    return [eventName, f, init]; // The fourth value don't exist it's for type info only
}
exports.behaviorDescription = behaviorDescription;
// An array of names of all DOM events
exports.allDomEvents = Object.getOwnPropertyNames(Object.getPrototypeOf(Object.getPrototypeOf(document)))
    .filter(function (i) { return i.indexOf("on") === 0; })
    .map(function (name) { return name.slice(2); });
// Output streams that _all_ elements share
var defaultStreams = {};
for (var _i = 0, allDomEvents_1 = exports.allDomEvents; _i < allDomEvents_1.length; _i++) {
    var name_1 = allDomEvents_1[_i];
    defaultStreams[name_1] = streamDescription(name_1, utils_1.id);
}
var defaultProperties = {
    streams: defaultStreams
};
var attributeSetter = function (element) { return function (key, value) {
    if (value === true) {
        element.setAttribute(key, "");
    }
    else if (value === false) {
        element.removeAttribute(key);
    }
    else {
        element.setAttribute(key, value.toString());
    }
}; };
var propertySetter = function (element) { return function (key, value) { return (element[key] = value); }; };
var classSetter = function (element) { return function (key, value) {
    return element.classList.toggle(key, value);
}; };
var styleSetter = function (element) { return function (key, value) {
    return (element.style[key] = value);
}; };
function handleObject(object, element, createSetter) {
    if (object !== undefined) {
        var setter_1 = createSetter(element);
        var _loop_1 = function (key) {
            var value = object[key];
            if (hareactive_1.isBehavior(value)) {
                component_1.viewObserve(function (newValue) { return setter_1(key, newValue); }, value);
            }
            else {
                setter_1(key, value);
            }
        };
        for (var _i = 0, _a = Object.keys(object); _i < _a.length; _i++) {
            var key = _a[_i];
            _loop_1(key);
        }
    }
}
function handleCustom(elm, isStreamActions, actionDefinitions, actions) {
    if (actions !== undefined) {
        var _loop_2 = function (name_2) {
            var actionTrigger = actions[name_2];
            var actionDefinition = actionDefinitions[name_2];
            if (isStreamActions) {
                actionTrigger.subscribe(function (value) { return actionDefinition(elm, value); });
            }
            else {
                component_1.viewObserve(function (value) { return actionDefinition(elm, value); }, actionTrigger);
            }
        };
        for (var _i = 0, _a = Object.keys(actions); _i < _a.length; _i++) {
            var name_2 = _a[_i];
            _loop_2(name_2);
        }
    }
}
function handleClass(desc, elm) {
    if (hareactive_1.isBehavior(desc)) {
        var previousClasses_1;
        component_1.viewObserve(function (value) {
            if (previousClasses_1 !== undefined) {
                (_a = elm.classList).remove.apply(_a, previousClasses_1);
            }
            previousClasses_1 = value.split(" ");
            (_b = elm.classList).add.apply(_b, previousClasses_1);
            var _a, _b;
        }, desc);
    }
    else if (Array.isArray(desc)) {
        for (var _i = 0, desc_1 = desc; _i < desc_1.length; _i++) {
            var d = desc_1[_i];
            handleClass(d, elm);
        }
    }
    else if (typeof desc === "string") {
        var classes = desc.split(" ");
        (_a = elm.classList).add.apply(_a, classes);
    }
    else {
        handleObject(desc, elm, classSetter);
    }
    var _a;
}
function handleEntryClass(desc, elm) {
    var classes = desc.split(" ");
    (_a = elm.classList).add.apply(_a, classes);
    // Wait two frames so that we get one frame with the class
    requestAnimationFrame(function () {
        requestAnimationFrame(function () {
            (_a = elm.classList).remove.apply(_a, classes);
            var _a;
        });
    });
    var _a;
}
function handleProps(props, elm) {
    var output = {};
    handleObject(props.style, elm, styleSetter);
    handleObject(props.attrs, elm, attributeSetter);
    handleObject(props.props, elm, propertySetter);
    if (props.class !== undefined) {
        handleClass(props.class, elm);
    }
    if (props.entry !== undefined) {
        if (props.entry.class !== undefined) {
            handleEntryClass(props.entry.class, elm);
        }
    }
    if (props.actionDefinitions !== undefined) {
        handleCustom(elm, true, props.actionDefinitions, props.actions);
        handleCustom(elm, false, props.actionDefinitions, props.setters);
    }
    if (props.behaviors !== undefined) {
        var _loop_3 = function (name_3) {
            var _a = props.behaviors[name_3], evt = _a[0], extractor = _a[1], initialFn = _a[2];
            var a = undefined;
            var initial = initialFn(elm);
            Object.defineProperty(output, name_3, {
                enumerable: true,
                get: function () {
                    if (a === undefined) {
                        a = hareactive_1.behaviorFromEvent(elm, evt, initial, extractor);
                    }
                    return a;
                }
            });
        };
        for (var _i = 0, _a = Object.keys(props.behaviors); _i < _a.length; _i++) {
            var name_3 = _a[_i];
            _loop_3(name_3);
        }
    }
    if (props.streams !== undefined) {
        var _loop_4 = function (name_4) {
            var _a = props.streams[name_4], evt = _a[0], extractor = _a[1];
            var a = undefined;
            if (output[name_4] === undefined) {
                Object.defineProperty(output, name_4, {
                    enumerable: true,
                    get: function () {
                        if (a === undefined) {
                            a = hareactive_1.streamFromEvent(elm, evt, extractor);
                        }
                        return a;
                    }
                });
            }
        };
        for (var _b = 0, _c = Object.keys(props.streams); _b < _c.length; _b++) {
            var name_4 = _c[_b];
            _loop_4(name_4);
        }
    }
    if (props.output !== undefined) {
        for (var _d = 0, _e = Object.keys(props.output); _d < _e.length; _d++) {
            var name_5 = _e[_d];
            if (output[name_5] === undefined) {
                output[name_5] = output[props.output[name_5]];
            }
        }
    }
    return output;
}
exports.handleProps = handleProps;
var DomComponent = /** @class */ (function (_super) {
    __extends(DomComponent, _super);
    function DomComponent(tagName, props, child) {
        var _this = _super.call(this) || this;
        _this.tagName = tagName;
        _this.props = props;
        _this.child = child;
        if (child !== undefined) {
            _this.child = component_1.toComponent(child);
        }
        return _this;
    }
    DomComponent.prototype.run = function (parent, destroyed) {
        var elm = document.createElement(this.tagName);
        var output = handleProps(this.props, elm);
        var explicitOutput = this.props.output
            ? Object.keys(this.props.output)
            : [];
        var explicit = {};
        for (var _i = 0, explicitOutput_1 = explicitOutput; _i < explicitOutput_1.length; _i++) {
            var name_6 = explicitOutput_1[_i];
            explicit[name_6] = output[name_6];
        }
        parent.appendChild(elm);
        if (this.child !== undefined) {
            var childResult = this.child.run(elm, destroyed.mapTo(false));
            Object.assign(explicit, childResult.explicit);
            Object.assign(output, childResult.explicit);
        }
        destroyed.subscribe(function (toplevel) {
            if (toplevel) {
                parent.removeChild(elm);
            }
            // TODO: cleanup listeners
        });
        return { explicit: explicit, output: output };
    };
    return DomComponent;
}(component_1.Component));
function parseCSSTagname(cssTagName) {
    var parsedTag = cssTagName.split(/(?=\.)|(?=#)|(?=\[)/);
    var result = {};
    for (var i = 1; i < parsedTag.length; i++) {
        var token = parsedTag[i];
        switch (token[0]) {
            case "#":
                result.props = result.props || {};
                result.props.id = token.slice(1);
                break;
            case ".":
                result.class = result.class || {};
                result.class[token.slice(1)] = true;
                break;
            case "[":
                result.attrs = result.attrs || {};
                var attr = token.slice(1, -1).split("=");
                result.attrs[attr[0]] = attr[1] || "";
                break;
            default:
                throw new Error("Unknown symbol");
        }
    }
    return [parsedTag[0], result];
}
function element(tagName, props) {
    var _a = parseCSSTagname(tagName), parsedTagName = _a[0], tagProps = _a[1];
    var mergedProps = utils_1.mergeDeep(props, utils_1.mergeDeep(defaultProperties, tagProps));
    function createElement(newPropsOrChildren, childOrUndefined) {
        var finalProps = newPropsOrChildren !== undefined && !component_1.isChild(newPropsOrChildren)
            ? utils_1.mergeDeep(mergedProps, newPropsOrChildren)
            : mergedProps;
        var child = childOrUndefined !== undefined
            ? component_1.toComponent(childOrUndefined)
            : component_1.isChild(newPropsOrChildren)
                ? component_1.toComponent(newPropsOrChildren)
                : undefined;
        return new DomComponent(parsedTagName, finalProps, child);
    }
    return createElement;
}
exports.element = element;

},{"./component":197,"./utils":201,"@funkia/hareactive":171}],199:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dom_builder_1 = require("./dom-builder");
exports.input = dom_builder_1.element("input", {
    actionDefinitions: {
        focus: function (elm) { return elm.focus(); }
    },
    behaviors: {
        inputValue: dom_builder_1.behaviorDescription("input", function (evt) { return evt.target.value; }, function (elm) { return elm.value; })
    }
});
function getTargetChecked(event) {
    return event.target.checked;
}
exports.checkbox = dom_builder_1.element("input[type=checkbox]", {
    behaviors: {
        checked: dom_builder_1.behaviorDescription("change", getTargetChecked, function (elm) { return elm.checked; })
    },
    streams: {
        checkedChange: dom_builder_1.streamDescription("change", getTargetChecked)
    }
});
exports.address = dom_builder_1.element("address");
exports.article = dom_builder_1.element("article");
exports.aside = dom_builder_1.element("aside");
exports.footer = dom_builder_1.element("footer");
exports.header = dom_builder_1.element("header");
exports.h1 = dom_builder_1.element("h1");
exports.h2 = dom_builder_1.element("h2");
exports.h3 = dom_builder_1.element("h3");
exports.h4 = dom_builder_1.element("h4");
exports.h5 = dom_builder_1.element("h5");
exports.h6 = dom_builder_1.element("h6");
exports.hgroup = dom_builder_1.element("hgroup");
exports.nav = dom_builder_1.element("nav");
exports.section = dom_builder_1.element("section");
exports.blockquote = dom_builder_1.element("blockquote");
exports.dd = dom_builder_1.element("dd");
exports.div = dom_builder_1.element("div");
exports.dl = dom_builder_1.element("dl");
exports.dt = dom_builder_1.element("dt");
exports.figcaption = dom_builder_1.element("figcaption");
exports.figure = dom_builder_1.element("figure");
exports.hr = dom_builder_1.element("hr");
exports.li = dom_builder_1.element("li");
exports.main = dom_builder_1.element("main");
exports.ol = dom_builder_1.element("ol");
exports.p = dom_builder_1.element("p");
exports.pre = dom_builder_1.element("pre");
exports.ul = dom_builder_1.element("ul");
exports.a = dom_builder_1.element("a");
exports.abbr = dom_builder_1.element("abbr");
exports.b = dom_builder_1.element("b");
exports.bdi = dom_builder_1.element("bdi");
exports.bdo = dom_builder_1.element("bdo");
exports.br = dom_builder_1.element("br")();
exports.cite = dom_builder_1.element("cite");
exports.code = dom_builder_1.element("code");
exports.data = dom_builder_1.element("data");
exports.dfn = dom_builder_1.element("dfn");
exports.em = dom_builder_1.element("em");
exports.i = dom_builder_1.element("i");
exports.kbd = dom_builder_1.element("kbd");
exports.mark = dom_builder_1.element("mark");
exports.q = dom_builder_1.element("q");
exports.rp = dom_builder_1.element("rp");
exports.rt = dom_builder_1.element("rt");
exports.rtc = dom_builder_1.element("rtc");
exports.ruby = dom_builder_1.element("ruby");
exports.s = dom_builder_1.element("s");
exports.samp = dom_builder_1.element("samp");
exports.small = dom_builder_1.element("small");
exports.span = dom_builder_1.element("span");
exports.strong = dom_builder_1.element("strong");
exports.sub = dom_builder_1.element("sub");
exports.sup = dom_builder_1.element("sup");
exports.time = dom_builder_1.element("time");
exports.u = dom_builder_1.element("u");
exports.varElement = dom_builder_1.element("var");
exports.wbr = dom_builder_1.element("wbr");
exports.area = dom_builder_1.element("area");
exports.audio = dom_builder_1.element("audio");
exports.img = dom_builder_1.element("img");
exports.map = dom_builder_1.element("map");
exports.track = dom_builder_1.element("track");
exports.video = dom_builder_1.element("video");
exports.embed = dom_builder_1.element("embed");
exports.object = dom_builder_1.element("object");
exports.param = dom_builder_1.element("param");
exports.picture = dom_builder_1.element("picture");
exports.source = dom_builder_1.element("source");
exports.canvas = dom_builder_1.element("canvas");
exports.script = dom_builder_1.element("script");
exports.del = dom_builder_1.element("del");
exports.ins = dom_builder_1.element("ins");
exports.caption = dom_builder_1.element("caption");
exports.col = dom_builder_1.element("col");
exports.colgroup = dom_builder_1.element("colgroup");
exports.table = dom_builder_1.element("table");
exports.tbody = dom_builder_1.element("tbody");
exports.td = dom_builder_1.element("td");
exports.tfoot = dom_builder_1.element("tfoot");
exports.th = dom_builder_1.element("th");
exports.thead = dom_builder_1.element("thead");
exports.tr = dom_builder_1.element("tr");
exports.button = dom_builder_1.element("button");
exports.datalist = dom_builder_1.element("datalist");
exports.fieldset = dom_builder_1.element("fieldset");
exports.form = dom_builder_1.element("form");
exports.label = dom_builder_1.element("label");
exports.legend = dom_builder_1.element("legend");
exports.meter = dom_builder_1.element("meter");
exports.optgroup = dom_builder_1.element("optgroup");
exports.option = dom_builder_1.element("option");
exports.output = dom_builder_1.element("output");
exports.progress = dom_builder_1.element("progress");
exports.select = dom_builder_1.element("select");
exports.textarea = dom_builder_1.element("textarea");
exports.details = dom_builder_1.element("details");
exports.menuitem = dom_builder_1.element("menuitem");
exports.summary = dom_builder_1.element("summary");
exports.slot = dom_builder_1.element("slot");
exports.template = dom_builder_1.element("template");
var component_1 = require("./component");
exports.text = component_1.text;

},{"./component":197,"./dom-builder":198}],200:[function(require,module,exports){
"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
var jabz_1 = require("@funkia/jabz");
exports.fgo = jabz_1.fgo;
exports.go = jabz_1.go;
__export(require("./component"));
__export(require("./dom-builder"));
var elements = require("./elements");
exports.elements = elements;

},{"./component":197,"./dom-builder":198,"./elements":199,"@funkia/jabz":186}],201:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var hareactive_1 = require("@funkia/hareactive");
function arrayConcat(arr1, arr2) {
    var result = [];
    for (var i = 0; i < arr1.length; ++i) {
        result.push(arr1[i]);
    }
    for (var i = 0; i < arr2.length; ++i) {
        result.push(arr2[i]);
    }
    return result;
}
function fst(a) {
    return a[0];
}
exports.fst = fst;
function snd(a) {
    return a[1];
}
exports.snd = snd;
function isObject(item) {
    return typeof item === "object" && !Array.isArray(item) && !hareactive_1.isBehavior(item);
}
function get(prop) {
    return function (obj) { return obj[prop]; };
}
exports.get = get;
function assign(a, b) {
    for (var _i = 0, _a = Object.keys(b); _i < _a.length; _i++) {
        var key = _a[_i];
        a[key] = b[key];
    }
    return a;
}
exports.assign = assign;
function mergeObj(a, b) {
    var c = {};
    for (var _i = 0, _a = Object.keys(a); _i < _a.length; _i++) {
        var key = _a[_i];
        c[key] = a[key];
    }
    for (var _b = 0, _c = Object.keys(b); _b < _c.length; _b++) {
        var key = _c[_b];
        c[key] = b[key];
    }
    return c;
}
exports.mergeObj = mergeObj;
function mergeDeep() {
    var objects = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        objects[_i] = arguments[_i];
    }
    // .length of function is 2
    var result = {};
    for (var _a = 0, objects_1 = objects; _a < objects_1.length; _a++) {
        var source = objects_1[_a];
        if (isObject(source)) {
            var keys = Object.keys(source);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var nextItem = source[key];
                if (Array.isArray(source[key]) && Array.isArray(result[key])) {
                    result[key] = arrayConcat(result[key], source[key]);
                }
                else if (isObject(source[key])) {
                    var subKeys = Object.keys(source[key]);
                    result[key] = result[key] || {};
                    for (var j = 0; j < subKeys.length; j++) {
                        var nextSubKey = subKeys[j];
                        result[key][nextSubKey] = nextItem[nextSubKey];
                    }
                }
                else {
                    result[key] = nextItem;
                }
            }
        }
    }
    return result;
}
exports.mergeDeep = mergeDeep;
function copyRemaps(remap, source) {
    var output = {};
    for (var key in remap) {
        output[key] = source[remap[key]];
    }
    return output;
}
exports.copyRemaps = copyRemaps;
function id(a) {
    return a;
}
exports.id = id;

},{"@funkia/hareactive":171}],202:[function(require,module,exports){
arguments[4][32][0].apply(exports,arguments)
},{"dup":32}]},{},[165]);
