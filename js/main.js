requirejs.config({
    paths: {
        'jquery.easing.min' : 'js/libs/jquery.easing.min',
        'jquery.mousewheel' : 'js/libs/jquery.mousewheel',
        'TweenLite.min' : 'js/libs/TweenLite.min',
        'jquery.gsap.min' : 'js/libs/jquery.gsap.min',
        'CSSPlugin.min' : 'js/libs/CSSPlugin.min',
        'jquery.lib' : 'js/libs/jquery.lib',
        'others' : 'js/others',
        'key-events' : 'js/key-events',
        'tableview' : 'js/tableview'
    },
    urlArgs: "bust=" +  (new Date()).getTime()
});

require(['jquery.easing.min', 'jquery.mousewheel', 'TweenLite.min', 'jquery.gsap.min', 'CSSPlugin.min', 'jquery.lib', 'others', 'key-events', 'tableview'], function(){
    unit_test();
});

function fun (t, e) {
    t[2].insert_last("html_" + e, +new Date(), []);
    // console.log(e);
    e += 1;
    setTimeout(function() {
        fun(t, e);
    }, Math.ceil(Math.random() * 10) * 300);
}

function unit_test () {
    // var ls = ["a", "b", "c"];
    var ls = ["a"];
    var t = [];
    $.each(ls, function(i, v) {
        t[i] = new TableView($(".view_" + v), "test_view_" + v);
    });
    // $.each(ls, function(i, v) {
    //     $.each(new Array(200), function(n) {
    //         t[i].insert("html_" + v + "_" + n, n + "00" + v, n, []);
    //     });
    // });

    var c = 0;
    setInterval(function() {
        var index = Math.round(Math.random() * c);
        console.log(index);
        t[0].insert("html_" + c, +new Date(), index, []);
        c += 1;
    }, 2000);

    // var d = 0;
    // setInterval(function() {
    //     t[0].insert_last("html_" + d, +new Date(), []);
    //     // console.log(d);
    //     d += 1;
    // }, 1000);

    // var e = 0;
    // fun(t, e);
}
