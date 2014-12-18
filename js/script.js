/*global Handlebars */
$(document).ready(function () {
    // Global vars
    var looper = 0; // looper counter keeps track of current question
    var answers = [];
    var questions;
    var transTime = 1e3; //Time in ms for wrapper transition time
    var H = Handlebars;

    function quizLoop() {

        // Show end screen if questions finished
        if (looper >= questions.length) {
            displayEnd();
            return;
        }
        var tempObj = questions[looper];

        // Display question number and question
        $('#question').html('<span class="number">Q' + (looper + 1) + '. </span>' + tempObj.question);

        // Create options
        var templ_choice = H.compile($('#templ-choice').html());
        $('#choices').append(templ_choice(tempObj.choices));

        // Make option highlighting method
        var previd;
        var id;
        $('input[type=radio][name=option]').change(function () {
            id = $('input:radio:checked').attr('id');
            if (previd !== undefined) {
                $('label[for=' + previd + '] li').toggleClass('selected');
            }
            $('label[for=' + id + '] li').toggleClass('selected');
            previd = id;
        });

        // Check if question already has answer and highlight it
        if (answers[looper]) {
            $('label[for=' + answers[looper] + '] li').toggleClass('selected');
            $('input:radio[id=' + answers[looper] + ']').each(function () {
                this.checked = true;
            });
            previd = answers[looper];
        }

        // bring wrapper down
        $('#wrapper').show("blind", transTime, function () {
            $('.button').show("fast");
        });
    }


    function displayEnd() {
        var score = 0;

        $("#next_button").hide();
        $('#question_wrap').hide();
        $('#title').text('Results');
        $('#wrapper').append('<div id="results"></div>');

        // Compare answers to correct answers
        var i;
        var correct;
        var templ_result = H.compile($('#templ-result').html());
        for (i = 0; i < questions.length; i++) {
            correct = false;
            if (answers[i] === questions[i].correctAnswer) {
                correct = true;
                score++;
            }

            // Mustache rendering to put in result
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

        $('#wrapper').show("blind", transTime, function () {
            $('.score').show("fade");
            $("#results div").first().show("fast", function showNext() {
                $(this).next("div").show("fast", showNext);
            });
        });

        // Add event listener to restart button
        $('#restart').click(function () {
            $('#wrapper').hide("blind", transTime, function () {
                looper = 0;
                answers = [];
                $('#title').text('QUIZ');
                $('#question_wrap').show();
                $('.score').remove();
                $('#results').remove();
                $('#restart').remove();
                $('#question').html('');
                $('#choices').html('');
                quizLoop();
            });
        });
    }

    function hideWrapper(n) {
        $('#wrapper').hide("blind", transTime, function () {
            $('#question').html('');
            $('#choices').html('');
            looper += n;
            quizLoop();
        });
    }

    function addAns() {
        // Check an answer is chosen
        if (!$("input:radio:checked").length) {
            window.alert("Select an answer!");
        } else {
            answers[looper] = +$("input:radio:checked").attr("value");
            hideWrapper(1);
        }
    }

    function goBack() {
        // If user is at beginning, do nothing
        looper && hideWrapper(-1);
    }

    $('#back_button').click(goBack);
    $('#next_button').click(addAns);

    // Request questions from JSON file
    $.getJSON("js/questions.json", function (data) {
        questions = data.questions;
    }).done(function () {
        quizLoop();
    }).fail(function () {
        window.alert('Sorry, there was a problem!');
    });

    /******** DEV ONLY *********/
    function testEndScreen(mode) {
        if (mode === 'rand') {
            answers = [0, 0, 0, 0, 0, 0, 0];
        } else if (mode === 'correct') {
            answers = [1, 0, 0, 1, 2, 0, 0];
        } else if (mode === 'wrong') {
            answers = [0, 1, 1, 0, 0, 1, 1];
        } else {
            console.error('Invalid EndScreen test mode');
        }
        looper = 7;
    };
    //testEndScreen('rand');
    /**************************/

});