import rdflib
from django.shortcuts import render
from django.http import JsonResponse


# glossary views
def glossary(request):
    return render(request, 'glossary/glossary.html')


def showDetail(request, word):
    return render(request, "glossary/details.html")


def getWordDefinition(request, word):
   # print('----------- New request ------------')
   # print(word)
   # print(word.encode('ascii', 'backslashreplace'))

    # convert the word to unicode
    word = word.encode('ascii', 'backslashreplace').decode('utf-8')

   # print(word)

    g = rdflib.Graph()
    g.parse("danamvocab/static/skos/nhdp-vocab.skos")

    query = """
        PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
        PREFIX local: <http://localhost:8000/>
        SELECT ?definition ?label ?altlabel ?image ?note
        WHERE {  
            ?concept skos:prefLabel ?label .
           OPTIONAL {?concept skos:definition ?definition}.
           OPTIONAL {?concept skos:altLabel ?altlabel}.
           OPTIONAL {?concept skos:scopeNote ?note}.
           OPTIONAL {?concept local:image ?image}.
        }
    """

    q = query.encode('UTF-8')
    qres = g.query(q)

    hasDefinition = False
    definition = ""
    word = '"value": "' + word + '"'
    for row in qres:
        if word in row.label:

            defn = row.definition
            definition = extractVocab(defn)
            #label = row.label
            lbl = extractVocab(row.label)
            #altlabel = row.altlabel
            altlbl = extractVocab(row.altlabel)
            #image = row.image
            nte = extractVocab(row.note)
            imgs = extractVocab(row.image)

            hasDefinition = True

    if hasDefinition:
        #response =  JsonResponse(data={ 'type': 'success', 'message': definition, 'en': lbl})
        response = JsonResponse(data={'type': 'success', 'message': definition,
                                      'en': lbl, 'dev': altlbl, 'image': imgs, 'note': nte})
    else:
        response = JsonResponse(
            data={'type': 'error', 'message': 'No definition for this word', 'image': imgs}, status=404)

    # or if necessary look at https://github.com/ottoyiu/django-cors-headers
    # response["Access-Control-Allow-Origin"] = "*"

    return response


def extractVocab(word):

    if word:
        voc = word.split('value": "', 1)
        voc = voc[1]
        voc = voc.split('"}', 1)
        voc = voc[0]

        return voc
    else:
        return ''
