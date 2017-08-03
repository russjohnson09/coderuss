"use strict";

var referee = require("referee");
var sinon = require("../../lib/sinon");
var sinonSandbox = require("../../lib/sinon/sandbox");
var configureLogError = require("../../lib/sinon/util/core/log_error.js");
var assert = referee.assert;
var refute = referee.refute;

describe("issues", function () {
    beforeEach(function () {
        this.sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        this.sandbox.restore();
    });

    it("#283", function () {
        function testSinonFakeTimersWith(interval, ticks) {
            var clock = sinon.useFakeTimers();

            var spy = sinon.spy();
            var id = setInterval(spy, interval);
            assert(!spy.calledOnce);
            clock.tick(ticks);
            assert(spy.callCount === Math.floor(ticks / interval));

            clearInterval(id);
            clock.restore();
        }

        testSinonFakeTimersWith(10, 101);
        testSinonFakeTimersWith(99, 101);
        testSinonFakeTimersWith(100, 200);
        testSinonFakeTimersWith(199, 200);
        testSinonFakeTimersWith(500, 1001);
        testSinonFakeTimersWith(1000, 1001);
    });

    describe("#458", function () {
        if (typeof require("fs").readFileSync !== "undefined") {
            describe("on node", function () {
                it("stub out fs.readFileSync", function () {
                    var fs = require("fs");
                    var testCase = this;

                    refute.exception(function () {
                        testCase.sandbox.stub(fs, "readFileSync");
                    });
                });
            });
        }
    });

    describe("#624", function () {
        // eslint-disable-next-line mocha/no-skipped-tests
        it.skip("useFakeTimers should be idempotent", function () {
            // Issue #624 shows that useFakeTimers is not idempotent when it comes to
            // using Date.now
            // This test verifies that it's working, at least for Date.now
            var clock;

            clock = sinon.useFakeTimers(new Date("2014-12-29").getTime());
            assert.equals(clock.now, Date.now());

            clock = sinon.useFakeTimers(new Date("2015-12-15").getTime());
            assert.equals(clock.now, Date.now());

            clock = sinon.useFakeTimers(new Date("2015-1-5").getTime());
            assert.equals(clock.now, Date.now());
        });
    });

    describe("#835", function () {
        it("logError() throws an exception if the passed err is read-only", function () {
            var logError = configureLogError({useImmediateExceptions: true});

            // passes
            var err = { name: "TestError", message: "this is a proper exception" };
            assert.exception(
                function () {
                    logError("#835 test", err);
                },
                {
                    name: err.name
                }
            );

            // fails until this issue is fixed
            assert.exception(
                function () {
                    logError("#835 test", "this literal string is not a proper exception");
                },
                {
                    name: "#835 test"
                }
            );
        });
    });

    describe("#852 - createStubInstance on intherited constructors", function () {
        it("must not throw error", function () {
            var A = function () {};
            var B = function () {};

            B.prototype = Object.create(A.prototype);
            B.prototype.constructor = A;

            refute.exception(function () {
                sinon.createStubInstance(B);
            });
        });
    });

    describe("#852(2) - createStubInstance should on same constructor", function () {
        it("must be idempotent", function () {
            var A = function () {};
            refute.exception(function () {
                sinon.createStubInstance(A);
                sinon.createStubInstance(A);
            });
        });
    });

    describe("#950 - first execution of a spy as a method renames that spy", function () {
        function bob() {}

        // IE 11 does not support the function name property
        if (bob.name) {
            it("should not rename spies", function () {
                var expectedName = "proxy";
                var spy = sinon.spy(bob);

                assert.equals(spy.name, expectedName);

                var obj = { methodName: spy };
                assert.equals(spy.name, expectedName);

                spy();
                assert.equals(spy.name, expectedName);

                obj.methodName.call(null);
                assert.equals(spy.name, expectedName);

                obj.methodName();
                assert.equals(spy.name, expectedName);

                obj.otherProp = spy;
                obj.otherProp();
                assert.equals(spy.name, expectedName);
            });
        }
    });

    describe("#1026", function () {
        it("should stub `watch` method on any Object", function () {
            // makes sure that Object.prototype.watch is set back to its old value
            function restore(oldWatch) {
                if (oldWatch) {
                    Object.prototype.watch = oldWatch;  // eslint-disable-line no-extend-native
                } else {
                    delete Object.prototype.watch;
                }
            }

            try { // eslint-disable-line no-restricted-syntax
                var oldWatch = Object.prototype.watch;

                if (typeof Object.prototype.watch !== "function") {
                    Object.prototype.watch = function rolex() {}; // eslint-disable-line no-extend-native
                }

                var stubbedObject = sinon.stub({
                    watch: function () {}
                });

                stubbedObject.watch();

                assert.isArray(stubbedObject.watch.args);
            } catch (error) {
                restore(oldWatch);
                throw error;
            }

            restore(oldWatch);
        });
    });

    describe("#1154", function () {
        it("Ensures different matchers will not be tested against each other", function () {
            var match = sinon.match;
            var stub = sinon.stub;
            var readFile = stub();

            function endsWith(str, suffix) {
                return str.indexOf(suffix) + suffix.length === str.length;
            }

            function suffixA(fileName) {
                return endsWith(fileName, "suffixa");
            }

            function suffixB(fileName) {
                return endsWith(fileName, "suffixb");
            }

            var argsA = match(suffixA);
            var argsB = match(suffixB);

            var firstFake = readFile
                .withArgs(argsA);

            var secondFake = readFile
                .withArgs(argsB);

            assert(firstFake !== secondFake);
        });
    });

    describe("#1372 - sandbox.resetHistory", function () {
        it("should reset spies", function () {
            var spy = this.sandbox.spy();

            spy();
            assert.equals(spy.callCount, 1);

            spy();
            assert.equals(spy.callCount, 2);

            this.sandbox.resetHistory();

            spy();
            assert.equals(spy.callCount, 1);  // should not fail but fails
        });
    });

    describe("#1398", function () {
        it("Call order takes into account both calledBefore and callCount", function () {
            var s1 = sinon.spy();
            var s2 = sinon.spy();

            s1();
            s2();
            s1();

            assert.exception(function () {
                sinon.assert.callOrder(s2, s1, s2);
            });
        });
    });

    describe("#1474 - promise library should be propagated through fakes and behaviors", function () {
        var stub;

        function makeAssertions(fake, expected) {
            assert.isFunction(fake.then);
            assert.isFunction(fake.tap);

            assert.equals(fake.tap(), expected);
        }

        beforeEach(function () {
            var promiseLib = {
                resolve: function (value) {
                    var promise = Promise.resolve(value);
                    promise.tap = function () {
                        return "tap " + value;
                    };

                    return promise;
                }
            };

            stub = sinon.stub().usingPromise(promiseLib);

            stub.resolves("resolved");
        });

        it("stub.onCall", function () {
            stub.onSecondCall().resolves("resolved again");

            makeAssertions(stub(), "tap resolved");
            makeAssertions(stub(), "tap resolved again");
        });

        it("stub.withArgs", function () {
            stub.withArgs(42).resolves("resolved again");
            stub.withArgs(true).resolves("okay");

            makeAssertions(stub(), "tap resolved");
            makeAssertions(stub(42), "tap resolved again");
            makeAssertions(stub(true), "tap okay");
        });
    });


    describe("#1456", function () {
        var sandbox;

        function throwsOnUnconfigurableProperty() {
            /* eslint-disable no-restricted-syntax */
            try {
                var preDescriptor = Object.getOwnPropertyDescriptor(window, "innerHeight"); //backup val
                Object.defineProperty(window, "innerHeight", { value: 10, configureable: true, writeable: true });
                Object.defineProperty(window, "innerHeight", preDescriptor); //restore
                return false;
            } catch (err) {
                return true;
            }
            /* eslint-enable no-restricted-syntax */
        }

        beforeEach(function () {
            if (typeof window === "undefined" || throwsOnUnconfigurableProperty()) { this.skip(); }

            sandbox = sinonSandbox.create();
        });

        afterEach(function () {
            sandbox.restore();
        });

        it("stub window innerHeight", function () {
            sandbox.stub(window, "innerHeight").value(111);

            assert.equals(window.innerHeight, 111);
        });
    });
});
