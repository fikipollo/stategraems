function arrayUnique(array, ignore) {
    var a = [];
    ignore = ignore || [];
    for (var i in array){
        if(array[i] && a.indexOf(array[i]) === -1 && ignore.indexOf(array[i]) === -1){
            a.push(array[i]);
        }
    }

    return a;
}
Date.logFormat = function () {
    var date = new Date();
    return date.toUTCString() + " > ";
};
Object.values = function (o) {
    return Object.keys(o).map(function (k) {
        return o[k];
    });
};