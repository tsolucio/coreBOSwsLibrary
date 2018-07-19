function omit (parameters, prefix = '') {
  var object = {}
  for (var key in parameters) {
    if (parameters[key] === null) {
      continue
    }
    if (key === 'id') {
      object[key] = prefix + 'x' + parameters[key]
    } else {
      object[key] = parameters[key]
    }
  }
  return JSON.stringify(object)
}
