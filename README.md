# js-interface

A tiny library that helps us
- achieve a certain level of type safety around interfaces (via duck typing)
- keeps JavaScript objects synchronized with any interface definitions that they explicitly implement


## Guiding Principle

When we create an object/prototype with the intention of having it implement a certain interface, then we should fail-fast if the created object/prototype does not correctly implement that interface.


## Definitions

At present, this library considers an "interface" to be a set of function signatures, where each signature consists of the function name and the number of parameters that the function accepts.

An object/prototype is considered to "implement" an interface if the object/prototype contains a matching function for each signature in the interface.

Properties are NOT currently checked (only functions are checked).  In the future, the library may be extended to check for both functions AND properties.


## Installation

`npm install @jayyuen1/js-interface`


## Tests

`npm test`


## Usage

### Importing/Requiring the module

To load the library:
`var JSInterface = require('@jayyuen1/js-interface')`

Or even better, use 'const' to make JSInterface an immutable variable (since you will probably never have a need to re-assign it):
`const JSInterface = require('@jayyuen1/js-interface')`

### Defining an interface

To define an interface:

````javascript
    const MathInterface = {
      add: ["numOne", "numTwo"],
      subtract: ["numOne", "numTwo"]
    }
````

Presumably, you are writing an application in which multiple objects/classes/prototypes need to implement one or more interfaces.
(If not, then your application is probably simple enough for you to NOT need to use this library!)

In this case, it might make more sense to put each interface definition into its own file, and then 'require' it wherever needed (assuming that you are building your application in nodejs or something similar).
For example, I can create 'MathInterface.js' and populate it with this:

````javascript
    module.exports = {
      add: ["numOne", "numTwo"],
      subtract: ["numOne", "numTwo"]
    }
````

Once this file has been created, you can get a reference to the interface definition using 'require':
````javascript
    const MathInterface = require('MathInterface')
````

_**In all of the code examples that follow, we will assume that we have already obtained a reference to our interface and have assigned it to the MathInterface variable (using either of the two approaches shown above).**_


### Checking for an interface

To confirm that an interface has been implemented by an object (whether directly or through prototype inheritance), use the '*isImplementedIn*' function:

````javascript

    // Create an object that implements the interface
    const mathImpl = {
      add: function(x, y) { return x + y },
      subtract: function(a, b) { return a - b }
    }

    // Check whether the object implements the interface (and of course it does!)
    console.log(JSInterface.isImplementedIn(mathImpl, MathInterface)) // true
    
````

Here is an example in which we implement the interface via prototype inheritance.
Specifically,
- We create a class that inherits from another class.
- We implement part of the interface in the superclass, and the remaining part in the subclass
    
````javascript
    const util = require('util') // NodeJS 'util' library, which we will use to
                                 // implement object inheritance
    
    // FIRST, we create our superclass.
    
    function MathSuperClass() {
    }

    MathSuperClass.prototype.add = function(x, y) { // half of our interface
      return x + y
    }

    // NEXT, we create our subclass.
    function MathSubClass() {
    }

    util.inherits(MathSubClass, MathSuperClass)

    MathSubClass.prototype.subtract = function(a, b) { // the other half of
                                                       // our interface
      return a - b
    }
    
    
    // FINALLY, we create an instance of our subclass, and check whether it
    // implements our interface definition (and of course it does!)
    const mathObject = new MathSubClass()
    console.log(JSInterface.isImplementedIn(mathObject, MathInterface)) // true
````


### Implementing an interface

Of course, you can implement an interface using the methods shown in the earlier examples.

HOWEVER... as your program changes, interface definitions may change.  When this happens, you will need to make corresponding changes to all of the objects that you wrote for purposes of implementing those interfaces.  It can be difficult to remember to change all of them... AND, if you forget to change one, the resulting problems in your program might be hard to troubleshoot and resolve.

THEREFORE... you might find it easier to maintain your code (and prevent errors) by designing it to fail-fast at object/class/prototype creation time, whenever your interface implementation has become out-of-synch with the interface definition.

Use the '*implementIn*' function to help you do this:

````javascript

    const obj = {}

    // The following line returns false, because our object does not yet have
    // the functions needed to implement our interface
    console.log(JSInterface.isImplementedIn(obj, MathInterface)) 
    

    JSInterface.implementIn(obj, MathInterface, {
      add: function(x, y) { return x + y },
      subtract: function(a, b) { return a - b }
    })

    // The following line returns true, because our object now implements
    // the interface
    console.log(JSInterface.isImplementedIn(obj, MathInterface)) 

````

What happens when we attempt to implement an interface with implementation code that is out-of-synch with the interface definition?  We fail fast:

````javascript
    const anotherObj = {}

    // The following line throws an exception, because we forgot to supply an
    // implementation for the 'subtract' function.
    // The exception will contain the error message:
    //                           "Missing Function: subtract(numOne, numTwo)"
    JSInterface.implementIn(anotherObj, MathInterface, {
      add: function(x, y) { return x + y }
    })
    
````

The 'implementIn' function can also be used to implement an interface directly on a prototype:

````javascript
    function MyClass() {
    }

    JSInterface.implementIn(MyClass.prototype, MathInterface, {
      add: function(x, y) { return x + y },
      subtract: function(a, b) { return a - b }
    })

    const myObj = new MyClass()
    
    console.log(JSInterface.isImplementedIn(myObj, MathInterface)) // true
````

### Extra Stuff
      
- The '*reasonsNotImplementedIn*' function can be used instead of the 'isImplementedIn' function, to check whether an interface is correctly implemented by an object.  It returns null if the interface IS correctly implemented... but if NOT correctly implemented, then we get back a message that tels us what's wrong or missing.
- The '*throwErrIfNotImplementedIn*' function performs the same check as 'isImplementedIn' and 'reasonsNotImplementedIn', but throws an exception if an interface is not fully implemented

````javascript

    const someObj = {
        add: function(x, y, z) { return x + y + z }
    }
    
    var reasons = JSInterface.reasonsNotImplementedIn(someObj, MathInterface)
    
    console.log(reasons) // "Incorrect number of parameters (3) in
                         // implementation for function: add(numOne, numTwo) 
                         // | Missing Function: subtract(numOne, numTwo)"

    // The following line throws an exception that contains the message:
    //   "Incorrect number of parameters (3) in implementation for function:
    //    add(numOne, numTwo) | Missing Function: subtract(numOne, numTwo)"
    JSInterface.throwErrIfNotImplementedIn(someObj, MathInterface) 

````

