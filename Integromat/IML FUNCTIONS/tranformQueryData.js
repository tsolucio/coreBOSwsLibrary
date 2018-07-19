function tranformQueryData(item) {
    var label = "";
    var i = 0;

    for (var key in item) {
        if (i > 0) {
            label += item[key] + " ";
        }
        i++;
    }
    return label;
}