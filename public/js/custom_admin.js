//sciprt for admin panel

$(document).ready(function(){

	$('.upload_doc').click(function(){
		$('#choose').trigger('click');
	})
	$('#choose').on('change', function(){
		$('#file_text').text('');
		$('#file_text').text($(this).val());
	})

	//alerts
	setTimeout(function(){ $('.alert_cvr').fadeOut() }, 5000);
	
	//form submit button disable
	$('form').submit(function(){
		$(this).find('button[type=submit], .cancel_btn').attr('disabled','disabled');
	    $(this).find('.form_loader').css('display','inline-block');
	    return true;
	});

	$('.paper_type').click(function(){
		let type = $(this).val();
		(type == 'previousyear') ? $('#year_row , #paper_type_row').show() : $('#year_row , #paper_type_row').hide()
	})

	$('.delete_appl').click(function(){
		var delConfir = window.confirm('Please confirm to delete this file.');

		if(delConfir){
			var bookId = $(this).attr('data-id');
			$.ajax({
				type:'GET',
				url: `/admin/downloads/${bookId}/delete`,
				success: function(response){
					if(response){
						location.reload();
					}
				},
				error: function(err){
					console.log(err)
				}
			})
		}
	})

})

