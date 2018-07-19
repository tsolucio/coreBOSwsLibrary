function transformFieldsToUpdate(costumFields) {
  var arrayToReturn = [];

  for (var j = 0; j < costumFields.length; j++) {
    var result = {};
    var search = {};
    var parameter = {};
    var parameters = [{
      name: "q",
      type: "text",
      label: "Query",
      help: "Can be empty"
    }];
    var assignOption = [{
      label: 'Me',
      value: '19x1',
      default: true
    }];
    var options = [];

    switch (costumFields[j].type.name) {
      case 'picklist':
        result.type = "select";
        result.options = costumFields[j].type.picklistValues;
        break;
      case 'owner':
        result.options = assignOption;
        result.type = "select";
        break;
      case 'datetime':
        result.type = "date";
        break;
      default:
        result.type = "text";
    }


    if (costumFields[j].type.refersTo) {
      search.url = "rpc://RpcQueryData";
      search.label = "Search";
      parameter.name = "searchModule";
      parameter.type = "select";
      parameter.label = "Type";

      for (var i = 0; i < costumFields[j].type.refersTo.length; i++) {

        if (i === 0) {
          options[i] = {
            label: costumFields[j].type.refersTo[i],
            value: costumFields[j].type.refersTo[i],
            default: true
          };
        } else {
          options[i] = {
            label: costumFields[j].type.refersTo[i],
            value: costumFields[j].type.refersTo[i]
          };
        }

      }

      parameter.options = options;
      parameters[1] = parameter;
      search.parameters = parameters;
      result.rpc = search;
    }

    result.name = costumFields[j].name;
    result.label = costumFields[j].label;
    result.advanced = true

    arrayToReturn[j] = result;
  }

  arrayToReturn[j] = {
    type: "text",
    name: "id",
    label: "Object Id",
    advanced: false,
    required: true
  }
  return arrayToReturn;
}