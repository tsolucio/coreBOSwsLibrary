function testconvertFilter2Query() {
    let filter = 22;
    let expected = '';
    let actual = convertFilter2Query(filter);
    if (actual === expected) {
        console.log(actual);
    } else {
        console.error(filter, actual);
    }
    filter = {'accountname':'chemex'};
    expected = " where accountname like '%chemex%'";
    actual = convertFilter2Query(filter);
    if (actual === expected) {
        console.log(actual);
    } else {
        console.error(filter, actual);
    }
    filter = {'accountname':'chemex','city':'denia'};
    expected = " where accountname like '%chemex%' OR city like '%denia%'";
    actual = convertFilter2Query(filter);
    if (actual === expected) {
        console.log(actual);
    } else {
        console.error(filter, actual);
    }
    filter = [];
    expected = '';
    actual = convertFilter2Query(filter);
    if (actual === expected) {
        console.log(actual);
    } else {
        console.error(filter, actual);
    }
    filter = [
        {
          field: 'code_courier',
          value: 11,
          operation: '=',
          glue:  'or',
          group: 1
        }
    ];
    expected = " where  code_courier = '11'";
    actual = convertFilter2Query(filter);
    if (actual === expected) {
        console.log(actual);
    } else {
        console.error(filter, actual);
    }
    filter = [
        {
          field: 'code_courier',
          value: '11',
          operation: 'not in',
          glue:  'or',
          group: 1
        }
    ];
    expected = " where  code_courier not in ('11')";
    actual = convertFilter2Query(filter);
    if (actual === expected) {
        console.log(actual);
    } else {
        console.error(filter, actual);
    }
    filter = [
        {
          field: 'code_courier',
          value: ['11','12'],
          operation: 'not in',
          glue:  'or',
          group: 1
        }
    ];
    expected = " where  code_courier not in ('11','12')";
    actual = convertFilter2Query(filter);
    if (actual === expected) {
        console.log(actual);
    } else {
        console.error(filter, actual);
    }
    filter = [
        {
          field: 'code_courier',
          value: '11',
          operation: 'sw',
          glue:  'or',
          group: 1
        },
        {
          field: 'email_courier',
          value: '11',
          operation: 'notempty',
          glue:  'and',
          group: 1
        },
        {
          field: 'name_courier',
          value: '11',
          operation: '>=',
          glue:  'or',
          group: 1
        },
    ];
    expected = " where  code_courier like '11%' or (email_courier is not null and email_courier!='' and email_courier!=0) and name_courier >= '11'";
    actual = convertFilter2Query(filter);
    if (actual === expected) {
        console.log(actual);
    } else {
        console.error(filter, actual);
    }
    filter = [
        {
          field: 'code_courier',
          value: '11',
          operation: 'sw',
          glue:  'or',
          group: 1
        },
        {
          field: 'email_courier',
          value: '11',
          operation: 'notempty',
          glue:  'and',
          group: 1
        },
        {
          field: 'name_courier',
          value: '11',
          operation: '>=',
          glue:  'or',
          group: 2
        },
    ];
    expected = " where (  code_courier like '11%' or (email_courier is not null and email_courier!='' and email_courier!=0)) and (name_courier >= '11')";
    actual = convertFilter2Query(filter);
    if (actual === expected) {
        console.log(actual);
    } else {
        console.error(filter, actual);
    }
    filter = [
        {
          field: 'code_courier',
          value: '11',
          operation: 'ew',
          glue:  'or',
          group: 1
        },
        {
          field: 'code_courier',
          value: '11',
          operation: '!=',
          glue:  'or',
          group: 2
        },
    ];
    expected = " where (  code_courier like '%11') or (code_courier != '11')";
    actual = convertFilter2Query(filter);
    if (actual === expected) {
        console.log(actual);
    } else {
        console.error(filter, actual);
    }
    filter = [
        {
          field: 'name_courier',
          value: '11',
          operation: '>=',
          glue:  'or',
          group: 1
        },
        {
          field: 'code_courier',
          value: '11',
          operation: 'ew',
          glue:  'and',
          group: 2
        },
        {
          field: 'code_courier',
          value: '11',
          operation: '!=',
          glue:  'or',
          group: 2
        },
    ];
    expected = " where (  name_courier >= '11') or (code_courier like '%11' and code_courier != '11')";
    actual = convertFilter2Query(filter);
    if (actual === expected) {
        console.log(actual);
    } else {
        console.error(filter, actual);
    }
}

