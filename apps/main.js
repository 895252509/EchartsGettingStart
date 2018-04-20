window.onload = function() {

    var zr = zrender.init(document.getElementById('main'));

    var circle = new zrender.Circle({
        shape: {
            cx: 150,
            cy: 50,
            r: 40
        },
        style: {
            fill: 'none',
            stroke: '#F00'
        }
    });
    circle.on('click', function() {
        var a = this;
    }, circle);
    zr.add(circle);
}

var keys = ["time", "foottype" /*在这里把你的name都写上*/ ];
var str = "";
keys.forEach(function(key) {
    str += search_obj[key];
    str += ",";
})
console.log(str);