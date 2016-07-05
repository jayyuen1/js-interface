var util = require('util');

function funcAdd(x, y) {
  return x + y
}

function funcSubtract(a, b) {
  return a - b
}

function funcMultiply(q, r) {
  return q * r
}

function funcIdentity(x) {
  return x
}

function funcAddThree(x, y, z) {
  return x + y + z
}

function ClassExample() {
  // DO NOTHING
}
ClassExample.prototype.add = funcAdd
ClassExample.prototype.subtract = funcSubtract

function SubClassExample() {
  ClassExample.apply(this, arguments)
}

util.inherits(SubClassExample, ClassExample)

SubClassExample.prototype.multiply = funcMultiply

exports.interfaceDefinition = {
  add: ["numOne", "numTwo"],
  subtract: ["numOne", "numTwo"]
}

exports.objectThatImplementsTheInterfaceAndAlsoHasExtraFunctions = {
  add: funcAdd,
  subtract: funcSubtract,
  multiply: funcMultiply

}

exports.objectThatIsMissingParamValues = {
  add: funcAdd,
  subtract: funcIdentity
}

exports.objectThatHasAFunctionNameMisSpelled = {
  addd: funcAdd,
  subtract: funcSubtract
}

exports.objectThatHasExtraParamValues = {
  add: funcAddThree,
  subtract: funcSubtract
}

exports.objectThatImplementsInterfaceOnPrototype = new ClassExample()
exports.objectThatImplementsInterfaceOnSuperClassPrototype = new SubClassExample()

