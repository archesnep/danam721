function unicodeToHtmlCode (str) {
    // replace \u0000 by &#x0000; in the given string
    return str.replace(/\\[uU]([a-fA-F0-9]{4})/g, function(matchedString, group1) {
        return "&#x" + group1 + ";"
    })
}
    var voc =window.location.href;
    console.log(voc);
    voc = voc.substr(39, voc.length - 2);
    console.log(voc);
    fetch(`/api/vocab/${voc}`)
    .then((resp) => resp.json())
    .then(function(data) {
    // console.log(data);
         var def = unicodeToHtmlCode(data.message);
         var en = unicodeToHtmlCode(data.en);
         var dev = unicodeToHtmlCode(data.dev);
         var img = unicodeToHtmlCode(data.image);
         var nte = unicodeToHtmlCode(data.note);
    // console.log(def)
    // console.log(decodeUnicode(data.message))
        var strDataDev="";
        var strDataDef="";
        var strDataNote="";
        var strDataLabel = "<h1> " + en + " @en-us</h1>";
        if (dev) {
            strDataDev = "<p> " + dev + " @dev-np</p>";
        }
        if (def){
            strDataDef = "<p><b>Definition: </b>" + def + "</p>";
        }
        if (nte){
            strDataNote = "<p><b>Scope Note: </b>" + nte + "</p>";
        }
        document.getElementById("data").innerHTML = strDataLabel.concat(strDataDev, strDataDef, strDataNote);
        document.getElementById("img").innerHTML  = "<a href='https://nhdp-test.kjc.uni-heidelberg.de/files/" + img + 
                "'>" + img + "</a>";
        
        
    })
    .catch(function(err) {
    console.log('error during fetch', err)
    })