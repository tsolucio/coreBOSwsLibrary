//@ts-ignore
import { DataProvider } from 'react-admin';
//import { doCreate, doDelete, doInvoke, doMassDelete, doMassRetrieve, doQueryWithTotal, doRetrieve, doUpdate } from '../utils/lib';
//@ts-ignore
import * as cbconn from 'corebos-ws-lib/WSClientm';



const getUitype10Filter = (key: string, value: any, resource: string, relatedModule: string, joinCondition: string) => {
    const window_: any = window;
    const fields = window_?.coreBOS?.Describe?.[resource]?.fields ?? [];
    const keyField = fields.filter((field: any) => field.name === key)[0] ?? {};
    let refTo = '';
    if (relatedModule) {
        refTo = relatedModule;
    } else {
        refTo = keyField?.type?.refersTo?.[0] || '';
    }
    const fieldName = (keyField && keyField.uitype === "10") ? `${key} : (${refTo}) id` : key;
    const valueID = value?.split('x')[1] ?? value;
    const nsrch = [{
        'fieldname': fieldName,
        'operation': 'contains',
        'value': valueID,
        'valuetype': 'raw',
        'joincondition': joinCondition,
        'groupid': 'ragroup',
        'groupjoin': 'and'
    }];
    
    return nsrch;
}

const getRaFilterQuery = (filter: any, resource: string, relatedModule: string, joinCondition: string) => {

    let search: string = '';

    Object.keys(filter).forEach((key: string) => {
        const value: any = filter[key];
        const window_: any = window;
        let nsrch: any[] = [];
        if (key.startsWith('cblistsearch_')) {
            let [, module] = key.split('_');
            let enamefield = window_.coreBOS.Describe[module].labelFields;
            if (enamefield.indexOf(',') !== -1) {
                let enames = enamefield.split(',');
                const grprand = Math.floor(Math.random() * 10);
                for (const element of enames) {
                    nsrch.push(
                        {
                            'fieldname': element,
                            'operation': 'contains',
                            'value': value,
                            'valuetype': 'raw',
                            'joincondition': 'OR',
                            'groupid': 'racblegrp' + grprand,
                            'groupjoin': 'and'
                        }
                    );
                }
            } else {
                nsrch = [{
                    'fieldname': window_.coreBOS.Describe[module].labelFields,
                    'operation': 'contains',
                    'value': value,
                    'valuetype': 'raw',
                    'joincondition': joinCondition,
                    'groupid': 'racblgroup',
                    'groupjoin': 'and'
                }];
            }
        } else if (key.startsWith('cbfiltersearch_')) {
            nsrch = JSON.parse(value);
        } else if (key.startsWith('cbfilter_')) {
            nsrch = [{
                'fieldname': value?.fieldname,
                'operation': value?.operation,
                'value': value?.value,
                'valuetype': value?.valuetype,
                'joincondition': value?.joincondition,
                'groupid': value?.groupid,
                'groupjoin': value?.groupjoin
            }];
        } else {
            nsrch = getUitype10Filter(key, value, resource, relatedModule, joinCondition);
        }
        if (search === '') {
            search = JSON.stringify(nsrch);
        } else {
            let osrch = JSON.parse(search);
            if (osrch[osrch.length - 1].joincondition === '') {
                osrch[osrch.length - 1].joincondition = 'or';
            }
            osrch[osrch.length - 1].groupjoin = 'and';
            search = JSON.stringify(osrch.concat(nsrch));
        }
    });

    return search;
}

const findOperation = (condition: any) => {
    const cond = condition || {};
    let op = '';
    let vals = '';
    switch (cond?.operation) {
        case 'equal':
            op = `${cond.field} = '${cond.value}'`;
            break;
        case 'like':
            op = `${cond.field} like '%${cond.value}%'`;
            break;
        case 'notlike':
        case 'not like':
            op = `${cond.field} not like '%${cond.value}%'`;
            break;
        case 'sw':
            op = `${cond.field} like '${cond.value}%'`;
            break;
        case 'notsw':
        case 'not sw':
            op = `${cond.field} not like '${cond.value}%'`;
            break;
        case 'ew':
            op = `${cond.field} like '%${cond.value}'`;
            break;
        case 'notew':
        case 'not ew':
            op = `${cond.field} not like '%${cond.value}'`;
            break;
        case 'empty':
            op = `(${cond.field} is null or ${cond.field}='' or ${cond.field}=0)`;
            break;
        case 'notempty':
        case 'not empty':
            op = `(${cond.field} is not null and ${cond.field}!='' and ${cond.field}!=0)`;
            break;
        case 'in':
            if (Array.isArray(cond.value)) {
                vals = "'" + cond.value.join("','") + "'";
            } else {
                vals = "'" + cond.value + "'";
            }
            op = `${cond.field} in (${vals})`;
            break;
        case 'notin':
        case 'not in':
            if (Array.isArray(cond.value)) {
                vals = "'" + cond.value.join("','") + "'";
            } else {
                vals = "'" + cond.value + "'";
            }
            op = `${cond.field} not in (${vals})`;
            break;
        default:
            op = `${cond.field} ${cond.operation} '${cond.value}'`;
            break;
    }
    return op;
}

const getCbFilterQuery = (filter: any) => {
    let search: string = '';
    let prevglue = '';
    let apglue = '';
    let prevgroup = 'notsetyet';
    let group = '';
    for (const element of filter) {
        let cond = element;
        if (prevgroup === 'notsetyet') {
            prevgroup = cond.group;
        }
        let op = findOperation(cond);
        if (prevgroup !== cond.group) {
            search += (search === '' ? '' : prevglue) + ' (' + group + ')';
            group = op;
            apglue = prevglue;
            prevgroup = cond.group;
        } else {
            group += ` ${prevglue} ${op}`;
        }
        prevglue = cond.glue;
    }
    search += (search === '' ? group : ' ' + apglue + ' (' + group + ')');
    return search;
}

const convertFilter2Query = (filter: any, joinConditionValue: string, resource: string, relatedModule: string = '') => {
    const joinCondition = joinConditionValue || 'OR';
    let search: string = '';
    if (!Array.isArray(filter)) { // react admin filter format
        if (typeof filter == 'object') {
            search = ' where ' + getRaFilterQuery(filter, resource, relatedModule, joinCondition);
        }
        return search;
    }
    search += getCbFilterQuery(filter);
    return (search === '' ? '' : ' where (' + search + ') ');
}

const execQuery = (resource: string, quesrParams: any, additionalWhereClause?: any, searchingFields?: any) => {
    const { filter, ...params } = quesrParams;
    const { relatedModule, extraFields, moduleRelationType, joinCondition, ...restFilters } = filter;
    let query: string = '';
    let where: string = '';
    let searchFields = searchingFields || extraFields;
    searchFields = searchFields ?? '*';
    query = `select ${searchFields} from ${resource}`;
    if (filter && Object.keys(filter).length) {
        let filters: any = {};
        if (moduleRelationType && moduleRelationType === 'N:N') {
            filters = Object.entries(restFilters).map((arrKey) => {
                return ({ field: arrKey[0] ? arrKey[0] : `Related.${relatedModule}`, value: arrKey[1], operation: 'equal', glue: joinCondition ?? 'OR', group: 1 });
            });
        } else {
            filters = restFilters;
        }
        where = convertFilter2Query(filters, params.joinCondition ?? 'OR', resource, relatedModule);
    }

    if (!additionalWhereClause) {
        query += where;
    } else {
        query += where !== '' ? where + " and " + additionalWhereClause : ' where ' + additionalWhereClause;
    }


    let { field, order } = params.sort;
    field = field || '';
    order = order || '';
    if (field !== '') {
        query += appendOrder(field, order);
    }

    let { page, perPage } = params.pagination;
    if (perPage) {
        page = page || 1;
        query += appendPagination(page, perPage);
    }

    query = encodeURIComponent(query);
    return cbconn.doQueryWithTotal(query).then((data: any) => {
        return { 'data': data.result, 'total': Number(data.totalrows) }
    }).catch((er: any) => {
        return { data: [], total: 0 }
    })
}

export const appendPagination = (pageNumber: number, perPage: number) => {
    const page = pageNumber || 1;
    return ' limit ' + ((page - 1) * perPage) + ',' + perPage;
};

export const appendOrder = (field: any, order: string) => {
    return ' order by ' + field + ' ' + order;
};

const dataProvider: DataProvider = {
    getList: async (resource: string, params: any, additionalWhereClause?: string, additionalFields?: any) => {
        params = {
            ...params,
            joinCondition: 'AND'
        };
        return execQuery(resource, params, additionalWhereClause, additionalFields)
    },

    getOne: (resource: string, params: any) =>
        cbconn.doRetrieve(params.id)
            .then((data: any) => { return { 'data': data } })
    ,

    getMany: (resource: string, params: any) =>
        cbconn.doMassRetrieve(params.ids)
            .then((data: any) => {
                let d = [];
                for (const value of Object.values(data)) {
                    d.push(value);
                }
                const result: any = { 'data': d };
                return result;
            }),

    getManyReference: (resource: string, params: any) => {
        return execQuery(resource, params)
    },

    update: (resource: string, params: any) =>
        cbconn.doUpdate(resource, params.data)
            .then((data: any) => { return { 'data': data } })
    ,

    updateMany: (resource: string, params: any) =>
        cbconn.doInvoke('MassUpdate', JSON.stringify(params.data))
            .then((data: any) => { return { 'data': data } })
    ,

    create: (resource: string, params: any) =>
        cbconn.doCreate(resource, params.data)
            .then((data: any) => { return { 'data': data, id: data['id'] } })
    ,

    delete: (resource: string, params: any) =>
        cbconn.doDelete(params.id)
            .then((data: any) => { return { 'data': data } })
    ,

    deleteMany: (resource: string, params: any) =>
        cbconn.doMassDelete(params.ids)
            .then((data: any) => { return { 'data': data } })
};

export default dataProvider;

