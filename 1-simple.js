function* main() {
  console.log("Hello");
  console.log("YIELD", yield sleep(1000));
  console.log("Bye");
  return "I'm done!";
}

function sleep(ms) {
  setTimeout(function () {
    console.log("NEXT 2", it.next("WAKE UP"));
  }, ms);
  return "I'm sleepy";
}

var it = main();
console.log("NEXT 1", it.next());