$(document).ready(function () {
	
    $.ajaxSetup({
        cache: false
    });
    $.ajax({
        type: "GET",
        url: "/download/jsonfile/",
        //data: { get_param: 'value' },
        dataType: 'json',
        cache: false,
        success: function (data) {
			//alert(data.json_files.length);
            for (i = 0; i < data.json_files.length; i++) {
				//alert(data.json_files[i]);
                $(".list").append("<div><a href class='open' filename='" + data.json_files[i] + 
						"'>" + data.json_files[i]+ "</a><div>");

            }

            //}

            $('.open').on("click", function () {

                window.open("/download/downloadfile/" + $(this).attr("filename"));

            });
        }
    });
});
	
