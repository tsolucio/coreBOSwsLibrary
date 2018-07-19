function transformFillSearchObject(types) {
    var input = {};
    var rpc = {};
    var parameters = [];
    var options = [];
    var spec = {};
    input.name = "torealtearray";
    input.type = "array";
    input.label = "Relate To";

    rpc.url = "rpc://RpcQueryData";
    rpc.label = "Search";


    for (let i = 0; i < types.length; i++) {
        options[i] = {
            value: types[i],
            label: types[i],
        }

    }
    parameters[0] = {
        name: "searchModule",
        type: "select",
        label: "Element type",
        options: options
    }

    rpc.parameters = parameters;
    spec.type = "text";
    spec.rpc = rpc;
    input.spec = spec;

    return (input);
}