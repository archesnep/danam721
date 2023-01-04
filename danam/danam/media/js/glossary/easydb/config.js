/*
  Configure field ids in the demo version.
  
  @author Jelena Ekimotcheva
  @date 31/Juli/2019

*/
( function() {

    window.easydbpickerconfig = {};

    easydbpickerconfig.pools = [ 349 ];
    easydbpickerconfig.searchelements = {};
    easydbpickerconfig.searchelements[ "title" ] =
	{
	    //de : "Titel",
	    de : "Title",
		en : "Title",
		bool: "must",
	    objecttype : "objekte" ,
	    fields : [ "objekte.obj_titel" ]
	};
    
    easydbpickerconfig.searchelements[ "fulltext" ] =
	{
	    //de : "Volltext",
		de : "Full Text",
	    en : "Full Text",
		bool : "should",
	    objecttype: "objekte",
	    fields : [ ]
	};
    
    easydbpickerconfig.searchelements[ "systemid" ] =
	{
	    //de : "Aufnahme-ID",
		de : "System-ID",
		en : "System-ID",
	    bool: "must",
	    objecttype : "ressourcen",
		//objecttype : "objects",
	    fields : [ "_system_object_id" ] 
	};
     
    
    /* 
       To see the possibilities of the result write whole answer on a
       demo paragraph if it is included.

    */
    var write = function( assetDeepLink ){

	//console.log( "assetDeepLink" );
	//console.log( assetDeepLink );
	
	if ( assetDeepLink ) {

	    let json = JSON.stringify( assetDeepLink, null, 2 );

	    if( document.getElementById( "div-image" ) ){

			let divImg = document.getElementById( "div-image" );
			var btnRemove = document.getElementById("removeimage");
			divImg.innerHTML = "<div><a href='" + assetDeepLink.link + "' target='_blank'><img class = 'thumb' src='" + assetDeepLink.thumblink.url + "'></a></img></div>"
							  + "<div><a href='https://heidicon.ub.uni-heidelberg.de/detail/" 
							  + assetDeepLink.object._system_object_id + "' target='_blank'>open in heidICON....</a></div>"; 
			window.thumb = assetDeepLink.thumblink.url;
			window.img_link = assetDeepLink.link;
			window.heidicon_link = assetDeepLink.object._system_object_id;
			btnRemove.style.visibility="visible";
			//console.log(json);
	    }
	}
    }


    // click search picker button

    let input = document.getElementById( "easydb-picker-search-title" );
    let node = document.getElementsByTagName('body')[0];
    let picker = document.getElementById( "easydb-picker-button" );
	//console.log(input);
    // configure select values
    let select = document.createElement( "SELECT" );
    select.setAttribute( "id", "easydb-picker-options" );

    // create a search options
    
    let options = [];

    for( let searchelement in easydbpickerconfig.searchelements ){

	options.push( searchelement );
    }

    for( let optionIdx = 0; optionIdx < options.length; optionIdx ++ ){

		let option = document.createElement( "OPTION" );
		option.value = options[ optionIdx ];
		option.text = easydbpickerconfig.searchelements[ options[ optionIdx ] ].de;
        select.appendChild( option );  
    }

    let searchslot = document.getElementById( "easydb-picker-search-title" );
	console.log(searchslot);
    let parent = searchslot.parentNode;
    parent.insertBefore( select, searchslot );
    
    // find out the value of the search option, for the right post request
    
    
    picker.addEventListener( 'click', () => {

	let index = select.selectedIndex;
	let selectoption = select.options[ index ]; // .value;

	start( selectoption, input.value, node, write );
    }, false );

    

    // press on input
    

    input.addEventListener( "keyup", ( event ) => {

	event = event || window.event;   // IE < 9
	
	if( event.keyCode === 13 ){
	    
	    event.preventDefault();

	    let index = select.selectedIndex;
	    let selectoption = select.options[ index ]; // .value;

	    start( selectoption, input.value, node, write );
	}
    }, false  );
})()
