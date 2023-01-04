$(document).ready(function(){
	//$('.text-term').richText();
//$('.text-term').richText();
	//var txtDef = decodeEntities($('#defn').html());
	//var txtDef_html = backtoquote(txtDef);
	var btnRemove = document.getElementById("removeimage");
	//console.log(txtDef_html);
	
	let divImg = document.getElementById('div-image');
	//var uuid = '';
	img_link = '';
	thumb = '';
	heidicon_link = '';
	var uuid = '';
	
	var pageURL = window.location.href;
	var path = window.location.pathname.split('/');
	console.log(path.length);
	var uuid_path = path[path.length-2];
	var originaltitle = document.title.concat(' Modify - ');
	
	$.ajax({
		type: "GET",
		url: "/glossary/api/".concat(uuid_path),
		//data: { get_param: 'value' },
		dataType: 'json',
		cache: false,
		success: function (data) {
			document.title = originaltitle.concat(data['preflabel']);
			uuid = data['uuid'];
			$('.text-term-roman').val(data['preflabel']);
			$('.text-term-dev').val(data['altlabel']);
			tinymce.init({
				selector: 'textarea',
				width: 800,
				height: 500,
				resize: false,
				entity_encoding : "raw",
				plugins: [
				"advlist anchor autolink codesample fullscreen help image imagetools",
				" lists link media noneditable preview",
				" searchreplace table template visualblocks wordcount"
				],
				toolbar:
				"insertfile a11ycheck undo redo | bold italic | forecolor backcolor | template codesample | alignleft aligncenter alignright alignjustify | bullist numlist | link image tinydrive",
				setup: function (editor) {
					editor.on('init', function (e) {
					editor.setContent(data['definition']);
				  });
				}
			});
			if (data['thumb']){
				
				divImg.innerHTML = "<div><a href='" + data['Image'] + "' target='_blank'><img class = 'thumb' src='" + data['thumb'] + "'></a></img></div>"
						  + "<div><a href='https://heidicon.ub.uni-heidelberg.de/detail/" 
				+ data['heidicon'] + "' target='_blank'>open in heidICON.....</a></div>"; 
				thumb = data['thumb'];
				img_link = data['Image'];
				heidicon_link = data['heidicon'];
				btnRemove.style.visibility = "visible";
			}
			else{
				divImg.innerHTML = "<div>No image uploaded yet!!!</div>";
				btnRemove.style.visibility = "hidden";

			}
			
			
			
		}
		
	});

/*	
	$.ajax({
			type: "GET",
			url: "/glossary/upload/",
			//data: { get_param: 'value' },
			dataType: 'json',
			success: function(data){
				alert(data.Stringify());
			
			}

	});
*/
	$('.update-glossary').click(function(){

		
		$.ajax({
			type: "POST",
			url: "/glossary/do_update/",
			dataType: 'json',
			data: {"uuid": uuid, "term-roman": $('.text-term-roman').val(), "term-dev": $('.text-term-dev').val(), 
				"description": tinymce.get('text-desc').getContent(), "thumb": thumb, "image_link": img_link, "heidicon": heidicon_link},
				
			
			success: function(data){
				alert(data.message);
				//reset();
				
			}
		});

	});
	
	$('.removeimage').click(function(){
		
		divImg.innerHTML = ""; 
		
		img_link = null;
		thumb = null;
		heidicon_link = null;
		divImg.innerHTML = "<div>No image uploaded yet!!!</div>";
		btnRemove.style.visibility = "hidden";
	
	
	
	});
	function decodeEntities(encodedString) {
		var translate_re = /&(nbsp|amp|quot|lt|gt);/g;
		var translate = {
			"nbsp":" ",
			"amp" : "&",
			"quot": "\"",
			"lt"  : "<",
			"gt"  : ">"
		};
		return encodedString.replace(translate_re, function(match, entity) {
			return translate[entity];
		}).replace(/&#(\d+);/gi, function(match, numStr) {
			var num = parseInt(numStr, 10);
			return String.fromCharCode(num);
		});
	}
	
	function backtoquote(str){
		return str.replace(/u0027/g, "'");
	}
	function unicodeToHtmlCode (str) {
    // replace \u0000 by &#x0000; in the given string
    return str.replace(/\\[uU]([a-fA-F0-9]{4})/g, function(matchedString, group1) {
        return "&#x" + group1 + ";"
		})
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