from django.shortcuts import render
from django.http import HttpResponse, Http404
from django.contrib.auth.decorators import login_required
import json
from django.views import View



import os
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
source_folder = os.path.join(BASE_DIR, '/web_root/danam/*.json')


class DownloadFiles(View):
    from django.utils.decorators import method_decorator

    @method_decorator(login_required(login_url='/login/'))
    def get(self, request, *args, **kwargs):


        import glob


        list_of_files = glob.glob(source_folder)  # * means all if need specific format then *.csv
        sorted_files = sorted(list_of_files, key=os.path.getmtime, reverse = True)

        filenames = []
        for file in sorted_files:
            _, filename = os.path.split(file)
            filenames.append(filename)

        file_list = {'json_files': filenames[:3]}
        #print latest_file

        return HttpResponse(json.dumps(file_list), content_type="application/json")
class OpenFile(View):
    def get(self, request, *args, **kwargs):
        filename = self.kwargs['file']
        print("test", BASE_DIR)

        path = os.path.join(BASE_DIR, '/web_root/danam/')
        fsock = open(path  + filename, 'r')
        response = HttpResponse(fsock, content_type='application/json')
        response['Content-Disposition'] = "attachment; filename=%s" % \
                                          (filename)
        return response