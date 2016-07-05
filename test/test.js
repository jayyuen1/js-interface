"use strict"

const _ = require('underscore')

const expect = require('chai').expect
const TestObjects = require('./test_objects')
const JSInterface = require('../js_interface')

const interfaceDefinition = TestObjects.interfaceDefinition

const objectThatImplementsTheInterfaceAndAlsoHasExtraFunctions = TestObjects.objectThatImplementsTheInterfaceAndAlsoHasExtraFunctions
const objectThatImplementsInterfaceOnPrototype = TestObjects.objectThatImplementsInterfaceOnPrototype
const objectThatImplementsInterfaceOnSuperClassPrototype = TestObjects.objectThatImplementsInterfaceOnSuperClassPrototype

const objectThatHasAFunctionNameMisSpelled = TestObjects.objectThatHasAFunctionNameMisSpelled
const objectThatHasExtraParamValues = TestObjects.objectThatHasExtraParamValues
const objectThatIsMissingParamValues = TestObjects.objectThatIsMissingParamValues

const objectsThatDoImplementTheInterface = [
  objectThatImplementsTheInterfaceAndAlsoHasExtraFunctions,
  objectThatImplementsInterfaceOnPrototype,
  objectThatImplementsInterfaceOnSuperClassPrototype
]

const objectsThatDoNotImplementTheInterface = [
  objectThatHasAFunctionNameMisSpelled,
  objectThatHasExtraParamValues,
  objectThatIsMissingParamValues
]

function codeThrowsException(funcRunCode) {
  let exceptionWasCaught = null
  try {
    funcRunCode()
    exceptionWasCaught = false
  } catch (ex) {
    exceptionWasCaught = true
  }
  return exceptionWasCaught
}


describe('The "isImplementedIn" function', function() {

  it('confirms that an interface has been implemented by an object', function() {
    const interfaceIsImplementedByObj = JSInterface.isImplementedIn(objectThatImplementsTheInterfaceAndAlsoHasExtraFunctions, interfaceDefinition)
    expect(interfaceIsImplementedByObj).to.be.true
  })
  
  it('confirms that an interface has been implemented by an object, when the object has inherited its methods from its prototype', function() {
    const interfaceIsImplementedByObjWhenItsPrototypeImplementsIt = JSInterface.isImplementedIn(objectThatImplementsInterfaceOnPrototype, interfaceDefinition)
    expect(interfaceIsImplementedByObjWhenItsPrototypeImplementsIt).to.be.true
  })

  it('confirms that an interface has been implemented by an object, when the object has inherited its methods from the prototype of its superclass', function() {
    const interfaceIsImplementedByObjWhenItsPrototypeImplementsIt = JSInterface.isImplementedIn(objectThatImplementsInterfaceOnSuperClassPrototype  , interfaceDefinition)
    expect(interfaceIsImplementedByObjWhenItsPrototypeImplementsIt).to.be.true
  })

  
  it('indicates that an interface has NOT been implemented by an object, if the number of method parameters to do not match what is expected', function() {
    const interfaceIsImplementedByObjectThatHasExtraParamValues = JSInterface.isImplementedIn(objectThatHasExtraParamValues, interfaceDefinition)
    const interfaceIsImplementedByObjectThatIsMissingParamValues = JSInterface.isImplementedIn(objectThatIsMissingParamValues, interfaceDefinition)
    expect(interfaceIsImplementedByObjectThatHasExtraParamValues).to.be.false
    expect(interfaceIsImplementedByObjectThatIsMissingParamValues).to.be.false
  })
  
  it('indicates that an interface has NOT been implemented by an object, if a method is missing', function() {
    const interfaceIsImplementedByObjectThatHasAFunctionNameMisSpelled = JSInterface.isImplementedIn(objectThatHasAFunctionNameMisSpelled, interfaceDefinition)
    expect(interfaceIsImplementedByObjectThatHasAFunctionNameMisSpelled).to.be.false
  })
  
})

describe('The "throwErrIfNotImplementedIn" function', function() {
  it('throws an error if an interface is NOT supported by an object', function() {
    _.each(objectsThatDoNotImplementTheInterface, function (obj) {
      const codeThrowsAnException = codeThrowsException(function() {
        JSInterface.throwErrIfNotImplementedIn(obj, interfaceDefinition)
      })
      expect(codeThrowsAnException).to.be.true
    })
  })

  it('does NOT throw an error if an interface IS supported by an object', function() {
    _.each(objectsThatDoImplementTheInterface, function (obj) {
      const codeThrowsAnException = codeThrowsException(function() {
        JSInterface.throwErrIfNotImplementedIn(obj, interfaceDefinition)
      })
      expect(codeThrowsAnException).to.be.false
    })
  })
})

describe('The "reasonsNotImplementedIn" function', function() {
  it('returns a String if an interface is NOT suported by an object', function() {
    _.each(objectsThatDoNotImplementTheInterface, function (obj) {
      const reasonsOrNull = JSInterface.reasonsNotImplementedIn(obj, interfaceDefinition)
      expect(reasonsOrNull).to.satisfy(function () { return _.isString(reasonsOrNull) })
    })
  })

  it('returns null if an interface IS supported by an object', function() {
    _.each(objectsThatDoImplementTheInterface, function (obj) {
      const reasonsOrNull = JSInterface.reasonsNotImplementedIn(obj, interfaceDefinition)
      expect(reasonsOrNull).to.be.null
    })
  })
})

describe('the "implementIn" function', function() {
  describe('makes it easy to ensure that an object implements a particular interface', function() {
    it('copies method implementations for an interface definition into an object (from another object that supports that interface), so that after the method call, the object suppports the defined interface', function() {
      _.each(objectsThatDoImplementTheInterface, function(implementationDefinition) {
        const obj = {}
        expect(JSInterface.isImplementedIn(obj, interfaceDefinition)).to.be.false
        expect(JSInterface.isImplementedIn(implementationDefinition, interfaceDefinition)).to.be.true
        JSInterface.implementIn(obj, interfaceDefinition, implementationDefinition)
        expect(JSInterface.isImplementedIn(obj, interfaceDefinition)).to.be.true
      })
    })
    it("can copy method implementations into an object's prototype as well... thus, ensuring that newly constructed objects always implement the interface", function() {
      _.each(objectsThatDoImplementTheInterface, function(implementationDefinition) {
        
        function SomeObject() {
          // DO NOTHING
        }
        
        SomeObject.prototype.someFunction = function() {
          // DO NOTHING
        }
        
        const anObj = new SomeObject()
        expect(JSInterface.isImplementedIn(anObj, interfaceDefinition)).to.be.false
        
        JSInterface.implementIn(SomeObject.prototype, interfaceDefinition, implementationDefinition)
        
        const anotherObj = new SomeObject()
        expect(JSInterface.isImplementedIn(anotherObj, interfaceDefinition)).to.be.true
        expect(JSInterface.isImplementedIn(anObj, interfaceDefinition)).to.be.true

      })
    })
  })
  
  describe('helps us during application development, by alerting us when we adjust an interface definition but forget to adjust the implementation', function() {
    it('throws an error if the interface definition does not match up with the implementation we are supplying for the interface... thus, alerting us that our object is not successfully implementing the interface that we intend it to implement.  One example of when this is useful, is during application development; if we adjust an interface definition but forget to adjust the implementation, then we will be alerted.', function() {
      _.each(objectsThatDoNotImplementTheInterface, function(implementationDefinition) {
        const obj = {}
        expect(JSInterface.isImplementedIn(obj, interfaceDefinition)).to.be.false
        expect(JSInterface.isImplementedIn(implementationDefinition, interfaceDefinition)).to.be.false

        const codeThrowsAnException = codeThrowsException(function() {
          JSInterface.implementIn(obj, interfaceDefinition, implementationDefinition)
        })

        expect(codeThrowsAnException).to.be.true
      })
    })
  })

  

})

describe('The examples in our readme file', function() {
  it('work', function() {
    
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

    expect(JSInterface.isImplementedIn(mathImpl, MathInterface)).to.be.true
    
    
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

    expect(JSInterface.isImplementedIn(mathObject, MathInterface)).to.be.true

    // Use `implementIn` to "implement an interface or die (fail-fast) trying":
    
    const obj = {}

    expect(JSInterface.isImplementedIn(obj, MathInterface)).to.be.false

    JSInterface.implementIn(obj, MathInterface, {
      add: function(x, y) { return x + y },
      subtract: function(a, b) { return a - b }
    })

    expect(JSInterface.isImplementedIn(obj, MathInterface)).to.be.true

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
    
    expect(emsg).to.equal('Error: Missing Function: subtract(numOne, numTwo)')
      
    // If you want to implement the interface on a prototype:

    function MyClass() {
    }

    JSInterface.implementIn(MyClass.prototype, MathInterface, {
      add: function(x, y) { return x + y },
      subtract: function(a, b) { return a - b }
    })

    const myObj = new MyClass()
    

    expect(JSInterface.isImplementedIn(myObj, MathInterface)).to.be.true
    
    // To obtain the reason(s) why an interface is not fully implemented:

    const someObj = {
        add: function(x, y, z) { return x + y + z }
    }
    
    expect(JSInterface.reasonsNotImplementedIn(someObj, MathInterface)).to.equal('Incorrect number of parameters (3) in implementation for function: add(numOne, numTwo) | Missing Function: subtract(numOne, numTwo)')
    
    // To throw an error if an interface is not fully implemented:
    
    let emsg2 = null
    try {
      JSInterface.throwErrIfNotImplementedIn(someObj, MathInterface)
    } catch (exception) {
      emsg2 = exception.toString()
    }
    expect(emsg2).to.equal('Error: Incorrect number of parameters (3) in implementation for function: add(numOne, numTwo) | Missing Function: subtract(numOne, numTwo)')
    
      
  })
})