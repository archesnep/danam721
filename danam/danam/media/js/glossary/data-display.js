$(document).ready(function(){
		var pageURL = window.location.href;
		var path = window.location.pathname.split('/');
		console.log(path.length);
		var uuid = path[path.length-2];
		var originaltitle = document.title.concat(' ');
		
	    $.ajax({
			type: "GET",
			url: "/glossary/api/".concat(uuid),
			//data: { get_param: 'value' },
			dataType: 'json',
			cache: false,
			success: function (data) {
				console.log(data['altlabel']);
				document.title = originaltitle.concat(data['preflabel']);
				if (data['thumb']){
					document.getElementById('thumb').src = data['thumb'];
					document.getElementById('image').href = data['Image'];
				}
				document.getElementById('prefLabel').innerHTML = data['preflabel'];
				document.getElementById('altLabel').innerHTML = data['altlabel'];
				document.getElementById('definition').innerHTML = data['definition'];
				if (data['heidicon']){
					//alert(data['heidicon']);
					$(".div-heidicon").append("<a href='https://heidicon.ub.uni-heidelberg.de/detail/" + data['heidicon'] + "' target='_blank'>Link to heidICON for details about the image</a>");
					
				}
				
				
			}
            
		});
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
        beforeSend: function (xhr, settings) {
            if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
                xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }
        }
    });
});