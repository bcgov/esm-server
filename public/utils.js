
function scroll_style() {
    var window_top = $(window).scrollTop();
    var div_top = $('#anchor-point').offset().top;

    if (window_top > div_top){
        $("#header").addClass("dark");
    } else {
        $("#header").removeClass("dark");
    }
}

$(function() {
    $(window).scroll(scroll_style);
    scroll_style();
});