function bdrawer_touchstart (e) { 
    // only allow drawer open on button press
    window.g_NoOpen = false;
}

function preventOpen(e) {
    // prevent drawer open on non-button press actions (i.e. swipe action)
    if (window.g_NoOpen == true) {
        e.preventDefault();
    }
    window.g_NoOpen = true;
}            


(function (global) {
    var app = global.app = global.app || {},
        os = kendo.support.mobileOS,
        statusBarStyle = os.ios && os.flatVersion >= 700 ? "black-translucent" : "black";

    document.addEventListener('deviceready', function () {
        navigator.splashscreen.hide();
    }, false);
    app.application = new kendo.mobile.Application(document.body, { layout: "drawer-layout", statusBarStyle: statusBarStyle });
    

//    function onChage() {
//        $("#dpw1class").html(kendo.render(template, this.view()));
//    }

    // create a template using the above definition
//    var template = kendo.template($("#template").html());
        
})(window);