$(document).ready(function() {

	function quizLoop() {
		// Go through each question
		if (looper < questions.length) {
			var tempObj = questions[looper];
			var tempAnswer = tempObj.correctAnswer;

			// Display question number and question
			$('#question').html('<span class="number">Q'+(looper+1)+'. </span>'+tempObj.question);

			// Create options
			for (var j = 0; j < 3; j++) {
				var element = '<label for="'+j+'" ><li><input type="radio" name="option" id="'+j+'" value="'+j+'" />'+tempObj.choices[j]+'</li></label>';
				$('#choices').append(element);
			}

			// Make option highlighting method
			var previd;
			var id;
			$('input[type=radio][name=option]').change(function() {
				id = $('input:radio:checked').attr('id');
			    if (previd === undefined) {
			    	$('label[for='+id+'] li').toggleClass('selected');
			      	previd = id;
			    } else {
			       	$('label[for='+previd+'] li').toggleClass('selected');
			       	$('label[for='+id+'] li').toggleClass('selected');
			       	previd = id;
			    }
			});

			// Check if question already has answer and highlight it
			if(answers[looper]) {
				$('label[for='+answers[looper]+'] li').toggleClass('selected');
				$('input:radio[id='+answers[looper]+']').each(function(){
					this.checked = true;
				});
				previd = answers[looper];
			}
			$('#wrapper').show("blind", transTime, function(){
				$('.button').show("fast");
			});
		} else if (looper == questions.length) {
			// After last question, display end screen
			displayEnd();
		}
	}

	function addAns(){
		// Check an answer is chosen
		if ( !$("input:radio:checked").length ) {
			alert("Select an answer!");
		} else {
			if(answers[looper]){
				if (answers[looper] != $("input:radio:checked").attr("id")) {
					answers.pop();
					answers.push( $("input:radio:checked").attr("value") );
				}
			} else {
				answers.push( $("input:radio:checked").attr("value") );
			}
			$('.button').hide("fast");
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
		$('.button').hide("fast");
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
				msg = "Correct";
				colour = "green";
				score++;
			} else {
				msg = "Incorrect";
				colour = "red";
			}
			// Add div with question number and resut
			$('#results').append('<div class="result">Q'+(i+1)+'. <span class="'+colour+'">'+msg+'</span></div>');
		}
		// Display final score and rounded percentage
		var percentage = Math.round((score/questions.length)*100);
		$('#wrapper').append('<div class="score">Your final score is '+score+' out of '+questions.length+'<br>'+percentage+'%</div>');
		$('#wrapper').append('<div id="restart">&larr; Re-Start Quiz</div>');

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

	var looper = 0; // looper counter keeps track of current question
	var answers = []; //declare answers array
	var transTime = 1000; //Time in ms for wrapper transition time

	$('#back_button').click(goBack);
	$('#next_button').click(addAns);

	// Make array to hold questions then request them from JSON file
	var questions = [];
	$.getJSON("questions.json", function(data) {
		$.each(data.questions, function(key, val) {
			questions.push(val);
		});
	}).done(function(){
		quizLoop();
	}).fail(function(){
		Alert('Sorry, there was a problem!');
	});

});