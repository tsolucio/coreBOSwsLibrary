import * as cbconn from 'corebos-ws-lib/WSClientm';

const logdata = localStorage.getItem('coreboslogindata');
if (!logdata) {
    cbconn.doLogin('admin', 'admin', true);
} else {
    cbconn.setSession(JSON.parse(logdata));
}

function convertFilter2Query(filter, joinCondition = 'OR') {
    let search = '';
    if (!Array.isArray(filter)) { // react admin filter format
        if (typeof filter == 'object') {
            for (let [key, value] of Object.entries(filter)) {
                let nsrch = [];
                if (key.substr(0, 13)==='cblistsearch_') {
                    let [prefix, module] = key.split('_');
                    let enamefield = window.coreBOS.Describe[module].labelFields;
                    if (enamefield.indexOf(',')!==-1) {
                        let enames = enamefield.split(',');
                        const grprand = Math.floor(Math.random() * 10);
                        for (let sf = 0; sf < enames.length; sf++) {
                            nsrch.push(
                                {
                                    'fieldname':enames[sf],
                                    'operation':'contains',
                                    'value':value,
                                    'valuetype':'raw',
                                    'joincondition': joinCondition,
                                    'groupid':'racblegrp'+grprand,
                                    'groupjoin':'and'
                                }
                            );
                        }
                    } else {
                        nsrch = [{
                            'fieldname':window.coreBOS.Describe[module].labelFields,
                            'operation':'contains',
                            'value':value,
                            'valuetype':'raw',
                            'joincondition': joinCondition,
                            'groupid':'racblgroup',
                            'groupjoin':'and'
                        }];
                    }
                } else if (key.substr(0, 15)==='cbfiltersearch_') {
                    nsrch = JSON.parse(value);
                } else {
                    nsrch = [{
                        'fieldname':key,
                        'operation':'contains',
                        'value':value,
                        'valuetype':'raw',
                        'joincondition': joinCondition,
                        'groupid':'ragroup',
                        'groupjoin':'and'
                    }];
                }
                if (search==='') {
                    search = JSON.stringify(nsrch);
                } else {
                    let osrch = JSON.parse(search);
                    if (osrch[osrch.length-1].joincondition === '') {
                        osrch[osrch.length-1].joincondition = 'or';
                    }
                    osrch[osrch.length-1].groupjoin = 'and';
                    search = JSON.stringify(osrch.concat(nsrch));
                }
            }
            search = ' where ' + search;
        }
        return search;
    }
    // else coreBOS query format
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
    return (search === '' ? '' : ' where ( ' + search + ' ) ');
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
        cbconn.doUpdate(resource, params.data)
            .then((data) => { return { 'data': data } })
    ,

    updateMany: (resource, params) =>
        cbconn.doInvoke('MassUpdate', JSON.stringify(params.data))
            .then((data) => { return { 'data': data } })
    ,

    create: (resource, params) =>
        cbconn.doCreate(resource, params.data)
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

