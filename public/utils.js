
function scroll_style() {
    var window_top = $(window).scrollTop();
    var div_top = $('#anchor-point');

    if (div_top.length) {
        var anchorPoint = div_top.offset().top;

        if (window_top > anchorPoint - 450) {
            $("#header").addClass("dark");
        } else {
            $("#header").removeClass("dark");
        }
    }
}

$(function() {
    $(window).scroll(scroll_style);
    scroll_style();
});


$(function(){ 
    $('.dropdown-item').click(function() {
        $('#mainNav').collapse('hide');
    });
 });