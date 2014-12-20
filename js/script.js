$(function () {
    var looper = 0; // looper counter keeps track of current question
    var answers = [];
    var questions;
    var transTime = 500; //Time in ms for wrapper transition time
    var H = Handlebars;
    var ls = localStorage;

    function toggleSelected(id){
        $('label[for='+id+'] li').toggleClass('selected');
    }

    function quizLoop() {

        //Show end screen if questions finished
        if (looper >= questions.length) {
            displayEnd();
            return;
        }

        var tempObj = questions[looper]; //object with q, options and answer

        // Display question number and question
        $('#question').html('<span class="number">Q' + (looper+1) + '. </span>' + tempObj.question);

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
            $('label[for=' + answers[looper] + '] li').toggleClass('selected')
            .find('input')[0].checked = true;
            previd = answers[looper];
        }

        // bring wrapper down
        $('#question_wrap').fadeIn(transTime);
    }


    function displayEnd() {
        var score = 0;

        $("#next_button").hide();
        $('#question_wrap').hide();
        $('#title').text('Results');
        $('#wrapper').append('<div id="results"></div>');

        var i;
        var correct;
        // Cache template before loop to avoid re-searching and compiling of
        // template.
        var templ_result = H.compile($('#templ-result').html());
        for (i = 0; i < questions.length; i++) {
            // If answer is correct, score is incremented and correct is set to
            // true. Otherwise correct is set to false, leaving the score as it
            // is.
            correct = answers[i] === questions[i].correctAnswer ? (score++,true) : false;

            // Put individual result template into DOM
            $('#results').append(templ_result({
                message: correct ? "Correct" : "Incorrect",
                question_num: i + 1,
                colour: correct ? "green" : "red",
                correct: correct,
                question: questions[i].question
            }));
        }

        // Display final score and rounded percentage
        var percentage = Math.round((score / questions.length) * 100);

        // more Mustache to put in score and restart button
        var templ_score = H.compile($('#templ-score').html());
        $('#wrapper').append(templ_score({
            score: score,
            no_qs: questions.length,
            percentage: percentage
        }));

        //Hide results on creation to later transition in
        $('.result').hide();
        $('.score').hide();

        $('#question_wrap').show("blind", transTime, function () {
            $('.score').show("fade");
            $("#results div").first().show("fast", function showNext() {
                $(this).next("div").show("fast", showNext);
            });
        });

        ls.hscore = score > ls.hscore ? score : ls.hscore;
        ls.games++;

        // Add event listener to restart button
        $('#restart').click(function () {
            window.location.href = window.location.href
        });
    }

    function swapQ(n) {
        $('#question_wrap').fadeOut(transTime, function () {
            $('#question').html('');
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

    $('#back_button').click(goBack);
    $('#next_button').click(addAns);

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
            'rand': [0, 0, 0, 0, 0, 0, 0],
            'correct': [1, 0, 0, 1, 2, 0, 0],
            'wrong': [0, 1, 1, 0, 0, 1, 1]
        }
        answers = cases[mode];
        if (!answers) console.error('Invalid EndScreen test mode');
    };
    //testEndScreen('rand');
    /**************************/
});