function transformFilterInput(filter, objectName) {
  var conditionForOr = "";

  for (var i = 0; i < filter.length; i++) {
    var conditionForAnd = "";
    if (i === 0) {
      conditionForOr += "where ( ";
    } else {
      conditionForOr += "or ( "
    }
    for (let j = 0; j < filter[i].length; j++) {
      var element = filter[i][j];
      condition = "";
      if (j > 0) {
        conditionForAnd += " and "
      }
      switch (element.o) {
        case "number:eq":
        case "text:equals":
          condition = " = ";
          break;
        case "number:ne":
        case "text:notEquals":
          condition = " <> ";
          break;
        case "text:startsWith":
          condition = " like ";
          element.b = element.b + "%";
          break;
        case "text:endsWith":
          condition = " like ";
          element.b = "%" + element.b
          break;
        case "text:contains":
          condition = " like ";
          element.b = "%" + element.b + "%"
          break;
        case "number:lt":
          condition = " < ";
          break;
        case "Greater then":
          condition = " > ";
          break;
        case "number:gte":
          condition = " >= ";
          break;
        case "number:lte":
          condition = " =< ";
          break;
        default:
          break;
      }
      conditionForAnd += element.a + " " + condition + " " + element.b;
    }
    conditionForOr += conditionForAnd + " ) ";
  }
  var query = 'select * from ' + objectName + ' ' + conditionForOr + ';';
  return query;
}