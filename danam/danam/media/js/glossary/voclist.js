var table = document.getElementById("dynamictable");

function createTable(lbl, defn) {

    var row = table.insertRow(0);
    var lblC = row.insertCell(0);
    var defnC = row.insertCell(1);
    var moreC = row.insertCell(2);
    
    lblC.innerHTML = lbl;
    defnC.innerHTML = defn;
    moreC.innerHTML = "<a href='" + lbl + "'>more on " + lbl + "</a>";

}
function unicodeToHtmlCode(str) {
    // replace \u0000 by &#x0000; in the given string
    return str.replace(/\\[uU]([a-fA-F0-9]{4})/g, function (matchedString, group1) {
        return "&#x" + group1 + ";"
    })
}

//document.getElementById('list').addEventListener('onload', fetchJSON)


function listTerms(e){
    document.getElementById('info').innerHTML="";
    var term = document.getElementById("term").value;
   
    //alert(e.button);
    if ((e.key=="Enter") || (e.button==0)){

       
        if (term!=""){
            fetchJSON(term);
        }
        else{
            fetchJSON("all");
            document.getElementById('info').innerHTML = "<hr><p>The search with blank text will list all the terms from DANAM thesaurus </p><hr>";
        }
    }

}

function fetchJSON(term){
    
        
        fetch(`/vocab/api/vocablist/${term}`)
            .then((resp) => resp.json())
            .then(function (data) {
                // console.log(data);
                
                var dataL2 = data.list.slice(0);;
                dataL2.sort(function (a, b) {
                    return a < b;
                })
                // ordered index table
                var indexTable = [];
                var ai = 0;
                // sorte by LIST index table
                for (i in dataL2) {
                    for (j in data.list) {
                        var ori = data.list[j];
                        var compare = dataL2[i];
                        if (ori == compare) {
                            indexTable[ai] = j;
                            ai++;
                        }
                    }
                }
                var copyDataList = data.list.slice(0);;
                var copyDatadef = data.def.slice(0);;
                //sort according to the index table
                table.innerHTML="";

                for (i in indexTable) {
                    // alert( data.list[i]," ______ ", data.def[i] ) ;
                    // data.list[i] = copyDataList[indexTable[i]];
                    // data.def[i] = copyDatadef[indexTable[i]];
                    // alert( data.list[i]," ______ ",  data.def[i] ) ;
                    //alert(indexTable[i]);
                    var lbl = unicodeToHtmlCode(data.list[indexTable[i]]);
                    var defn = unicodeToHtmlCode(data.def[indexTable[i]]);
                    
                    createTable(lbl, defn)
                }
                var tempText = document.getElementById('info').innerHTML;
                i++;
                document.getElementById('info').innerHTML = tempText + "<hr><p>There are <b>" + i + "</b> search results of the term <b>" + term + "</b><hr>";
            })
            .catch(function (err) {
                console.log('error during fetch', err)
            })
    }