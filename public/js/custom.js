$(document).ready(function(){
	
	//alerts
	setTimeout(function(){ $('.alert_cvr').fadeOut() }, 5000);

	$('.list-syllabus__view-more').on('click', function(){
		$('.list-syllabus').addClass('list-syllabus--show');
	})

	$('#downloads_submit').prop('disabled', true);

	$('#grade_select').on('change', function(){

		let gradeval = $(this).val();
		$.ajax({
			type:'GET',
			url: `/ajax/downloads/${gradeval}/grade`,
			success: function(response){
				if(!response.length){
					clearSelect('#course_select');
					$('#course_select')
						.append($("<option></option>")
		                    .attr("value", "")
		                    .text("Nothing Found"));
					$('input[name="modeltype"]:checked').prop('checked', false);
					$('#no_paper_para').hide();
				} else {
					clearSelect('#course_select');
					$('#course_select')
						.append($("<option></option>")
		                    .attr("value", response[0]._id)
		                    .text(response[0].name));
					$('input[name="modeltype"]:checked').prop('checked', false);
					$('#no_paper_para').hide();
					$('#year_field').hide();
					$('#paper_type_field').hide();
				}

				
			},
			error: function(err){
				console.log(err)
			}
		})

	})

	function clearSelect(id){
		let displayName;
		if(id == '#course_select'){
			displayName = 'Course';
		} else if(id == '#year_select'){
			displayName = 'Year';
		} else if(id == '#paper_type_select'){
			displayName = 'Paper Type';
		}
		$(id).html('');
		$(id)
		.append($("<option></option>")
            .attr("value", "")
            .text(displayName));
	}

	$('#course_select').on('change', function(){
		$('input[name="modeltype"]:checked').prop('checked', false);
		$('#year_field').hide();
		$('#paper_type_field').hide();
	})

	$('.modeltypeinput').click(function(){
		if($(this).val() == 'previousyear'){
			let gradeVal = $('#grade_select').val();
			let courseVal = $('#course_select').val();

			$.ajax({
				type: 'GET',
				url: `/ajax/downloads/${gradeVal}/${courseVal}/previousyear/course`,
				success: function(response){
					if(!response.length){
						$('#year_field').hide();
						$('#no_paper_para p').text('No Prevous Year Paper Found');
						$('#no_paper_para').show();
					} else {
						$('#no_paper_para').hide();
						$('#year_field').show();
						clearSelect('#year_select');
						$.each(response, function(key, value) {
							$('#year_select')
							.append($("<option></option>")
			                    .attr("value", value._id)
			                    .text(value.year));
						});

						
					}
				},
				error: function(err){
					console.log(err);
				}
			})
		} else {
			let gradeVal = $('#grade_select').val();
			let courseVal = $('#course_select').val();

			$.ajax({
				type: 'GET',
				url: `/ajax/downloads/syllabus/${gradeVal}/${courseVal}/course`,
				success: function(response){
					if(!response.length){
						$('#year_field').hide();
						$('#no_paper_para p').text('No Syllabus Paper Found');
						$('#no_paper_para').show();
					} else {
						$('#no_paper_para').hide();
						$('#year_field').hide();
						$('#downloads_submit').prop('disabled', false);
					}
				},
				error: function(err){
					console.log(err);
				}
			})
		}
	})

	$('#year_select').on('change', function(){
		let year_id = $(this).val();

		let gradeVal = $('#grade_select').val();
		let courseVal = $('#course_select').val();
		let modelType = $('input[name="modeltype"]:checked').val();

		if(year_id != ''){
			$.ajax({
				type: 'GET',
				url: `/ajax/downloads/${gradeVal}/${courseVal}/${year_id}/${modelType}/papertype`,
				success: function(response){
						$('#paper_type_field').show();
						clearSelect('#paper_type_select');
						$.each(response, function(key, value) {
							$('#paper_type_select')
							.append($("<option></option>")
			                    .attr("value", value.paperType)
			                    .text(value.paperType));
						});
					
				},
				error: function(err){
					console.log(err);
				}
			})
		}
	})

	$('#paper_type_field').on('change', function(){
		$('#downloads_submit').prop('disabled', false);
	})

	function fixDiv() {
	    var $cache = $('.list-catag .row .column-left__item', '.sidebar-left #menu-left');
	    if($(window).scrollTop() > $(document).height() - 1300){
	    	$cache.css({
	        'position': 'relative',
	        'top': 'auto'
	      });
	    } else if ($(window).scrollTop() > 120)
	      $cache.css({
	        'position': 'fixed',
	        'top': '100px'
	      });
	    else 
	      $cache.css({
	        'position': 'relative',
	        'top': 'auto'
	      });
	  }
	$(window).scroll(fixDiv);
	fixDiv();

	function fixDiv1() {
	    var $cache = $('.sidebar-left #menu-left');
	    if($(window).scrollTop() > $(document).height() - 1300){
	    	$cache.css({
	        'position': 'relative',
	        'top': 'auto'
	      });
	    } else if ($(window).scrollTop() > 120)
	      $cache.css({
	        'position': 'fixed',
	        'top': '100px',
	        'max-width': '270px'
	      });
	    else 
	      $cache.css({
	        'position': 'relative',
	        'top': 'auto'
	      });
	 }
	$(window).scroll(fixDiv1);
	fixDiv1();


	$("#searchInput").on("keyup", function() {
		$(".search_drop_cvr").css("display", "block");
	    var value = $(this).val().toLowerCase();
	    $(".search_drop_cvr li a").filter(function() {
	      $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
	    });
	});


	$("#searchInput").focusout(function(){
		setTimeout(function(){
			$(".search_drop_cvr").css("display", "none");
		}, 1000)
	    
	});

})







