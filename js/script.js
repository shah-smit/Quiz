$(function () {
    var looper = 0, // looper counter keeps track of current question
        answers = [],
        transTime = 300, //Time in ms for wrapper transition time
        H = Handlebars,
        ls = localStorage,
        questions,

        //Cache DOM
        $wrapper = $('#wrapper'),

        $Q = $wrapper.find('#question_wrap'),
        $question = $Q.find('#question'),
        $back = $Q.find('#back_button'),
        $next = $Q.find('#next_button'),
        $fb = $back.add($next),


        $results = $wrapper.find('#results'),
        $score = $wrapper.find('.score'),
        $restart = $wrapper.find('#restart'),
        $title = $wrapper.find('#title');
    var $stats = $('.stats'),
        $create = $('.create'),
        $main = $('#side .main');

    function message(m) {
        var $message = $('.message'),
            easing = 'easeInOutCubic',
            t = 500;

        $message
            .animate({ right: '0%' }, t, easing)
            .animate({ height: '70px' }, t, easing, function () {
                $(this).text(m);
            });

        for (var i = 2; i--;) {
            $message
                .animate({ color: 'red' }, t, easing)
                .animate({ color: 'white' }, t, easing);
        }

        $message
            .animate({ color: 'red' }, t, easing)
            .delay(1e3)
            .animate({ height: '2px' }, t, easing, function () {
                $(this).text('');
            })
            .animate({ right: '-105%' }, t, easing);
    }

    function submitUser() {
        var un = $create.find('input').val();
        if (!un && un == undefined) {
            message('Enter a username!');
            return;
        }
        initialise(un);
    }

    function initialise(user)
    {
        ls.username = user;
        ls.games = ls.hscore = 0;

        insStats();

        $create.toggle('fast');
        $stats.toggle('fast');
    }

    function initUser() {
        if (!Modernizr.localstorage) return;

        if (ls.username === []._) {
            insStats();
            $stats.show();
        } else {
            $main.html('Create Profile');
            $create.show();
        }

        $('.go').click(submitUser);
        $create.find('input').keydown(function (e) {
            if (e.keyCode === 13) 
            {
                submitUser();
            }
        });
        
        var temp_user = JSON.stringify(ls.username);
        temp_user = temp_user.replace('"','');
        temp_user = temp_user.replace('"','');
        if(temp_user.trim() != null && temp_user != '')
        {
            initialise(temp_user);
        }
        

    }

    function insStats() {
        $stats.find('.username').html('Welcome, ' + ls.username);
        $stats.find('.games .number').html(ls.games);
        $stats.find('.hscore .number').html(ls.hscore);
        $main.html('Profile');
    }

    function quizLoop(previd) {
        $results.hide();
        $score.hide();
        $restart.hide();

        //Show end screen if questions finished
        if (looper >= questions.length) displayEnd();
        else {

            var tempObj = questions[looper]; //object with q, options and answer

            // Display question number and question
            question_templ = H.compile($('#templ-question').html());
            $question.html(question_templ({
                num: looper + 1,
                q: tempObj.question
            }));

            // Create options
            templ_choice = H.compile($('#templ-choice').html());
            $('#choices').append(templ_choice(tempObj.choices));

            // Make option highlighting method
            $('input[type=radio][name=option]').change(function () {
                id = $('input:radio:checked').attr('id');
                if (previd) toggleSelected(previd);
                toggleSelected(id);
                previd = id;
            });

            // bring wrapper down
            $Q.fadeIn(transTime);

            // Check if question already has answer and highlight it.
            if (answers[looper] ^ []._) {
                toggleSelected(answers[looper]);
                $('.selected').find('input')[0].checked = !0;
                previd = answers[looper];
            }
        }
    }

    function displayEnd() {
        $fb.hide();
        $Q.hide();
        $title.text("Results");
        $results.show();

        var correct;
        // Cache template before loop to avoid re-searching and compiling of
        // template.
        var templ_result = H.compile($('#templ-result').html());
        for (i = score = 0; i < questions.length; i++) {
            // If answer is correct, score is incremented and correct is set to
            // true. Otherwise correct is set to false, leaving the score as it
            // is.
            correct = answers[i] == questions[i].correctAnswer ? (score++ , !0) : !1;

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
        var percentage = (score * 100 / questions.length) + 0.5 | 0;
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
        $score.add($restart).fadeIn();

        // If new high score, set in localStorage and increment game count
        ls.hscore = score > ls.hscore ? (message('New high score!'), score) : ls.hscore;
        ls.games++;
        // Add these numbers to DOM
        $('.games .number').html(ls.games);
        $('.hscore .number').html(ls.hscore);
    }

    function toggleSelected(id) {
        $('label[for=' + id + '] li').toggleClass('selected');
    }

    function swapQ(n) {
        $Q.fadeOut(transTime, function () {
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
        } else message("Select an answer!");
    }

    function goBack() {
        // If at beginning, do nothng.
        if (looper) swapQ(-1);
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
    $restart.click(restart)
    initUser();
    // Request questions from JSON file
    $.getJSON("js/questions.json", function (data) {
        questions = data;
        quizLoop();
    }).fail(function () {
        alert('Sorry, there was a problem!');
    });

    /******** DEV ONLY *********/
    function testEndScreen(mode) {
        looper = questions.length;
        var cases = {
            'mix': [0, 0, 0, 0, 0, 0, 0, 0],
            'correct': [1, 0, 0, 1, 2, 0, 0, 0],
            'wrong': [0, 1, 1, 0, 0, 1, 1, 1]
        };
        answers = cases[mode];
        if (!answers) console.error('Invalid EndScreen test mode');
    }
    //testEndScreen('mix');
    /**************************/
});
