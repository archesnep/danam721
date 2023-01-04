/*
  This is an interface for a search for heidICON objects. User can
  choose an asset-deep-link and put its values into a targetsystem.

  author: Lena Ekimotcheva
  date: 12/9/2019

*/
( function(){

    let heidICON = {};                      // request values
    let log = text => console.log( text );  // log messages on the console 
	//	=> return values
    /*
      Pass the response of the heidICON search to the callback.
      
      @param link is the choosen size of the object
      @param thumblink is always the small size of the object
      @param object is a tree of all ressources 
      @param ressource contains the choosen ressource of the response 
      @param recordIdx is the index of the object

    */
    function AssetDeepLink( link, thumblink, object, ressource, recordIdx ) {

	this.link      = link;
	this.thumblink = thumblink;
	this.object    = object;
	this.ressource = ressource;
	this.recordIdx = recordIdx;
    }
    

    /*
      Test deep response object structure. 

      @param obj is the promise as Json of heidICON
      @return defined | undefined

    */
    function checkNested( obj ) {

	//  Use: checkNested(obj, "a", "b", "c")
	for( var i = 1; i < arguments.length; i++ ) {
	
	    //arguments is an Array-like object accessible inside functions that contains the values of the arguments passed to that function.
		
		if ( !obj.hasOwnProperty( arguments[ i ] ) ) {

			return false
	    }
	    
	    obj = obj[ arguments[ i ] ];
	} 
	return true
    }

    
    // elements that show results
    
    const CSS = {                               
	form     : "easydb-form",
	filter   : "easydb-filter",
	frame    : "easydb-frame",
	loader   : "easydb-loader",
	search   : "easydb-search-slot",
	table    : "easydb-table",
	button   : "easydb-button",
	div      : "easydb-div",
	ul       : "easydb-ul",
	img      : "easydb-img",
	preview  : "easydb-preview",
	counter  : "easydb-counter"
    };


    
    // SEARCH


    /*
      Sends requests to the heidICON server for searching.

      @param select switch between title or fulltext search option
      @param term is the search value
      @param node is the dom element for appending the search results
      @param callback is the process of the results

    */
    function requestHeidICON( select, term, node, callback ){
	startLoader( node );  // wait symbol until ready                  
	
	heidICON.url = "https://heidicon.ub.uni-heidelberg.de/api/v1";
	//	heidICON.url = "https://serv38.ub.uni-heidelberg.de:8443/api/v1"
	
	
	fetch( heidICON.url + "/session" )
	    .then( readAsJson ) 
	    .then( requestAuth )
	    .then( readAsJson )
	    .then( requestTask )
	    .then( () => requestSearch( select, term ) )
	    .then( readAsJson )
	    .then( ( response ) => 

		   process( response, select, term, node, callback ) )
	    .catch(( log ) =>
			{console.log(log)}); //Ashish addition --> needs to be removed
    }


    /*
      Read a response as json. 

      @param response is a promise from a fetch 
      @return an json of this response
      
    */
    function readAsJson( response ){ 
	
		//console.log( response );
		return response.json(); 
		}
    
    
    /*
      Create anonyme virtual user for this session to heidICON.
      
      @param response of the session as json
      @return a promise value from an authentification fetch

    */
    function requestAuth( response ){

	heidICON.token = response.token;
	let url = heidICON.url +  "/session/authenticate?token=" + heidICON.token + "&method=anonymous";

	return fetch( url, { method: 'POST' } );
    }


    /*
      Confirm a pending task by the created virtual user.
      
      @param response of the authentification as json 
      @return a promise of pending tasks | slide response

    */
    function requestTask( response ){

	// confirm the pending task with a message key
	
	if ( checkNested( response, 'pending_tasks', 0, 'message', 'message_key' ) ) {
		
	    let url = heidICON.url + "/session/messages_confirm?token=" + heidICON.token;
	    let post = [ response[ 'pending_tasks' ][ 0 ][ 'message' ][ 'message_key' ] ];
	    console.log("JSON: " + JSON.sringify(post));
		let options = {

		method : 'POST',
		body   : JSON.stringify( post ),
		headers: { 'Content-Type' : 'application/json' }
	    }
	    
	    return fetch( url, options );
	}else{

	    return Promise.resolve( response );
	}
    }


    /*
      Generate a post denpends on select option for search request.
      
      @param select is the search option in heidICON 
      @param term is a string of search words in heidICON

      @return post is the optional post for search request

    */
    function generatePost( select, term ) {
	
	const pools = easydbpickerconfig.pools;
	const config = easydbpickerconfig.searchelements;

	/*
	  Filter the phrases in term for search post.

	  @param term contains words or phrases in '"'.
	  @param select is the choise of search
	  @param bool is combine of search terms 'and ("must") / or( "should" )'

	  @return phrases is an array of words and phrases
	 */
	function filter( term, fields, bool ){

	    let phrases = [];

	    term.split( '"' ).map( ( phrase, index ) => {

		let quotation = index % 2 ;

		if( quotation ){

		    phrases.push( {
			"type": "match",
			"mode": "fulltext",
			"fields": fields,
			"string": phrase,
			"phrase": false,
			"bool": bool
		    });
		}else{

		    let words = phrase.split( ' ' );

		    for( let wordIdx = 0; wordIdx < words.length; wordIdx++ ) {

			if( words[ wordIdx ] ) {
			    
			    phrases.push( {
				"type": "match",
				"mode": "fulltext",
				"fields": fields,
				"string": words[ wordIdx ],
				"phrase": false,
				"bool": bool
			    });
			}
		    } // end for
		} 
	    });
				 
	    return phrases;
	}

	let inputPost = [];

	let isSystemId = ( config[ select.value ].fields[ 0 ] === "_system_object_id"  );
	if( isSystemId ){


	    let idPost =
		{
		    "type": "in",
		    "in": [ Number.parseInt( term ) ],
		    "fields": config[ select.value ].fields,
		    "bool": config[ select.value ].bool
		}
	    
	    inputPost.push( idPost );
	    
	} else {
	  
	    let fields = config[ select.value ].fields;
	    let bool = config[ select.value ].bool;

	    inputPost = filter( term, fields, bool );
	}
					       
					       
	log( inputPost );
    
	let objecttype = config[ select.value ].objecttype;
	log( "objekttype: " + objecttype );
	
	let post = {
	    
	    "objecttypes" : [ objecttype ],
	    "search" : [
		{
		    "__filter" : "SearchTypeSelector",
		    "bool" : "must",
		    "search" : [
			{
			    "bool" : "should",
			    "fields" : [ objecttype + "._pool.pool._id" ],  
			    "in" : pools,
			    "type" : "in"
			},
			{
			    "bool" : "should",
			    "search" : [
				{
				    "bool" : "must_not",
				    "fields" : [ "_objecttype" ],
				    "in" : [ objecttype ],
				    "type" : "in"
				}
			    ],
			    "type" : "complex"
			}
		    ],
		    "type" : "complex"
		},
		{
		    "__filter" : "SearchInput",
		    "search" : inputPost,
		    "type" : "complex"
		}  
	    ],
	    "sort" : [
		{
		    "field" : "_system_object_id",
		    "order" : "DESC"
		}
	    ]
	}

	return post;
    }


    /*
      Search for a term in public pools of heidICON server.
      
      @param term is a search term
      @return a promise of search in heidICON

    */
    function requestSearch( select, term ){

	let post = generatePost( select, term );

	log( post );
	
	let options = {

	    method : 'POST',
	    body : JSON.stringify( post ),
	    headers : { 'Content-Type' : 'application/json' }
	}
	console.log(heidICON.token);
	let url = heidICON.url + "/search?token=" + heidICON.token;
	
	return fetch( url, options );
    }

    
    /*
      Process the results of heidICON in a dynamic view.
      
      @param response is the promise as json of search request
      @param select switch between title or fulltext search option
      @param term is the search value
      @param node is the dom element for appending the search results
      @param callback is the process of the results

    */
    function process( response, select, term, node, callback ) {

	log( response );
	
	stopLoader();

	if( response.count == 0 ){

	    showNoResponse( node, term );
	} else {

	    createForm( node, response, callback );

	    // show each heidICON object 

	    let length = response[ "objects" ].length;

	    for( let recordIdx = 0; recordIdx < length; recordIdx++ ){

		// select option shot id

		let isSystemId = ( easydbpickerconfig.searchelements[ select.value ].fields[ 0 ] === "_system_object_id"  );
		if( isSystemId ) {

		    showRessource( response, recordIdx );
		}else{
		    
		    // select option filter fulltext or title

		    showObject( response, recordIdx );
		}

		showCount( response.count, term ); 
	    }
	}
    }

    /*
      Createing a view for the type heidICON ID search.
      
      @param recordIdx the matched index of an heidICON object
      @param response the values inside of created elements

    */
    function showRessource( response, recordIdx ){

	// create a DIV

	let div = document.createElement( "DIV" );
	div.setAttribute( "id", "easydb-record" + "-" + recordIdx );
	div.classList.add( CSS.div );

	// create a DETAILS, a SUMMARY and a P 

	let details = document.createElement( "DETAILS" );
	div.appendChild( details );

	if( checkNested( response[ 'objects' ], recordIdx, 'ressourcen', 'lk_objekt_id', '_sort', 'de-DE' )
	    || checkNested( response[ 'objects' ], recordIdx,  'ressourcen', "lk_objekt_id", '_sort', 'en-US' ) ) {
	    
	    let summary = document.createElement( "SUMMARY" );
	    
	    // add record description
	    
	    let record = response[ 'objects' ][ recordIdx ][ 'ressourcen' ][ 'lk_objekt_id' ][ '_sort' ][ 'de-DE' ];
	    if( !record ){
		record = response[ 'objects' ][ recordIdx ][ 'ressourcen' ][ 'lk_objekt_id' ][ '_sort' ][ 'en-US' ];
	    }

	    let pool = response[ 'objects' ][ recordIdx ][ 'ressourcen' ][ '_pool' ][ 'pool' ][ 'name' ][ 'de-DE' ];
	    if( pool ){
		let recordTxt = document.createTextNode( record + ", Pool: " + pool );
		summary.appendChild( recordTxt );
	    }
	    
	    // add preview of asset-deep-links 

	    let previewDiv = document.createElement( "DIV" );
	    previewDiv.classList.add( CSS.preview );
	    let images = createRessourcePreview( div, response, recordIdx );
	    images.forEach( ( img ) => {
		
		previewDiv.appendChild( img );
	    } );
	    summary.appendChild( previewDiv );
	    
	    let p = document.createElement( "P" );
	    let tables = createRessourceTables( response );
	    tables.forEach( ( table ) => {

		p.appendChild( table );
	    } );
	    

	    details.appendChild( summary );
	    details.appendChild( p );

	    // open first details
	    
	    if( recordIdx == 0 ){ details.open = true; }
	}

	let frame = document.getElementById( "easydb-picker-frame" );
	
	frame.appendChild( div );
    }
    
    /*
      Creating a view of type all or full of heidICON search.
      
      @param recordIdx the matched index of an heidICON object
      @param response the values inside of created elements

    */
    function showObject( response, recordIdx ){
	
	// create a DIV

	let div = document.createElement( "DIV" );
	div.setAttribute( "id", "easydb-record" + "-" + recordIdx );
	div.classList.add( CSS.div );

	// create a DETAILS, a SUMMARY and a P 

	let details = document.createElement( "DETAILS" );
	div.appendChild( details );

	if( checkNested( response[ 'objects' ], recordIdx, '_standard', 1, 'text', 'de-DE' )
	    || checkNested( response[ 'objects' ], recordIdx, '_standard', 1, 'text', 'en-US' ) ) {
	    
	    let summary = document.createElement( "SUMMARY" );
	    
	    // add record description
	    
	    let record = response[ 'objects' ][ recordIdx ][ '_standard' ][ 1 ][ 'text' ][ 'de-DE' ];
	    if( !record ){
		record = response[ 'objects' ][ recordIdx ][ '_standard' ][ 1 ][ 'text' ][ 'en-US' ];
	    }
	    
	    let pool = response[ 'objects' ][ recordIdx ][ 'objekte' ][ '_pool' ][ 'pool' ][ 'name' ][ 'de-DE' ];
	    if( pool ){
		let recordTxt = document.createTextNode( record + ", Pool: " + pool );
		summary.appendChild( recordTxt );
	    }
	    
	    // add preview of asset-deep-links 

	    let previewDiv = document.createElement( "DIV" );
	    previewDiv.classList.add( CSS.preview );
	    let images = createObjectPreview( div, response, recordIdx );
	    images.forEach( ( img ) => {
		
		previewDiv.appendChild( img );
	    } );
	    summary.appendChild( previewDiv );
	    
	    let p = document.createElement( "P" );
	    let tables = createObjectTables( response, recordIdx );
	    tables.forEach( ( table ) => {

		p.appendChild( table );
	    } );
	    
	    
	    details.appendChild( summary );
	    details.appendChild( p );

	    // open first details
	    
	    if( recordIdx == 0 ){ details.open = true; }	    	    
	}

	let frame = document.getElementById( "easydb-picker-frame" );
	
	frame.appendChild( div );
    }

    /*
      Show to user that the search results no heidICON objects.

      @param node is a dom element that append a form
      @param term is the search value without response

    */
    function showNoResponse( node, term ){

	// clear form
	
	if( document.getElementById( "easydb-picker-form" ) ){
	    
	    node.removeChild( document.getElementById( "easydb-picker-form" ) );
	}
	
	// create form

	let form = document.createElement( 'form' );
	form.setAttribute( "id", "easydb-picker-form" );
	form.setAttribute( "name", "easydb-picker-form" );
	form.classList.add( CSS.form );
	node.appendChild( form );

	// frame
	
	let frame = document.createElement( "DIV" );
	frame.setAttribute( "id", "easydb-picker-frame" );
	frame.classList.add( CSS.frame );
	form.appendChild( frame );

	let p = document.createElement( "P" );
	p.innerHTML ="<b> Nothing </b> was <b> found </b> in heidICON with the <b>" + term + ".</b>";
	frame.appendChild( p );
	
	// close form
	
	let ok = document.createElement( 'INPUT' );
	ok.setAttribute( "type", "button" );
	ok.setAttribute( "value", "Ok" );
	ok.setAttribute( "id", "easydb-ok-button" );
	ok.classList.add( CSS.button );

	let div = document.createElement( "DIV" );
	div.appendChild( ok );
	frame.after( div );

	// process the callback 

	ok.addEventListener( 'click', () => {
	    
	    node.removeChild( form );
	}, false );
    }

    
    /*      
	    Append form to the node element for selection the link.

	    @param node is a dom element that append a form
	    @param response for checking colleration of filter with response

    */
    function createForm( node, response, callback ){

	// clear form
	
	if( document.getElementById( "easydb-picker-form" ) ){
	    
	    node.removeChild( document.getElementById( "easydb-picker-form" ) );
	}
	
	// create form

	let form = document.createElement( 'form' );
	form.setAttribute( "id", "easydb-picker-form" );
	form.setAttribute( "name", "easydb-picker-form" );
	form.classList.add( CSS.form );
	node.appendChild( form );

	// frame
	
	let frame = document.createElement( "DIV" );
	frame.setAttribute( "id", "easydb-picker-frame" );
	frame.classList.add( CSS.frame );
	form.appendChild( frame );

	// confirm asset-deep-link button
	
	let ok = document.createElement( 'INPUT' );
	ok.setAttribute( "type", "button" );
	ok.setAttribute( "value", "Insert" );
	ok.setAttribute( "id", "easydb-ok-button" );
	ok.classList.add( CSS.button );

	let div = document.createElement( "DIV" );
	div.appendChild( ok );
	frame.after( div );

	// process the callback 

	ok.addEventListener( 'click', () => {
	    
	    if( heidICON.assetDeepLink ){

			callback && callback( heidICON.assetDeepLink );
			node.removeChild( form );
	    }
	}, false );
    }


    /*
      Load timer for showing response until the response available.
      
      @param node element that appends the loader 

    */
    function startLoader( node ){
	
	let loader = document.createElement( "DIV" );
	loader.setAttribute( "id", "easydb-loader" );
	loader.classList.add( CSS.loader );
	loader.style.display = "block"; 
	node.appendChild( loader );
    }

    
    /*
      Stop the loader as long ther response are showing.

    */
    function stopLoader(){

	let loader = document.getElementById( "easydb-loader" );
	loader.style.display = "none";
    }

    
    /*
      Count results fo heidICON search.

      @param count is the last index of found heidICON objects

    */
    function showCount( count, term ){

	// first clear

	let find = document.getElementById( "easydb-picker-counter" );

	if( find ) {

	    let parent = find.parentNode;
	    parent.removeChild( find );
	}

	// create counter

	let p = document.createElement( "p" );
	p.setAttribute( "id", "easydb-picker-counter" );
	p.setAttribute( "style", "text-align : right" );

	if( count == 1 ){
		p.innerHTML = "Result: <b>" + count + "</b> images with the <b>" + term + "</b> found.";
		//p.innerHTML = "Ergebnisse: <b>" + count + "</b> heidICON Objekt zu <b>" + term + "</b> gefunden.";
	}else{
		p.innerHTML = "Result: <b>" + count + "</b> images with the <b>" + term + "</b> found.";
	    //p.innerHTML = "Ergebnisse: <b>" + count + "</b> heidICON Objekte zu <b>" + term + "</b> gefunden." ;
	}
	
	let frame = document.getElementById( "easydb-picker-frame" ); 
	frame.after( p );
    }

    

    
    /*
      Add shot id preview pictures and get them big on mouse over effect.

      @param div representates one record for appending images
      @param response is the search result
      @param recordIdx iterates the records of the result object
      
      @return images are available images of this id

    */
    function createRessourcePreview( div, response, recordIdx ){

	let asset = response[ 'objects' ][ recordIdx ][ 'ressourcen' ][ 'asset' ];
	let images = [];
	
	for( let assetIdx = 0; assetIdx < asset.length; assetIdx++ ){

	    if( checkNested( asset, assetIdx, "versions", "preview", "url" ) ){

		let thumburl = asset [ assetIdx ][ 'versions' ][ 'preview' ][ 'url' ];

		let img = document.createElement( "IMG" );
		img.setAttribute( "src", thumburl );
		img.setAttribute( "height", "60" );
		img.classList.add( CSS.img );
		div.appendChild( img );
		
		// big view on mouse over
		img.addEventListener( 'mouseover', () => {
		    img.setAttribute( "height", "500" );
		}, true );
		
		img.addEventListener( 'mouseout', () => {
		    img.setAttribute( "height", "60" );
		}, true );
		
		images.push( img );
	    }
	}
	
	return images;
    }

    
    /*
      Add all preview pictures and get them big on mouse over effect.

      @param div representates one record for appending images
      @param response is the search result
      @param recordIdx iterates the records of the result object
      
      @return images are all available images of this record 

    */
    function createObjectPreview( div, response, recordIdx ){

	let heidICONObject = response[ 'objects' ][ recordIdx ][ 'objekte' ][ '_reverse_nested:ressourcen:lk_objekt_id' ];
	let images = [];
	
	for( let objectIdx = 0; objectIdx < heidICONObject.length; objectIdx++ ) {

	    if( checkNested( heidICONObject [ objectIdx ], "asset", 0, "versions", "preview", "url" ) ) {

		let thumburl = heidICONObject [ objectIdx ][ 'asset' ][ 0 ][ 'versions' ][ 'preview' ][ 'url' ];

		let img = document.createElement( "IMG" );
		img.setAttribute( "src", thumburl );
		img.setAttribute( "height", "60" );
		img.classList.add( CSS.img );
		div.appendChild( img );
		
		// big view on mouse over
		img.addEventListener( 'mouseover', () => {
		    img.setAttribute( "height", "500" );
		}, true );

		img.addEventListener( 'mouseout', () => {
		    img.setAttribute( "height", "60" );
		}, true );

		images.push( img );
	    }
	}
	
	return images;
    }



    /*
      Open view with asset deep links to make an ability to choose.
      
      @param div is clickable an open the details view
      @param response is the search result
      @param recordIdx iterates the records of the result object 

      @return created tables with response 

    */
    function createRessourceTables( response ){

	// show div with details inside a table

	let tables = [];
	let asset = response[ 'objects' ][ 0 ][ 'ressourcen' ][ 'asset' ];

	for( let assetIdx = 0; assetIdx < asset.length; assetIdx++ ) {

	    if( checkNested( asset, assetIdx, "versions" ) ) {

		let table = document.createElement( "TABLE" );
		table.setAttribute( "id", "easydb-table-asset" + '-' + assetIdx );
		table.classList.add( CSS.table );
		
		// rows: versions, size, extension, preview and metadata
		let cssId = "asset-" + assetIdx;
		createObjectRows( table, cssId );
		// cells: from response
		createRessourceCells( response, table, assetIdx, cssId );
		
		let div = document.createElement( "DIV" );
		div.classList.add( CSS.div );
		div.appendChild( table );

		tables.push( div );
	    }
	}
	
	return tables;
    }
    

    /*
      Open view with asset deep links to make an ability to choose.
      
      @param div is clickable an open the details view
      @param response is the search result
      @param recordIdx iterates the records of the result object 

      @return created tables with response 

    */
    function createObjectTables( response, recordIdx ){

	// show div with details inside a table

	let tables = [];

	let heidICONObject = response[ 'objects' ][ recordIdx ][ 'objekte' ][ '_reverse_nested:ressourcen:lk_objekt_id' ];
	
	for( let objectIdx = 0; objectIdx < heidICONObject.length; objectIdx++ ) {

	    // check count objects
	    
	    if ( checkNested( response[ 'objects' ], recordIdx, '_standard', 'eas', 1, objectIdx ) ){
		
		let table = document.createElement( "TABLE" );
		table.setAttribute( "id", "easydb-table" + '-' + recordIdx + '-' + objectIdx );
		table.classList.add( CSS.table );
		
		// rows: versions, size, extension, preview and metadata

		let cssId = recordIdx + "-" + objectIdx;
		createObjectRows( table, cssId );
		// cells: from response
		createObjectCells( response, table, recordIdx, objectIdx );

		let div = document.createElement( "DIV" );
		div.classList.add( CSS.div );
		div.appendChild( table );

		tables.push( div );
	    }
	}

	return tables;
    }
    
    /*
      Show checkboxes, versions, size, extension and preview of links.
      
      @param table element for appending rows
      @param cssId are used for ids in created elements

    */
    function createObjectRows( table, cssId ){
	
	// init table
	
	let rows = document.createElement( "TR" );
	rows.setAttribute( "id", "easydb-table-tr-" + cssId );
	
	
	// row checkbox
	
	let thCheckbox = document.createElement( "TH" );
	thCheckbox.setAttribute( "id", "easydb-table-th-checkbox-" + cssId );
	thCheckbox.setAttribute( "width" , "10" );
	let rowCheckbox = document.createTextNode( "" );  
	thCheckbox.appendChild( rowCheckbox );
	rows.appendChild( thCheckbox );	

	// row version
	
	let thVersion = document.createElement( "TH" );
	thVersion.setAttribute( "id", "easydb-table-th-version-" + cssId );
	thVersion.setAttribute( "width", 70 );
	let rowVersion   = document.createTextNode( "Version" );
	thVersion.appendChild( rowVersion );
	rows.appendChild( thVersion );
	
	// row size
	
	let thSize = document.createElement( "TH" );
	thSize.setAttribute( "id", "easydb-table-th-size-" + cssId );
	thSize.setAttribute( "width", 100 );
	let rowSize      = document.createTextNode( "Größe" );
	thSize.appendChild( rowSize );
	rows.appendChild( thSize );
	
	// row extension
	
	let thExtension = document.createElement( "TH" );
	thExtension.setAttribute( "id", "easydb-table-th-extension-" + cssId );
	thExtension.setAttribute( "width", 40 );
	let rowExtension = document.createTextNode( "Art" );
	thExtension.appendChild( rowExtension );
	rows.appendChild( thExtension );
	
	// row preview
	
	let thPreview = document.createElement( "TH" );
	thPreview.setAttribute( "id", "easydb-table-th-preview-" + cssId );
	thPreview.setAttribute( "width", "auto" );
	let rowPreview = document.createTextNode( "Vorschau" );
	thPreview.appendChild( rowPreview );
	rows.appendChild( thPreview );
	
	// row metadata
	
	let thMeta = document.createElement( "TH" );
	thMeta.setAttribute( "id", "easydb-table-th-meta-" + cssId );
	thMeta.setAttribute( "width", "auto" );
	let rowMeta = document.createTextNode( "Metadaten" );
	thMeta.appendChild( rowMeta );
	rows.appendChild( thMeta );

	table.appendChild( rows );
    }

    /*
      Created tables and represent the response in a subfunction.

      @param response is from search in heidICON
      @param table is the element that appends the created cells
      @param assetIdx for each asset in one shot
      @param cssId for created dom element ids 

    */
    function createRessourceCells( response, table, assetIdx, cssId ) {

	let ressourcen = response[ 'objects' ][ 0 ][ 'ressourcen' ];
	let versions = [ 'preview', 'original', 'huge', 'full' ];
	let links = ressourcen[ "asset" ][ assetIdx ][ 'versions' ];
	let thumblink = ressourcen[ 'asset' ][ assetIdx ][ 'versions' ][ 'small' ];
	console.log(thumblink);
	let cells = "";

	for( let versionsIdx = 0; versionsIdx < versions.length; versionsIdx ++ ) {

	    
	    // check versions in asset
	    
	    if( checkNested( ressourcen[ 'asset' ], 0 , "versions", versions[ versionsIdx ] ) ){
		
		
		// fill values in assetDeepLinks
		
		let link      = links[ versions[ versionsIdx ] ][ 'url' ]; 
		let width     = links[ versions[ versionsIdx ] ][ 'width' ];
		let height    = links[ versions[ versionsIdx ] ][ 'height' ];
		let extension = links[ versions[ versionsIdx ] ][ 'extension' ];
		

		// table cells
		
		cells = document.createElement( "TR" );
		cells.setAttribute( "id", "easydb-table-tr-body-" + cssId );

		
		// create radios 

		let radio = document.createElement( "INPUT" );
		radio.setAttribute( "type", "radio" );
		radio.setAttribute( "name", "easydb-asset-deep-link" );

		// cell radio
		
		let tdRadio = document.createElement( "TD" );
		tdRadio.setAttribute( "id", "easydb-table-td-radio-" + cssId );
		tdRadio.appendChild( radio );

		// cell version
		
		let tdVersion= document.createElement( "TD" );

		if( link ){

		    tdVersion.setAttribute( "id", "easydb-table-td-version-" + cssId );
		    tdVersion.innerHTML = '<a href="' + link + '" target="_blank">' +  versions[ versionsIdx ]  + '</a>' ;
		}
		
		// cell size
		
		let tdSize = document.createElement( "TD" );
		tdSize.setAttribute( "id", "easydb-table-td-size-" + cssId );

		if ( width && height ){

		    let size = document.createTextNode( width + ' x ' + height );
		    tdSize.appendChild( size );
		}
		
		// cell extension
		
		let tdExt = document.createElement( "TD" );
		tdExt.setAttribute( "id", "easydb-table-td-ext-" + cssId );

		if( extension ){

		    let ext = document.createTextNode( extension );
		    tdExt.appendChild( ext );
		}


		// remove empty cells
		
		if ( link ){

		    cells.appendChild( tdRadio );
		    cells.appendChild( tdVersion );
		    cells.appendChild( tdSize );
		    cells.appendChild( tdExt );
		    table.appendChild( cells );
		}

		// apend thumburl to the asset deep links
		
		if ( versions[ versionsIdx ] === 'preview' ) {
		    
		    // create iframe for preview
		    
		    let iframe  = document.createElement( "IFRAME" );
		    iframe.setAttribute( "id", "easydb-canvas-preview-" + cssId );
		    iframe.setAttribute( "width", "90%" );
		    iframe.setAttribute( "height", "90%");
		    iframe.setAttribute( "src", link );

		    // small url in the asset deep link
		    
		    //thumblink = link;
		    
		    // cell preview
		    
		    let tdPreview = document.createElement( "TD" );
		    tdPreview.setAttribute( "id", "easydb-table-preview-" + cssId );
		    tdPreview.setAttribute( "rowspan", versions.length );
		    
		    tdPreview.appendChild( iframe );
		    cells.appendChild( tdPreview );

		    // Aufnahme/ Reproduktion
		    

		    let time ="";

		    // Aufnahmezeitpunkt freitext

		    if( checkNested( ressourcen, "res_datierung_freitext" ) ){

			time = ressourcen[ "res_datierung_freitext" ];
		    }

		    // Aufnahmezeitpunkt norm

		    if( checkNested( ressourcen, "res_datierung_norm", "from" ) ) {

			let from = ressourcen[ "res_datierung_norm" ][ "from" ];
			if ( from ){

			    if( time ){ time += ", "; }			    
			    time += "von " + from;
			}  
		    }

		    if ( checkNested( ressourcen, "res_datierung_norm", "to" ) ) {

			let to = ressourcen[ "res_datierung_norm" ][ "to" ];

			if( to ){

			    if( time ){ time += ", "; }
			    time += "bis " + to;
			}
		    }
		    
		    let fotomaker ="";

		    // Fortograf/ Urheber gnd

		    if ( checkNested( ressourcen, "_nested:ressourcen__res_autoren", "res_autor_gnd", "conceptName" ) ) {

			fotomaker = ressourcen[ "_nested:ressourcen__res_autoren" ][ "res_autor_gnd" ][ "conceptName" ];
		    }


		    // Fortograf/ Urheber lok

		    if ( checkNested( ressourcen, "_nested:ressourcen__res_autoren_lok", 0, "res_autor_lok" ) ) {

			if( fotomaker ){ fotomaker += ", "; }
			fotomaker += ressourcen[ "_nested:ressourcen__res_autoren_lok" ][ 0 ][ "res_autor_lok" ];
		    }
		    

		    let licence ="";
		    // Rechtsstatus

		    if ( checkNested( ressourcen, "res_lizenz", "_sort", "de-DE" ) ) {

			license = ressourcen[ "res_lizenz" ][ "_sort" ][ "de-DE" ];

		    } else if( checkNested( ressourcen, "res_lizenz", "_sort", "en-US" ) ) {

			license = ressourcen[ "res_lizenz" ][ "_sort" ][ "en-US" ];
		    }

		    let right = "";
		    // Rechteinhaber

		    if( checkNested( ressourcen, "res_rechteinhaber" ) ) {
			
			right = ressourcen[ "res_rechteinhaber" ];
		    }
		    
		    let creditline ="";
		    // Creditline
		    if( checkNested( ressourcen, "res_creditline" ) ){

			creditline = ressourcen[ "res_creditline" ];
		    }
		    
		    let length = heidICON.url.length;  
		    let suburl = heidICON.url.substring( 0, ( length - 6 ) );  
		    let extern = suburl + "detail/" + response[ 'objects' ][ 0 ][ "_system_object_id" ];
		    
		    // link to heidICON object

		    // fill metadata in the cell

		    let content ="";
		    if( time ){ content += '<b> Aufnahmezeitpunkt: </b>' + time + "<br>"; }		    
		    if( fotomaker ){ content += '<b> Fotograf/ Urheber: </b>' + fotomaker + "<br>"; }
		    if( license ){ content += '<b> Rechtsstatus: </b>' + license + "<br>"; }
		    if( right ){ content += '<b> Rechteinhaber: </b>' + right + "<br>"; }
		    if( creditline ){ content += '<b> Creditline: </b>' + creditline + "<br>"; }
		    content += "<b>Link: </b>" + '<a href="'+ extern + '" target="_blank">' + extern + '</a>';


		    let tdMetadata = document.createElement( "TD" );
		    tdMetadata.setAttribute( "id", "easydb-asset-table-metadata-" + cssId );
		    tdMetadata.setAttribute( "rowspan", versions.length );
		    tdMetadata.innerHTML = content;
		    
		    cells.appendChild( tdMetadata );

		    // fill asset deep link

		    radio.addEventListener( 'click', () => {
			heidICON.assetDeepLink = "";	

			let meta = {
			    object    : response[ "objects" ][ 0 ],
			    ressource : ressourcen
			}
			
			heidICON.assetDeepLink = new AssetDeepLink( link, thumblink, meta.object, meta.ressource, 0 );
			
		    }, false );
		}
	    }
	} // end for versions
    }



    /*
      Created tables and represent the response in a subfunction.

      @param response is from search in heidICON
      @param table is the element that appends the created cells
      @param recordIdx iterate records of the response 
      @param objectIdx iterates a part of records

    */
    function createObjectCells( response, table, recordIdx, objectIdx ) {

	// asset-deep-links
	
	let heidICONObject = response[ 'objects' ][ recordIdx ][ 'objekte' ][ '_reverse_nested:ressourcen:lk_objekt_id' ];
	let versions = [ 'preview', 'original', 'huge', 'full' ];
	let links = "";

	
	if ( checkNested( response[ 'objects'], recordIdx, "objekte", "_reverse_nested:ressourcen:lk_objekt_id", objectIdx, "asset" ) ){

	    links = heidICONObject[ objectIdx ][ 'asset' ][ 0 ][ 'versions' ];
	}

	// fill asset deep link
	
	let thumblink = "";

	if( checkNested( heidICONObject[ objectIdx ][ 'asset' ], 0 , "versions", 'preview' ) ){
	    
	    thumblink =  heidICONObject[ objectIdx ][ 'asset' ][ 0 ][ 'versions' ][ 'small' ];
	}
	
	// check objects count

	let cells = "";
	
	if ( checkNested( response[ 'objects' ], recordIdx, '_standard', 'eas', 1, objectIdx ) ){

	    for( let versionsIdx = 0; versionsIdx < versions.length; versionsIdx ++ ) {

		
		// check versions in asset
		
		if( checkNested( heidICONObject[ objectIdx ][ 'asset' ], 0 , "versions", versions[ versionsIdx ] ) ){


		    // fill values in assetDeepLinks
		    
		    let link      = links[ versions[ versionsIdx ] ][ 'url' ]; 
		    let width     = links[ versions[ versionsIdx ] ][ 'width' ];
		    let height    = links[ versions[ versionsIdx ] ][ 'height' ];
		    let extension = links[ versions[ versionsIdx ] ][ 'extension' ];

		    // table cells
		    
		    cells = document.createElement( "TR" );
		    cells.setAttribute( "id", "easydb-table-tr-body-" + recordIdx + "-" + objectIdx + "-" + versionsIdx );

		    
		    // create radios 

		    let radio = document.createElement( "INPUT" );
		    radio.setAttribute( "type", "radio" );
		    radio.setAttribute( "name", "easydb-asset-deep-link" );

		    // cell radio
		    
		    let tdRadio = document.createElement( "TD" );
		    tdRadio.setAttribute( "id", "easydb-table-td-radio-" + recordIdx + "-" + objectIdx + "-" + versionsIdx );
		    tdRadio.appendChild( radio );
		    
		    // cell version
		    
		    let tdVersion= document.createElement( "TD" );

		    if( link ){

			tdVersion.setAttribute( "id", "easydb-table-td-version-" + recordIdx + "-" + objectIdx + "-" + versionsIdx );
			tdVersion.innerHTML = '<a href="' + link + '" target="_blank">' +  versions[ versionsIdx ]  + '</a>' ;
		    }
		    
		    // cell size
		    
		    let tdSize = document.createElement( "TD" );
		    tdSize.setAttribute( "id", "easydb-table-td-size-" + recordIdx + "-" + objectIdx + "-" + versionsIdx );

		    if ( width && height ){

			let size = document.createTextNode( width + ' x ' + height );
			tdSize.appendChild( size );
		    }
		    
		    // cell extension
		    
		    let tdExt = document.createElement( "TD" );
		    tdExt.setAttribute( "id", "easydb-table-td-ext-" + recordIdx + "-" + objectIdx + "-" + versionsIdx );

		    if( extension ){

			let ext = document.createTextNode( extension );
			tdExt.appendChild( ext );
		    }


		    // remove empty cells
		    
		    if ( link ){

			cells.appendChild( tdRadio );
			cells.appendChild( tdVersion );
			cells.appendChild( tdSize );
			cells.appendChild( tdExt );
			table.appendChild( cells );
		    }


		    // create preview with small version of heidICON object

		    // apend thumburl to the asset deep links
		    
		    if ( versions[ versionsIdx ] === 'preview' ) {
			
			// create iframe for preview
			
			let iframe  = document.createElement( "IFRAME" );
			iframe.setAttribute( "id", "easydb-canvas-preview-" + recordIdx + "-" + objectIdx + "-" + versionsIdx );
			iframe.setAttribute( "width", "90%" );
			iframe.setAttribute( "height", "90%");
			iframe.setAttribute( "src", link );

			// small url in the asset deep link
			
			//thumblink = link;
			
			// cell preview
			
			let tdPreview = document.createElement( "TD" );
			tdPreview.setAttribute( "id", "easydb-table-preview-" + recordIdx + "-" + objectIdx + "-" + versionsIdx );
			tdPreview.setAttribute( "rowspan", versions.length );
			
			tdPreview.appendChild( iframe );
			cells.appendChild( tdPreview );


			let metadata = response[ 'objects' ][ recordIdx ][ 'objekte' ];

			// Object/ Werk
			
			// titel

			let title = "";
			if( checkNested( response[ 'objects'], recordIdx, "objekte", "obj_titel", "de-DE" ) ) {

			    title = response[ 'objects'][ recordIdx ][ "objekte" ][ "obj_titel" ][ "de-DE" ];
			}

			
			// Künstler/Urheber

			let artist = "";

			
			// Künstler/Urheber gnd

			if( checkNested( response[ 'objects'], recordIdx, "objekte", "_nested:objekte__obj_autoren", objectIdx, "obj_autor_gnd", "conceptName" ) ) {

			    let name = response[ 'objects'][ recordIdx ][ "objekte" ][ "_nested:objekte__obj_autoren" ][ objectIdx ][ "obj_autor_gnd" ][ "conceptName" ];
			    artist = name;
			}

			// Künstler/Urheber zuschreibung

			if( checkNested( response[ 'objects'], recordIdx, "objekte", "_nested:objekte__obj_autoren", objectIdx, "obj_autor_zuschreibung", "_sort", "de-DE" ) ) {

			    let de = response[ 'objects'][ recordIdx ][ "objekte" ][ "_nested:objekte__obj_autoren" ][ objectIdx ][ "obj_autor_zuschreibung" ][ "_sort" ][ "de-DE" ];

			    if( de ){

				if( artist ){ artist += ", "; }
				artist += de;
			    }

			} else if( checkNested( response[ 'objects'], recordIdx, "objekte", "_nested:objekte__obj_autoren", objectIdx, "obj_autor_zuschreibung", "_sort", "en-US" ) ) {

			    let en = response[ 'objects'][ recordIdx ][ "objekte" ][ "_nested:objekte__obj_autoren" ][ objectIdx ][ "obj_autor_zuschreibung" ][ "_sort" ][ "en-US" ];

			    if( en ){
				
				if( artist ){ artist += ", "; }
				artist += en;
			    }
			}
			
			// Künstler/Urheber lok
			
			if( checkNested( response[ 'objects'], recordIdx, "objekte", "_nested:objekte__obj_autoren_lok", objectIdx, "obj_autor_lok", "_sort", "de-DE" ) ){

			    let de = response[ 'objects'][ recordIdx ][ "objekte" ][ "_nested:objekte__obj_autoren_lok" ][ objectIdx ][ "obj_autor_lok" ][ "_sort" ][ "de-DE" ];

			    if( de ){

				if( artist ){ artist += ", "; }
				artist += de;
			    }
			    
			}else if( checkNested( response[ 'objects'], recordIdx, "objekte", "_nested:objekte__obj_autoren_lok", objectIdx, "obj_autor_lok", "_sort", "en-US" ) ) {

			    let en = response[ 'objects'][ recordIdx ][ "objekte" ][ "_nested:objekte__obj_autoren_lok" ][ objectIdx ][ "obj_autor_lok" ][ "_sort" ][ "en-US" ];

			    if( en ){

				if( artist ){ artist += ", "; }
				artist += en;
			    }
			}
			
			
			// Künstler/Urheber lok zuschreibung
			
			if( checkNested( response[ 'objects'], recordIdx, "objekte", "_nested:objekte__obj_autoren_lok", objectIdx, "obj_autor_lok_zuschreibung", "_sort", "de-DE" ) ){

			    let de = response[ 'objects'][ recordIdx ][ "objekte" ][ "_nested:objekte__obj_autoren_lok" ][ objectIdx ][ "obj_autor_lok_zuschreibung" ][ "_sort" ][ "de-DE" ];

			    if( de ){

				if( artist ){ artist += ", "; }
				artist += de;
			    }
			    
			}else if( checkNested( response[ 'objects'], recordIdx, "objekte", "_nested:objekte__obj_autoren_lok", objectIdx, "obj_autor_lok_zuschreibung", "_sort", "en-US" ) ) {

			    let en = response[ 'objects'][ recordIdx ][ "objekte" ][ "_nested:objekte__obj_autoren_lok" ][ objectIdx ][ "obj_autor_lok_zuschreibung" ][ "_sort" ][ "en-US" ];

			    if( en ){
				
				if( artist ){ artist += ", "; }
				artist += en;
			    }
			}
			

			// Datum freitext

			let date = "";

			if( checkNested( response[ 'objects'], recordIdx, "objekte", "obj_datierung_freitext" ) ) {

			    date = response[ 'objects'][ recordIdx ][ "objekte" ][ "obj_datierung_freitext" ];
			}

			// Datum norm 
			
			if( checkNested( response[ 'objects'], recordIdx, "objekte", "obj_datierung_norm", "from" ) ) {

			    let from = response[ 'objects'][ recordIdx ][ "objekte" ][ "obj_datierung_norm" ][ "from" ];

			    if( from ) {

				if( date ){ date += ", "; }
				date += "von " + from;
			    }
			}

			if( checkNested( response[ 'objects'], recordIdx, "objekte", "obj_datierung_norm", "to" ) ){

			    let to = response[ 'objects'][ recordIdx ][ "objekte" ][ "obj_datierung_norm" ][ "to" ];

			    if( to ){

				if( date ){ date += ", "; }
				date += "bis " + to;
			    }
			} 
			
			// Aufbewahrungsort/ Standort gnd

			let location = "";

			if( checkNested( response[ 'objects' ], recordIdx, "objekte", "_nested:objekte__obj_aufbewahrorte", objectIdx, "obj_aufbewahrort_gnd", "conceptName" ) ) {

			    let name = response[ 'objects' ][ recordIdx ][ "objekte" ][ "_nested:objekte__obj_aufbewahrorte" ][ objectIdx ][ "obj_aufbewahrort_gnd" ][ "conceptName" ];
			    location = name;
			}
			
			// Aufbewahrungsort/ Standort lok
			
			if( checkNested( response[ 'objects' ], recordIdx, "objekte", "_nested:objekte__obj_aufbewahrorte", objectIdx, "obj_aufbewahrort_lok", "_fulltext", "string" ) ) {

			    if( location ){ location += ", "; }
			    location += response[ 'objects' ][ recordIdx ][ "objekte" ][ "_nested:objekte__obj_aufbewahrorte" ][ objectIdx ][ "obj_aufbewahrort_lok" ][ "_fulltext" ][ "string" ];
			}
			
			// Aufbewahrungsort/ Standort geonames

			if( checkNested( response[ 'objects' ], recordIdx, "objekte", "_nested:objekte__obj_aufbewahrorte", objectIdx, "obj_aufbewahrort_geonames", "_fulltext", "string" ) ) {

			    if( location ){ location += ", "; }
			    location += response[ 'objects' ][ recordIdx ][ "objekte" ][ "_nested:objekte__obj_aufbewahrorte" ][ objectIdx ][ "obj_aufbewahrort_geonames" ][ "_fulltext" ][ "string" ];
			}

			
			// Inv. Nr./Signatur

			let signature;

			if( checkNested( response[ 'objects'], recordIdx, "objekte", "obj_sig" ) ) {

			    signature = response[ 'objects'][ recordIdx ][ "objekte" ][ "obj_sig" ];
			}

			
			// Aufnahme/ Reproduktion

			// Aufnahmezeitpunkt freitext

			let time = "";

			if( checkNested( response[ 'objects' ], recordIdx, "objekte", "_reverse_nested:ressourcen:lk_objekt_id", objectIdx, "res_datierung_freitext" ) ) {

			    time = response[ 'objects' ][ recordIdx ][ "objekte" ][ "_reverse_nested:ressourcen:lk_objekt_id"][ objectIdx ][ "res_datierung_freitext" ];
			}

			// Aufnahmezeitpunkt norm
			
			if ( checkNested( response[ 'objects'], recordIdx, "objekte", "_reverse_nested:ressourcen:lk_objekt_id", objectIdx, "res_datierung_norm", "from" ) ) {

			    let from = response[ 'objects'][ recordIdx ][ "objekte" ][ "_reverse_nested:ressourcen:lk_objekt_id"][ objectIdx ][ "res_datierung_norm" ][ "from" ];

			    if ( from ){

				if( time ){ time += ", "; }			    
				time += "von " + from;
			    }  
			}

			
			if ( checkNested( response[ 'objects'], recordIdx, "objekte", "_reverse_nested:ressourcen:lk_objekt_id", objectIdx, "res_datierung_norm", "to" ) ) {

			    let to = response[ 'objects'][ recordIdx ][ "objekte" ][ "_reverse_nested:ressourcen:lk_objekt_id"][ objectIdx ][ "res_datierung_norm" ][ "to" ];

			    if( to ){

				if( time ){ time += ", "; }
				time += "bis " + to;
			    }
			}
			
			// Fotograf/ Urheber gnd

			let fotomaker = "";

			if ( checkNested( response[ 'objects'], recordIdx, "objekte", "_reverse_nested:ressourcen:lk_objekt_id", objectIdx, "_nested:ressourcen__res_autoren", "res_autor_gnd", "conceptName" ) ) {

			    fotomaker = response[ 'objects'][ recordIdx ][ "objekte" ][ "_reverse_nested:ressourcen:lk_objekt_id"][ objectIdx ][ "_nested:ressourcen__res_autoren" ][ "res_autor_gnd" ][ "conceptName" ];
			}
			
			// Fotograf/ Urheber lok 
			
			if ( checkNested( response[ 'objects'], recordIdx, "objekte", "_reverse_nested:ressourcen:lk_objekt_id", objectIdx, "_nested:ressourcen__res_autoren_lok", 0, "res_autor_lok" ) ) {

			    if( fotomaker ){ fotomaker += ", "; }
			    fotomaker += response[ 'objects'][ recordIdx ][ "objekte" ][ "_reverse_nested:ressourcen:lk_objekt_id"][ objectIdx ][ "_nested:ressourcen__res_autoren_lok" ][ 0 ][ "res_autor_lok" ];
			}
			

			// Rechtsstatus
			
			let license;
			
			if ( checkNested( response[ 'objects'], recordIdx, "objekte", "_reverse_nested:ressourcen:lk_objekt_id", objectIdx, "res_lizenz", "_sort", "de-DE" ) ) {

			    license = response[ 'objects'][ recordIdx ][ "objekte" ][ "_reverse_nested:ressourcen:lk_objekt_id"][ objectIdx ][ "res_lizenz" ][ "_sort" ][ "de-DE" ];

			} else if( checkNested( response[ 'objects'], recordIdx, "objekte", "_reverse_nested:ressourcen:lk_objekt_id", objectIdx, "res_lizenz", "_sort", "en-US" ) ) {

			    license = response[ 'objects'][ recordIdx ][ "objekte" ][ "_reverse_nested:ressourcen:lk_objekt_id"][ objectIdx ][ "res_lizenz" ][ "_sort" ][ "en-US" ];
			}


			// Rechteinhaber
			
			let right;
			if( checkNested( response[ 'objects'], recordIdx, "objekte", "_reverse_nested:ressourcen:lk_objekt_id", objectIdx, "res_rechteinhaber" ) ) {

			    right = response[ 'objects'][ recordIdx ][ "objekte" ][ "_reverse_nested:ressourcen:lk_objekt_id"][ objectIdx ][ "res_rechteinhaber" ];
			}

			
			// Creditline

			let creditline;

			if( checkNested( response[ 'objects'], recordIdx, "objekte", "_reverse_nested:ressourcen:lk_objekt_id", objectIdx, "res_creditline" ) ){

			    creditline = response[ 'objects'][ recordIdx ][ "objekte" ][ "_reverse_nested:ressourcen:lk_objekt_id"][ objectIdx ][ "res_creditline" ];
			}

			// link to heidICON object

			let length = heidICON.url.length;  
			let suburl = heidICON.url.substring( 0, ( length - 6 ) );  
			let extern = suburl + "detail/" + response[ "objects" ][ recordIdx ][ "objekte" ][ "_reverse_nested:ressourcen:lk_objekt_id" ][ objectIdx ][ "_system_object_id" ];


			// fill metadata in the cell
			
			let object ="";
			if( title ){ object += '<b> Title: </b> ' + title + "<br>"; }
			if( artist ){ object += '<b> Artist/Author: </b> ' + artist + "<br>"; }
			if( date ){ object += '<b> Date: </b>' + date + "<br>"; }
			if( location ){ object += '<b> Location of the repository: </b>' + location + "<br>"; }
			if( signature ){ object += '<b> Inv.Nr./Signature: </b>' + signature + "<br>"; }

			let content ="";
			if( object ){ content = object + '<hr>'; }

			let recording = "";
			if( time ){ recording += '<b> Time of recording: </b>' + time + "<br>"; }
			if( fotomaker ){ recording += '<b> Photograph/ Author: </b>' + fotomaker + "<br>"; }
			if( license ){ recording += '<b> License: </b>' + license + "<br>"; }
			if( right ){ recording += '<b> Copyright: </b>' + right + "<br>"; }
			if( creditline ){ recording += '<b> Credits: </b>' + creditline + "<br>"; }
			recording += "<b>Link: </b>" + '<a href="'+ extern + '" target="_blank">' + extern + '</a>';
			if( recording ){ content += recording }
			
			let tdMetadata = document.createElement( "TD" );
			tdMetadata.setAttribute( "id", "easydb-asset-table-metadata-" + recordIdx + "-" + objectIdx );
			tdMetadata.setAttribute( "rowspan", versions.length );
			tdMetadata.innerHTML = content;
			
			cells.appendChild( tdMetadata );

			// fill asset deep link 
			
			radio.addEventListener( 'click', () => {
			    heidICON.assetDeepLink = "";	

			    let meta = {
				object    : response[ 'objects' ][ recordIdx ],
				ressource : heidICONObject
			    }
			    
			    heidICON.assetDeepLink = new AssetDeepLink( link, thumblink, meta.object, meta.ressource, recordIdx );
			    
			}, false );
		    }		    
		}// end if checkNested versions
	    } // end for versions
	}// end if checkNested objects
    }

    /*
      Start the communication with the heidICON from outside.
      
      @param select is the search option 
      @param term is the search value
      @param element node for appending the result
      @param function callback for process the choise of result
      
    */
    window.start = function( select, term, node, callback ){
	
	console.clear();
	//alert(callback);
	log( select );
	
	// clear form

	let form = document.getElementById( "easydb-picker-form" ); 
	if( form ){ node.removeChild( form ); }

	// clear loader

	let loader = document.getElementById( "easydb-loader" ); 
	if( loader ){ node.removeChild( loader ); }

	requestHeidICON( select, term, node, callback );
    }
    
})();

