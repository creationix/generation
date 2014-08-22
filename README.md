generation
==========

 - thunk - in functional programming, an anonymous function with all input arguments already partially applied
 - continuable - function that takes a single argument, the node style callback

 - generator function statement - es6 function with * in syntax, calling returns generator object
 - generator function expression
 - generator object
 - yield
 - yield*

 - co / gen-run
 - js-git
 - lisp interpreter with blocking I/O
 - koa
 -



1. Start showing callback problem, example showing rewriting everything when
   I/O is added. "while title is visible start with 'suppose you have this problem'"
   (hook within 30 seconds)

(overview and then another hook)

(10 minute modules)

(single core concept for each concept,
 - 1 minute gist of module / context
 - up to 9 minutes to go over details and conclude)

hooks are most important in first 2 or 3 modules

(better to be too simple than too hard, especially at first)

(show table of contents and sign posts to provide context)

1.5 Explain the 3 options (callbacks, promises, generators)

2. diagram showing event loop between callbacks and generators

3. Explain that generators are ES6 and I/O model is not.  Event loop is implicit
   in javascript and provided by platform (browser/node)

3.5 mention koa and js-git usage with generators

4. Walk through a real-life example compare architecture of callback vs generator.

5. show where ES6 generators fit in, what platforms implement it. Show diagram
