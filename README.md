# js-interface

A tiny library that helps us achieve a certain level of (duck typing) type safety around interfaces.


## Guiding Principle

When we create an object/prototype with the intention of having it implement a certain interface, then we should fail-fast if the created object/prototype does not correctly implement that interface.


## Definitions

This library considers an "interface" to be a set of function signatures, where each signature consists of the function name and the number of parameters that the function accepts.

An object/prototype is considered to "implement" an interface if the object/prototype contains a matching function for each signature in the interface.


## Installation

`npm install @jayyuen1/js-interface`


## Tests

`npm test`


## Usage

To load the library:
`var JSInterface = require('@jayyuen1/js-interface')`

Or even better, use 'const' to make JSInterface an immutable variable (since you will probably never have a need to re-assign it):
`const JSInterface = require('@jayyuen1/js-interface')`


Then, try out these examples:

````javascript
    // To define an interface:
    const MathInterface = {
      add: ["numOne", "numTwo"],
      subtract: ["numOne", "numTwo"]
    }
    
    // To confirm that an interface has been implemented by an object
    // (whether directly or through prototype inheritance),
    // use the `isImplementedIn` function:

    const mathImpl = {
      add: function(x, y) { return x + y },
      subtract: function(a, b) { return a - b }
    }

    console.log(JSInterface.isImplementedIn(mathImpl, MathInterface)) // true
    
    
    // Here is another example that uses prototype inheritance:
    
    const util = require('util') // NodeJS 'util' library
    
    function MathSuperClass() {
    }

    MathSuperClass.prototype.add = function(x, y) {
      return x + y
    }

    function MathSubClass() {
    }

    util.inherits(MathSubClass, MathSuperClass)

    MathSubClass.prototype.subtract = function(a, b) {
      return a - b
    }

    const mathObject = new MathSubClass()

    console.log(JSInterface.isImplementedIn(mathObject, MathInterface)) // true

    // Use `implementIn` to "implement an interface or die (fail-fast) trying":
    
    const obj = {}

    console.log(JSInterface.isImplementedIn(obj, MathInterface)) // false

    JSInterface.implementIn(obj, MathInterface, {
      add: function(x, y) { return x + y },
      subtract: function(a, b) { return a - b }
    })

    console.log(JSInterface.isImplementedIn(obj, MathInterface)) // true

    const anotherObj = {}

    let emsg = null
    try {
      // The following line throws an error
      JSInterface.implementIn(anotherObj, MathInterface, {
        add: function(x, y) { return x + y }
      })
    } catch(exception) {
      emsg = exception.toString()
    }
    
    console.log(emsg) // Error: Missing Function: subtract(numOne, numTwo)
      
    // If you want to implement the interface on a prototype:

    function MyClass() {
    }

    JSInterface.implementIn(MyClass.prototype, MathInterface, {
      add: function(x, y) { return x + y },
      subtract: function(a, b) { return a - b }
    })

    const myObj = new MyClass()
    

    console.log(JSInterface.isImplementedIn(myObj, MathInterface)) // true
    
    // To obtain the reason(s) why an interface is not fully implemented:

    const someObj = {
        add: function(x, y, z) { return x + y + z }
    }
    
    console.log(JSInterface.reasonsNotImplementedIn(someObj, MathInterface)) // Incorrect number of parameters (3) in implementation for function: add(numOne, numTwo) | Missing Function: subtract(numOne, numTwo)
    
    // To throw an error if an interface is not fully implemented:
    
    let emsg2 = null
    try {
      JSInterface.throwErrIfNotImplementedIn(someObj, MathInterface)
    } catch (exception) {
      emsg2 = exception.toString()
    }
    console.log(emsg2) // Error: Incorrect number of parameters (3) in implementation for function: add(numOne, numTwo) | Missing Function: subtract(numOne, numTwo)

````
