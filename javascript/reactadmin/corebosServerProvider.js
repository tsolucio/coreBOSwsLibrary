import * as cbconn from 'corebos-ws-lib/WSClientm';

const apiUrl = 'http://localhost/coreBOSwork';
cbconn.setURL(apiUrl);
cbconn.doLogin('admin', 'admin', true);

function convertFilter2Query(filter) {
    let search = '';
    if (!Array.isArray(filter)) {
        if (typeof filter == 'object') {
            for (let [key, value] of Object.entries(filter)) {
                search += (search==='' ? '' : ' OR ')+`${key} like '%${value}%'`;
            }
            search = ' where ' + search;
        }
        return search;
    }
    let vals = '';
    let prevglue = '';
    let apglue = '';
    let prevgroup = 'notsetyet';
    let group = '';
    for (let c=0; c<filter.length; c++) {
        let cond = filter[c];
        if (prevgroup === 'notsetyet') {
            prevgroup = cond.group;
        }
        let op = '';
        switch (cond.operation) {
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
                    vals = "'"+cond.value.join("','")+"'";
                }else {
                    vals = "'"+cond.value+"'";
                }
                op = `${cond.field} in (${vals})`;
                break;
            case 'notin':
            case 'not in':
                if (Array.isArray(cond.value)) {
                    vals = "'"+cond.value.join("','")+"'";
                }else {
                    vals = "'"+cond.value+"'";
                }
                op = `${cond.field} not in (${vals})`;
                break;
            default:
                op = `${cond.field} ${cond.operation} '${cond.value}'`;
                break;
        }
        if (prevgroup !== cond.group) {
            search += (search==='' ? '' : prevglue) + ' (' + group + ')';
            group = op;
            apglue = prevglue;
            prevgroup = cond.group;
        } else {
            group += ` ${prevglue} ${op}`;
        }
        prevglue = cond.glue;
    }
    search += (search==='' ? group : ' ' + apglue + ' (' + group + ')');
    return (search==='' ? '' : ' where' + search);
}

function execQuery(resource, params) {
    let query = '';
    query = 'select * from '+resource;
    if (params.filter && Object.keys(params.filter).length) {
        query += convertFilter2Query(params.filter);
    }
    let { field, order } = params.sort;
    field = field || '';
    order = order || '';
    if (field !== '') {
        query += ' order by ' + field + ' ' + order;
    }
    let { page, perPage } = params.pagination;
    if (perPage) {
        // perPage = perPage || 25;
        page = page || 1;
        query += ' limit ' + ((page - 1) * perPage) + ',' + perPage;
    }
    query = encodeURIComponent(query);
    return cbconn.doQueryWithTotal(query)
        .then((data) => { return { 'data': data.result, 'total': Number(data.totalrows) } });
}

export default {
    getList: async (resource, params) => {
        return execQuery(resource, params)
    },

    getOne: (resource, params) =>
        cbconn.doRetrieve(params.id)
            .then((data) => { return { 'data': data } })
    ,

    getMany: (resource, params) =>
        cbconn.doMassRetrieve(params.ids)
            .then((data) => {
                let d = [];
                Object.keys(data).forEach((key, val) => d.push(val));
                return { 'data': d }
            }),

    getManyReference: (resource, params) => {
        return execQuery(resource, params)
    },

    update: (resource, params) =>
        cbconn.doUpdate('Accounts', params.data)
            .then((data) => { return { 'data': data } })
    ,

    updateMany: (resource, params) =>
        cbconn.doInvoke('MassUpdate', JSON.stringify(params.data))
            .then((data) => { return { 'data': data } })
    ,

    create: (resource, params) =>
        cbconn.doCreate('Accounts', params.data)
            .then((data) => { return { 'data': data, id: data['id'] } })
    ,

    delete: (resource, params) =>
        cbconn.doDelete(params.id)
            .then((data) => { return { 'data': data } })
    ,

    deleteMany: (resource, params) =>
        cbconn.doMassDelete(params.ids)
            .then((data) => { return { 'data': data } })
};

