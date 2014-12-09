$(document).ready(function() {

	function quizLoop() {

		// Show end screen if questions finished
		if (looper == questions.length) {
			displayEnd();
			return;
		}
		var tempObj = questions[looper];
		var tempAnswer = tempObj.correctAnswer;

		// Display question number and question
		$('#question').html('<span class="number">Q'+(looper+1)+'. </span>'+tempObj.question);

		// Create options
		for (var j = 0; j < 3; j++) {
			var info = {
				num: j,
				choice: tempObj.choices[j]
			}

			var templ_choice = $('#templ-choice').html();
			Mustache.parse(templ_choice);
			var element = Mustache.render(templ_choice, info);
			$('#choices').append(element);
		}

		// Make option highlighting method
		var previd;
		var id;
		$('input[type=radio][name=option]').change(function() {
			id = $('input:radio:checked').attr('id');
		    if (previd !== undefined) {
		       	$('label[for='+previd+'] li').toggleClass('selected');
		    }
		    $('label[for='+id+'] li').toggleClass('selected');
		    previd = id;
		});

		// Check if question already has answer and highlight it
		if(answers[looper]) {
			$('label[for='+answers[looper]+'] li').toggleClass('selected');
			$('input:radio[id='+answers[looper]+']').each(function(){
				this.checked = true;
			});
			previd = answers[looper];
		}

		// bring wrapper down
		$('#wrapper').show("blind", transTime, function(){
			$('.button').show("fast");
		});
	}

	function addAns(){
		// Check an answer is chosen
		if ( !$("input:radio:checked").length ) {
			alert("Select an answer!");
		} else {
			answers[looper ] = $("input:radio:checked").attr("value");
			$('#wrapper').hide("blind", transTime, function(){
				// Remove current question from html
				$('#question').html('');
				$('#choices').html('');
				// Increment loop counter and ask next question
				looper++;
				quizLoop();
			});
		}
	}

	function goBack(){
		// If user is at beginning, do nothing
		if (looper === 0) return;
		// Remove current question from html
		$('#wrapper').hide("blind", transTime, function(){
			$('#question').html('');
			$('#choices').html('');
			// Deccrement loop counter and ask previous question
			looper--;
			quizLoop();
		});
	}

	function displayEnd() {
		var score = 0;
		$("#next_button").hide();
		$('#question_wrap').hide();
		$('#title').html('Results');
		$('#wrapper').append('<div id="results"></div>');

		// Compare answers to correct answers
		for (var i = 0; i < questions.length; i++) {
			var msg;
			var colour;

			if (answers[i] == questions[i].correctAnswer) {
				correct = true;
				colour = "green";
				score++;
			} else {
				correct = false;
				colour = "red";
			}

			var info = {
				message: correct ? "Correct" : "Incorrect",
				question_num: i+1,
				colour: colour,
				correct: correct,
				question: questions[i].question
			}

			// mustache rendering to put in result
			var templ_result = $('#templ-result').html();
			Mustache.parse(templ_result);
			var result = Mustache.render(templ_result, info);
			$('#results').append(result);
			// todo: SHOW ANSWER
		}

		// Display final score and rounded percentage
		var percentage = Math.round((score/questions.length)*100);

		var info = {
			score: score,
			no_qs: questions.length,
			percentage: percentage
		}
		// more mustache to put in score and restart button
		var templ_score = $('#templ-score').html();
		Mustache.parse(templ_score);
		var x = Mustache.render(templ_score, info);
		$('#wrapper').append(x);

		//Hide results on creation then transition them in
		$('.result').hide();
		$('.score').hide();

		$('#wrapper').show("blind", transTime, function(){
			$('.score').show("fade");
			$("#results div").first().show("fast", function showNext(){
					$(this).next("div").show("fast", showNext);
			});
		});

		// Add event listener to restart button
		$('#restart').click(function(){
			$('#wrapper').hide("blind", transTime, function(){
				looper = 0;
				answers = [];
				$('#title').html('QUIZ');
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

	// Global vars
	var looper = 0; // looper counter keeps track of current question
	var answers = [];
	var questions = [];
	var transTime = 1000; //Time in ms for wrapper transition time

	$('#back_button').click(goBack);
	$('#next_button').click(addAns);

	// Request questions from JSON file
	$.getJSON("questions.json", function(data) {
		$.each(data.questions, function(key, val) {
			questions.push(val);
		});
	}).done(function(){
		quizLoop();
	}).fail(function(){
		Alert('Sorry, there was a problem!');
	});

/******** DEV ONLY *********/
	function testEndScreen(mode) {
		if (mode == 'rand') answers = [0,0,0,0,0,0,0];
		else if (mode == 'correct') answers = [1,0,0,1,2,0,0];
		else if (mode == 'wrong') answers = [0,1,1,0,0,1,1];
		else throw new Error('Invalid EndScreen test mode');
		looper = 7;
	}
	//testEndScreen('wrong');
/**************************/

});
