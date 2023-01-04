from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render, redirect
import re
from django.views import View
from uuid import UUID
from danam.danam_models import Terms, Glossimages
import json


def redirect_page(request, word):
    return redirect('/glossary/meaning/' + word)


def redirect_page_report(request, word):
    return redirect('/report/' + word) 


class AddData(View):
    def post(self, request, *args, **kwargs):
        if request.is_ajax():
            trmRoman = request.POST.get('term-roman')
            trmDev = request.POST.get('term-dev')
            trmDes = request.POST.get('description')
            trmImgThumb = request.POST.get('thumb')
            #if trmImgThumb == "": trmImgThumb = "No-data"
            trmImage = request.POST.get('image_link')
            #if trmImage == "": trmImage = "No-data"
            trmHeidICON = request.POST.get('heidicon')
            #if trmHeidICON == "": trmHeidICON = "No-data"

            terms = Terms(preflabel=trmRoman,
                          altlabel=trmDev, definition=trmDes)
            terms.save()
            if trmImgThumb:
                img = Glossimages(uuid_id=terms.uuid, altimage=trmImage,
                                  tnimage=trmImgThumb, heidicon=trmHeidICON, imgmain=True)
                img.save()

            data = {'message': "%s added" % trmRoman}
            return HttpResponse(json.dumps(data), content_type='application/json')
        else:
            raise Http404


''' displays data'''


class ListData(View):


    def get(self, request, *args, **kwargs):
        from django.db import connection
        cursor = connection.cursor()
        cursor.execute(
            """SELECT t.uuid, preflabel, t.altlabel, t.definition, altimage, tnimage, heidicon, imgmain
             FROM danam_terms as t LEFT JOIN danam_glossimages as i ON t.uuid = i.uuid_id""")
        rows = cursor.fetchall()
        result = []
        keys = ('uuid', 'prefLabel', 'altLabel', 'definition',
                'Image', 'thumb', 'heidicon', 'image_Main')
        isTuple = None
        for row in rows:
            introw = []
            for value in row:
                isTuple = isinstance(value, UUID)
                if isTuple:
                    #print(value)
                    introw.append(str(value))
                    #print('hereit comes', value)
                else:
                    introw.append(value)
            #print(row)
            result.append(dict(zip(keys, introw)))
        #print(result)
        data = json.dumps(result)
        
        return HttpResponse(data, content_type="application/json")


class UploadTerms(View):
    _eng = _nep = _def = _uuid = _thumb = _imag = _heidicon = None

    def post(self, request, *args, **kwargs):
        global _uuid, _eng, _nep, _def, _imag, _thumb, _heidicon
        if request.is_ajax():
            _uuid = request.POST.get('uuid')
            _eng = request.POST.get('eng')
            _nep = request.POST.get('nep')
            _def = request.POST.get('def')
            _imag = request.POST.get('imag')
            _thumb = request.POST.get('thumb')
            _heidicon = request.POST.get('heidicon')
            # print(self._eng)
            data = {"uuid": _uuid, "eng": _eng, "np": _nep, "def": _def, "imag": _imag, "thumb": _thumb,
                    "heidicon": _heidicon}

            return HttpResponse(json.dumps(data), content_type='application/json')
            # return HttpResponseRedirect('../update', data)

        else:
            raise Http404

    def get(self, request, *args, **kwargs):
        global _uuid, _eng, _nep, _def, _imag, _thumb, _heidicon
        from django.shortcuts import render
        return render(request, "glossary/editterms.html", {"uuid": _uuid, "eng": _eng, "np": _nep,
                                                           "def": _def, "imag": _imag, "thumb": _thumb,
                                                           "heidicon": _heidicon})


class UpdateData(View):
    def post(self, request, *args, **kwargs):
        from django.db import connection
        if request.is_ajax():
            trmUUID = request.POST.get('uuid')
            trmRoman = request.POST.get('term-roman')
            trmDev = request.POST.get('term-dev')
            trmDes = request.POST.get('description').replace("'", "''")

            #term = Terms.objects.get(uuid = trmUUID)
            #term.prefLabel = trmRoman
            #term.altLabel = trmDev
            #term.definition = trmDes

            updateQuery = "UPDATE danam_terms " \
                "SET preflabel = '%s', " \
                "altlabel = '%s', " \
                "definition = '%s' " \
                "WHERE uuid = '%s'" % (
                    trmRoman, trmDev, trmDes, trmUUID)
            # print(updateQuery)
            cursor = connection.cursor()
            cursor.execute(updateQuery)

            trmImgThumb = str(request.POST.get('thumb'))

            pattern = re.compile('^(?: null|0)$')
            print(trmImgThumb)
            if trmImgThumb:
                updateQuery = "UPDATE danam_glossimages " \
                              "SET altimage = '%s', " \
                              "tnimage = '%s', " \
                              "heidicon = '%s' " \
                              "WHERE uuid_id = '%s'" % (request.POST.get('image_link'), trmImgThumb,
                                                        request.POST.get('heidicon'), trmUUID)

                cursor = connection.cursor()
                cursor.execute(updateQuery)
                if cursor.rowcount == 0:
                    queryInsert = "INSERT INTO danam_glossimages(altimage, tnimage, heidicon, imgMain, uuid_id) " \
                                  "VALUES ('%s', '%s', '%s', %r, '%s')" % \
                                  (request.POST.get('image_link'), trmImgThumb,
                                   request.POST.get('heidicon'), True, trmUUID)
                    # print(queryInsert)
                    cursor = connection.cursor()
                    cursor.execute(queryInsert)
                    # image = Images(altimage = request.POST.get('image_link'), tnimage = trmImgThumb,
                    # heidicon = request.POST.get('heidicon'), imgMain = True, uuid_id = trmUUID)
                    # image.save()
            else:
                print("The data will be deleted from the image table")
                deleteQuery = "DELETE FROM " \
                              "danam_glossimages " \
                              "WHERE uuid_id = '%s'" % (trmUUID)

                cursor = connection.cursor()
                cursor.execute(deleteQuery)

            # term.save()
            msg = {'message': "%s updated" % trmRoman}
            return HttpResponse(json.dumps(msg), content_type='application/json')
        else:
            raise Http404


class DeleteData(View):
    def post(self, request, *args, **kwargs):
        from django.db import connection
        if request.is_ajax():
            trmUUID = request.POST.get('delete')
            trmRoman = request.POST.get('eng')

            deleteQuery = "DELETE FROM " \
                "danam_glossimages " \
                "WHERE uuid_id = '%s'" % (trmUUID)

            cursor = connection.cursor()
            cursor.execute(deleteQuery)

            deleteQuery = "DELETE FROM " \
                          "danam_terms " \
                          "WHERE uuid = '%s'" % (trmUUID)

            cursor = connection.cursor()
            cursor.execute(deleteQuery)

            msg = {
                'message': "%s deleted. Please wait till the page refreshes itself" % trmRoman}
            return HttpResponse(json.dumps(msg), content_type='application/json')
        else:
            raise Http404


class PostData(View):
    def get(self, request, *args, **kwargs):
        uuid = str(self.kwargs['uuid'])
        print(uuid)
        from django.db import connection
        cursor = connection.cursor()
        cursor.execute(
            """SELECT t.uuid, t.preflabel, t.altlabel, t.definition, altimage, tnimage, heidicon, imgMain
             FROM danam_terms as t LEFT JOIN danam_glossimages as i ON t.uuid = i.uuid_id WHERE t.uuid = '%s'""" % (uuid))
        rows = cursor.fetchall()
        result = None
        keys = ('uuid', 'preflabel', 'altlabel', 'definition',
                'Image', 'thumb', 'heidicon', 'image_Main')
        for row in rows:
            introw = []
            for value in row:
                isTuple = isinstance(value, UUID)
                if isTuple:
                    # print(value)
                    introw.append(str(value))
                    # print('hereit comes', value)
                else:
                    introw.append(value)
            # print(row)
            result = dict(zip(keys, introw))
        # print(result)
        data = json.dumps(result)

        return HttpResponse(data, content_type="application/json")
        # displayQuery = "SELECT t.uuid, t.preflabel, t.altlabel, t.definition, altimage, tnimage, heidicon, imgMain " \
        #             "FROM gloassary_terms as t LEFT JOIN gloassary_images as i ON t.uuid = i.uuid_id WHERE " \
        #             "t.uuid = '%s'" % (uuid)
        # #print(displayQuery)
        # cursor.execute(displayQuery)
        # rows = cursor.fetchall()
        # result = []
        # keys = ('uuid', 'preflabel', 'altlabel', 'definition', 'Image', 'thumb', 'heidicon', 'image_Main')
        # for row in rows:
        #     result.append(dict(zip(keys, row)))
        #
        # data = json.dumps(result)
        # #print(data)
        # displaydata = {
        #     'data': data
        #      }
        # #print(displaydata)
        # return HttpResponse(json.dumps(data), content_type='application/json')
        #return render(request, "glossary/details.html", result)

        # return HttpResponse(data, content_type="application/json")
