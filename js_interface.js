const _ = require('underscore')

function reasonsNotImplementedIn(obj, interfaceDefinition) {
  const paramNamesArrByFuncName = interfaceDefinition

  const emsgs = _.reduce(paramNamesArrByFuncName, function(emsgsSoFar, paramNamesArr, funcName) {

    const funcNameAndDef = funcName + '(' + paramNamesArr.join(', ') + ')'
    const expectedNumParams = paramNamesArr.length

    const func = obj[funcName]
    const emsgOrNullForSingleFunc = 
      !func
        ? 'Missing Function: ' + funcNameAndDef
        : !_.isFunction(func)
            ? 'Not a function: ' + funcName
            : func.length !== expectedNumParams
               ? 'Incorrect number of parameters (' + func.length + ') in implementation for function: ' + funcNameAndDef
               : null
               
      

    if (emsgOrNullForSingleFunc) {
      emsgsSoFar.push(emsgOrNullForSingleFunc)
    }
    return emsgsSoFar
  }, [])
  
  const emsgOrNull = (emsgs.length === 0) ? null : emsgs.join(" | ")
  return emsgOrNull
}

function isImplementedIn(obj, interfaceDefinition) {
  return !reasonsNotImplementedIn(obj, interfaceDefinition)
}

function throwErrIfNotImplementedIn(obj, interfaceDefinition) {
  const emsgOrNull = reasonsNotImplementedIn(obj, interfaceDefinition)
  if (emsgOrNull !== null) {
      throw new Error(emsgOrNull) 
  }
}

function implementIn(obj, interfaceDefinition, interfaceImplementation) {
  
  throwErrIfNotImplementedIn(interfaceImplementation, interfaceDefinition)

  const paramNamesArrByFuncName = interfaceDefinition

  _.each(paramNamesArrByFuncName, function(paramNamesArr, funcName) {
    const func = interfaceImplementation[funcName]
    obj[funcName] = func
  })  
}


exports.implementIn = implementIn
exports.isImplementedIn = isImplementedIn
exports.reasonsNotImplementedIn = reasonsNotImplementedIn
exports.throwErrIfNotImplementedIn = throwErrIfNotImplementedIn