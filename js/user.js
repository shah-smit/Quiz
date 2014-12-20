$(function () {

    if (!Modernizr.localstorage) return;
    var ls = localStorage;

    function insStats() {
        $stats = $('.stats');
        $stats.find('.username').html(ls.username);
        $stats.find('.games .number').html(ls.games);
        $stats.find('.hscore .number').html(ls.hscore);
        $('#side .main').html('Profile');
    }

    ls.length ? insStats() : $('#side .main').html('Create Profile');

    $('.main').click(function () {
        ls.length ? $('.stats').toggle("fast") : $('.create').toggle("fast");
        $(this).toggleClass('under');
    });

    $('.go').click(function () {
        var un = $(this).parent().find('input').val();
        if (!un) return;
        ls.username = un;
        ls.games = 0;
        ls.hscore = 0;

        insStats();

        $('.create').toggle('fast');
        $('.stats').toggle('fast');
    });

});