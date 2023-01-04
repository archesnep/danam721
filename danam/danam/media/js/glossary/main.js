$(document).ready(function(){
	//$('.text-term').richText();
	//$('.text-description').Editor();
	//reset();
	
	var _img_link = "";
	var _thumb = "";
	var _heidicon_link = "";	
	let divImg = document.getElementById('div-image');
	var btnRemove = document.getElementById("removeimage");
	btnRemove.style.visibility = "hidden";
	tinymce.init({
    selector: 'textarea',
    width: 800,
	height: 500,
	resize: false,
	plugins: [
    "advlist anchor autolink codesample fullscreen help image imagetools",
    " lists link media noneditable preview",
    " searchreplace table template visualblocks wordcount"
	],
    toolbar:
    "insertfile a11ycheck undo redo | bold italic | forecolor backcolor | template codesample | alignleft aligncenter alignright alignjustify | bullist numlist | link image tinydrive",
	
    });
	//console.log(tinymce.get("text-desc").getContent());
	
	$('.reset-terms').click(function(){
		//console.log(tinymce.get("text-desc").getContent());
		//console.log(_img_link);
		reset();
		//let test = JSON.stringify($('.text-description'))
		//alert($('.text-description').Editor("getText"));
		
		/*
		$.ajax({
			type: "GET",
			url: "/glossary/more/",
			success: function(data){
				for (i= 0; i < data.length; i++){
					$('ul').append('<li>' + data[i] + '</li>');
				}
			}
		});
		*/
	});
	$('.removeimage').click(function(){
		
		divImg.innerHTML = ""; 
		
		img_link = null;
		thumb = null;
		heidicon_link = null;
		btnRemove.style.visibility = "hidden";
	
	
	
	});	
	//AJAX POST
	$('.add-glossary').click(function(){
		
		try{
			_img_link = img_link;
		}catch (e){
			if (e instanceof ReferenceError) {
				// do nothing
			}
			else{
				console.log(e)
			}
		}
		
		try{
			_thumb = thumb;
		}catch (e){
			if (e instanceof ReferenceError) {
				// do nothing
			}
			else{
				console.log(e)
			}
		}
		try{
			_heidicon_link = heidicon_link;
		}catch (e){
			if (e instanceof ReferenceError) {
				// do nothing
			}
			else{
				console.log(e)
			}
		}
		console.log(_img_link);
		$.ajax({
			type: "POST",
			url: "/glossary/add/",
			dataType: 'json',
			
				data: {"term-roman": $('.text-term-roman').val(), "term-dev": $('.text-term-dev').val(), "image_link": _img_link, "thumb": _thumb, "heidicon": _heidicon_link,
					"description": tinymce.get('text-desc').getContent()},//$('.text-description').Editor("getText")},
					
			success: function(data){
				alert(data.message);
				reset();
				
			}
		});

	});
	
	
	function reset(){
		//$('.text-description').Editor('');
		//$('.text-description').Editor("setText", "");
		tinymce.get('text-desc').setContent('');
		$('.text-term-roman').val('');
		$('.text-term-dev').val('');
		$('.div-img').html('');
		btnRemove.style.visibility = "hidden";
	
	}
	
	//CSRF code
	function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
	var csrftoken = getCookie('csrftoken');
	function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
}
	$.ajaxSetup({
		beforeSend: function(xhr, settings) {
			if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
				xhr.setRequestHeader("X-CSRFToken", csrftoken);
			}
		}
	});


});