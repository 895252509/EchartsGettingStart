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
    zr.add(circle);
}