
window.onload = function(){

    charts.bar.startup();

    function getNewDate(value) {
        return value instanceof Date ? value : new Date(typeof value == 'string' ? value.replace(/-/g, '/') : value);
    }

    function nextMonday(value) {
        value = getNewDate(value);
        value.setDate(value.getDate() + 8 - value.getDay());
        return value;
    }

    var a = nextMonday(new Date()).getDate();

}