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

function unit_test () {
    var t = new TableView($(".table_view"), "test_view");
    $.each(new Array(15), function(i, v) {
        t.insert("html" + i, i + "00", i, []);
    });
    t.cursor.move(5);
    t.cursor.next();
    // t.item("900").remove();
    // t.find(":contains(html5)").remove();
    console.log(t);
}
