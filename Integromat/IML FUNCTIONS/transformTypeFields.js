  function transformTypeFields(costumFields) {
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

    switch (costumFields.type.name) {
      case 'picklist':
        result.type = "select";
        result.options = costumFields.type.picklistValues;
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


    if (costumFields.type.refersTo) {
      search.url = "rpc://RpcQueryData";
      search.label = "Search";
      parameter.name = "searchModule";
      parameter.type = "select";
      parameter.label = "Type";

      for (var i = 0; i < costumFields.type.refersTo.length; i++) {

        if (i === 0) {
          options[i] = {
            label: costumFields.type.refersTo[i],
            value: costumFields.type.refersTo[i],
            default: true
          };
        } else {
          options[i] = {
            label: costumFields.type.refersTo[i],
            value: costumFields.type.refersTo[i]
          };
        }

      }

      parameter.options = options;
      parameters[1] = parameter;
      search.parameters = parameters;
      result.rpc = search;
    }

    result.name = costumFields.name;
    result.label = costumFields.label;
    result.advanced = !costumFields.mandatory;
    result.required = costumFields.mandatory;

    return result;
  }