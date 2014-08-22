"use strict";

// Type tagging utility for continuables.
var ƒ = (function () {
  var s = {};
  function ƒ(f) { f.ƒ = s; return f; }
  ƒ.is = function isƒ(f) { return f && f.ƒ === s; };
  return ƒ;
}());

run(main2, end);
t
function* main() {
  return ƒ(function (callback) {
    setTimeout(function () {
      callback(null, 42);
    }, 1000);
  });
}

function* main2(gen) {

  // Testing for sync callback stack protection
  var i = 10000;
  var down = ƒ(function (c) { c(null, i - 1); });
  while ((i = yield down));
  yield 42;

  // Testing double callback protection
  console.log("Hello");
  yield evil();

  // Testing callback style usage
  console.log("Sleep");
  yield setTimeout(gen(), 1000);
  console.log("Awake");

  console.log(yield slowAdd(1, 2));

  console.log(Date.now())
  console.log(yield [
    slowAdd(1,2),
    function plain() {},
    42,
    {},
    true,
    false,
    null,
    undefined,
    evil(),
    [
      slowAdd(1,3),
      slowAdd(4,7),
    ],
    {
      name: "Tim",
      age: slowAdd(12, 20),
    },
    5
  ]);
  console.log(Date.now())

}


function end(err, result) {
  if (err) console.error(err);
  else console.info(result);
  // throw "UP";
}

function slowAdd(a, b) {
  return ƒ(function (c) {
    setTimeout(function () {
      c(null, a + b);
    }, 1000);
  });
}

function evil() {
  return ƒ(function (c) {
    c(null, 1);
    setTimeout(function () {
      c(null, 2);
    }, 100);
  });
}

function run(gen, callback) {
  // Allow run to be used node style or continuable style.
  if (!callback) return run.bind(null, gen);
  var type = getType(gen);
  if (type === "GeneratorFunction") {
    gen = gen(resume);
  }
  else if (type !== "Generator") {
    throw new TypeError("run espects Generator or GeneratorFunction");
  }

  // shared [err, result] for check loop to read
  var data = null;
  // Flag to make sure check loop only happens once at a time.
  var looping = false;
  // Flag to know if we're already waiting on a continuable to resolve.
  var waiting = false;
  var done = false;

  // Run the generator till the next yield, return or end.
  getNext();

  function getNext(err, value) {
    try {
      var result = (err ? gen.throw(err) : gen.next(value));
      done = result.done;
      // Ignore yielded value if we're already waiting on a continuable.
      if (waiting) return;
      var out = unify(result.value);
      if (ƒ.is(out)) {
        return out(resume());
      }
      data = [null, out];
    }
    catch (err) {
      callback(err);
    }
  }

  function resume() {
    if (waiting) {
      throw new Error("Already waiting");
    }
    waiting = true;
    var times = 0;
    return function () {
      if (times++) {
        console.warn("Warning: same callback called " + times + " times");
        return;
      }
      waiting = false;
      data = arguments;
      check();
    };
  }

  function check() {
    if (looping) return;
    console.group("CHECK");
    while (data) {
      looping = true;
      var err = data[0];
      var item = data[1];
      if (done) {
        looping = false;
        console.groupEnd();
        return callback(err, item);
      }
      data = null;
      getNext(err, item);
      looping = false;
    }
    console.groupEnd();
  }
}

// Convert any value to a continuable if possible.
// Generators and GeneratorFunctions get wrapped in run
// Arrays become parallel tasks with recursive unification
// Same for objects, but with named results
function unify(value) {
  var type = getType(value);

  // If they yielded a generator function or generator object,
  // convert to continuable using run.
  if (type === "GeneratorFunction" || type === "Generator") {
    return run(value);
  }

  // Run tasks in parallel if an array is yielded.
  if (type === "Array") {
    return parallel(value);
  }

  // Same thing for objects, but with named keys.
  if (type === "Object") {
    return parallelNamed(value);
  }

  // Return everything else as-is.
  return value;
}

function parallel(array) {
  return ƒ(function (callback) {
    var length = array.length;
    var left = length;
    var results = new Array(length);
    var done = false;
    return array.forEach(function (value, i) {
      value = unify(value);
      if (ƒ.is(value)) {
        value(onResult);
      }
      else {
        onResult(null, value);
      }

      function onResult(err, result) {
        if (done) return;
        if (err) {
          done = true;
          return callback(err);
        }
        results[i] = result;
        if (--left) return;
        done = true;
        return callback(null, results);
      }
    });
  });
}

function parallelNamed(obj) {
  return ƒ(function (callback) {
    var keys = Object.keys(obj);
    var length = keys.length;
    var left = length;
    var results = {};
    var done = false;
    return keys.forEach(function (key) {
      var value = unify(obj[key]);
      results[key] = null;
      if (ƒ.is(value)) {
        value(onResult);
      }
      else {
        onResult(null, value);
      }
      function onResult(err, result) {
        if (done) return;
        if (err) {
          done = true;
          return callback(err);
        }
        results[key] = result;
        if (--left) return;
        done = true;
        console.log("OB", results);
        return callback(null, results);
      }
    });
  });
}

// Better type check,
// can tell functions and generator functions and generators apart.
function getType(value) {
  if (value === null) return "null";
  var type = typeof value;
  var source;
  if (type === "object") {
    source = Object.prototype.toString.call(value);
    return source.substring(8, source.length - 1);
  }
  if (type === "function") {
    source = Function.prototype.toString.call(value.constructor);
    var index = source.indexOf("(");
    return source.substring(9, index);
  }
  return type;
}
