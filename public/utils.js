// Header
$(window).scroll(function() {    
    var scroll = $(window).scrollTop();

    if (scroll >= 550) {
        $("#header").addClass("dark");
    } else {
        $("#header").removeClass("dark");
    }
});