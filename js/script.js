$(function () {
    var looper = 0, // looper counter keeps track of current question
        answers = [],
        questions,
        transTime = 300, //Time in ms for wrapper transition time
        H = Handlebars,
        ls = localStorage,

    //Cache DOM
        $wrapper = $('#wrapper'),

        $Qwrap = $wrapper.find('#question_wrap'),
        $question = $Qwrap.find('#question'),
        $back = $Qwrap.find('#back_button'),
        $next = $Qwrap.find('#next_button'),
        $fb = $back.add($next),

        $results = $wrapper.find('#results'),
        $score = $wrapper.find('.score'),
        $restart = $wrapper.find('#restart'),
        $title = $wrapper.find('#title');

    function initUser() {
        if (!Modernizr.localstorage) return;

        $stats = $('.stats'),
        $create = $('.create'),
        $main = $('#side .main');

        function insStats() {
            $stats.find('.username').html(ls.username);
            $stats.find('.games .number').html(ls.games);
            $stats.find('.hscore .number').html(ls.hscore);
            $main.html('Profile');
        }

        function submitUser() {
            var un = $(this).parent().find('input').val();
            if (!un) {
                alert('Enter a username!');
                return;
            }
            ls.username = un;
            ls.games = 0;
            ls.hscore = 0;

            insStats();

            $create.toggle('fast');
            $stats.toggle('fast');
        }

        if (ls.length) {
            insStats();
            $stats.toggle("fast")
        } else {
            $main.html('Create Profile')
            $create.toggle();
        }

        $('.go').click(submitUser);

    };
    initUser();

    function message(m) {
        // slide in message box
        // display message for few seconds, possibly w/ effects
        // slide out message box
    }

    function quizLoop() {
        $results.hide();
        $score.hide();
        $restart.hide();

        //Show end screen if questions finished
        if (looper >= questions.length) {
            displayEnd();
            return;
        }
        var tempObj = questions[looper]; //object with q, options and answer

        // Display question number and question
        $question.html('<span class="number">Q'+(looper+1)+'. </span>'+ tempObj.question);

        // Create options
        var templ_choice = H.compile($('#templ-choice').html());
        $('#choices').append(templ_choice(tempObj.choices));

        // Make option highlighting method
        var previd;
        var id;
        $('input[type=radio][name=option]').change(function () {
            id = $('input:radio:checked').attr('id');
            previd === void 0 ? 0 : toggleSelected(previd);
            toggleSelected(id);
            previd = id;
        });

        // Check if question already has answer and highlight it.
        if (answers[looper] !== void 0) {
            toggleSelected(answers[looper]);
            $('.selected').find('input')[0].checked = true;
            previd = answers[looper];
        }

        // bring wrapper down
        $Qwrap.fadeIn(transTime);
    }

    function displayEnd() {
        var score = 0;

        $fb.hide();
        $Qwrap.hide();
        $title.text("Results");
        $results.show();

        var correct;
        // Cache template before loop to avoid re-searching and compiling of
        // template.
        var templ_result = H.compile($('#templ-result').html());
        for (var i = 0; i < questions.length; i++) {
            // If answer is correct, score is incremented and correct is set to
            // true. Otherwise correct is set to false, leaving the score as it
            // is.
            correct = answers[i] === questions[i].correctAnswer ? (score++,true) : false;

            // Put individual result template into DOM
            $results.append(templ_result({
                message: correct ? "Correct" : "Incorrect",
                question_num: i + 1,
                colour: correct ? "green" : "red",
                correct: correct,
                question: questions[i].question
            }));
        }

        // Rounded percentage
        var percentage = Math.round((score / questions.length) * 100);
        // Handlebars to put in score, percenatge and restart button
        var templ_score = H.compile($('#templ-score').html());
        $score.html(templ_score({
            score: score,
            no_qs: questions.length,
            percentage: percentage
        }));

        //Hide results on creation to later transition in
        $('.result').hide();
        $score.hide();

        $("#results div").first().show("fast", function showNext() {
            $(this).next("div").show("fast", showNext);
        });
        $score.fadeIn();
        $restart.fadeIn();

        // If new high score, set in localStorage and increment game count
        ls.hscore = score > ls.hscore ? (window.alert('New high score!'),score) : ls.hscore;
        ls.games++;
        // Add these numbers to DOM
        $('.games .number').html(ls.games);
        $('.hscore .number').html(ls.hscore);
    }

    function toggleSelected(id){
        $('label[for='+id+'] li').toggleClass('selected');
    }

    function swapQ(n) {
        $Qwrap.fadeOut(transTime, function () {
            $question.html('');
            $('#choices').html('');
            looper += n;
            quizLoop();
        });
    }

    function addAns() {
        // Check an answer is chosen
        if ($("input:radio:checked").length) {
            answers[looper] = +$("input:radio:checked").attr("value");
            swapQ(1);
        } else window.alert("Select an answer!");
    }

    function goBack() {
        // If at beginning, do nothng.
        looper && swapQ(-1);
    }

    function restart() {
        looper = 0;
        answers = [];
        $results.html('');
        $score.html('');
        $fb.show();
        $title.text('QUIZ');
        quizLoop();
    }

    $back.click(goBack);
    $next.click(addAns);
    $restart.click(restart);

    // Request questions from JSON file
    $.getJSON("js/questions.json", function (data) {
        questions = data.questions;
    }).fail(function () {
        alert('Sorry, there was a problem!');
    }).done(quizLoop);

    /******** DEV ONLY *********/
    function testEndScreen(mode) {
        looper = 7;
        var cases = {
            'mix': [0, 0, 0, 0, 0, 0, 0],
            'correct': [1, 0, 0, 1, 2, 0, 0],
            'wrong': [0, 1, 1, 0, 0, 1, 1]
        }
        answers = cases[mode];
        if (!answers) console.error('Invalid EndScreen test mode');
    };
    //testEndScreen('mix');
    /**************************/
});