from danam.danamforms import MonumentOfMonthForm, PdfUploadForm
from danam.danam_models import MonumentOfMonth, PdfUploader
from django.contrib import messages
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseRedirect
from django.shortcuts import get_object_or_404, redirect, render
from django.urls import reverse_lazy
from django.views.generic import (CreateView, DeleteView, DetailView, ListView,
                                  UpdateView)


def danam(request):
    from django.db import connection

    cursor = connection.cursor()
    cursor.execute(
        """select count(*) from  resource_instances where graphid = 'f35cc1ca-9322-11e9-a5cc-0242ac120006';""")
    m_count = cursor.fetchone()
    print(m_count[0])
    cursor.execute(
        """select count(*) from tiles, resource_instances where 
        tiles.resourceinstanceid = resource_instances.resourceinstanceid 
        and graphid = 'f35cc1ca-9322-11e9-a5cc-0242ac120006' 
        and tiledata -> '4b84bd80-9eea-11e9-8b93-0242ac120006' is not null;""")
    o_count = cursor.fetchone()
    print(o_count[0])
    context = {
        "m_count": m_count[0],
        "o_count": o_count[0]
    }
    return render(request, 'partials/danam.htm', context)


def nhdp(request):
    return render(request, 'partials/nhdp.htm')


@login_required
def glossary(request):
    return render(request, 'glossary/glossary.html')


def date_conversion(request):
    return render(request, 'partials/dcc.htm')


def design(request):
    return render(request, 'partials/design.htm')


# heritage focus areas
def pimbahal(request):
    return render(request, 'partials/feature_search/pimbahal.htm')


def bhurticomplex(request):
    return render(request, 'partials/feature_search/bhurti.htm')


def ikalakhu(request):
    return render(request, 'partials/feature_search/ikalakhu.htm')


def sundhara(request):
    return render(request, 'partials/feature_search/sundhara.htm')


def devagala_kritipur(request):
    return render(request, 'partials/feature_search/devagala_area_kritipur.htm')


def baghabhairava_kritipur(request):
    return render(request, 'partials/feature_search/baghabhairava_kritipur.htm')


def cyasal(request):
    return render(request, 'partials/feature_search/cyasal.htm')


def patan_durbar_square(request):
    return render(request, 'partials/feature_search/patan_durbar_square.htm')


def sinja_valley(request):
    return render(request, 'partials/feature_search/sinja.htm')


def sunaguthi(request):
    return render(request, 'partials/feature_search/sunaguthi.htm')


def bungamati(request):
    return render(request, 'partials/feature_search/bungamati.htm')


# end of heritage focus areas 
def associated_project(request):
    return render(request, 'partials/associated_project.htm')


def feedback(request):
    return render(request, 'partials/feedback.htm')


def heritage_focus(request):
    return render(request, 'partials/heritage_focus_area.htm')


def how_we_work(request):
    return render(request, 'partials/how_we_work.htm')


def how_to_search(request):
    return render(request, 'partials/how_to_search.htm')


def published_articles(request):
    return render(request, 'partials/published_articles.htm')


def phudyah_dipankara(request):
    return render(request, 'partials/phudyah_dipankara.html')


@login_required
def mom_upload(request):
    if request.method == 'POST':
        form = MonumentOfMonthForm(request.POST or None, request.FILES or None)
        if form.is_valid():
            form.save()
            return redirect('mom-list')
    else:
        form = MonumentOfMonthForm()
    context = {
        'form': form,
    }
    return render(request, 'MoM/upload_MOM.htm', context)


def mom_list(request):
    mom_list = MonumentOfMonth.objects.filter(status='p')
    context = {
        'monument_list': mom_list
    }
    return render(request, 'MoM/mom_list.htm', context)


def mom_detail(request, uuid=None, slug=None):
    mom = get_object_or_404(MonumentOfMonth, uuid=uuid, slug=slug)
    context = {
        'monument': mom
    }
    return render(request, 'MoM/mom_details.htm', context)


def mom_update(request, uuid=None, slug=None):
    monument = get_object_or_404(MonumentOfMonth, uuid=uuid, slug=slug)
    if request.method == 'POST':
        form = MonumentOfMonthForm(request.POST or None, request.FILES or None, instance=monument)
        if form.is_valid():
            form.save()
            return redirect('mom-list')
    else:
        form = MonumentOfMonthForm(instance=monument)
    return render(request, 'MoM/update_MOM.htm', {'form': form})


def mom_delete(request, uuid=None, slug=None):
    monument = get_object_or_404(MonumentOfMonth, uuid=uuid, slug=slug)
    if request.method == 'POST':
        monument.delete()
        return redirect('mom-list')
    context = {
        'monument': monument
    }
    return render(request, 'MoM/confirm_delete.htm', context)


def pdfupload(request):
    if request.method == 'POST':
        form = PdfUploadForm(request.POST or None, request.FILES or None)
        if form.is_valid():
            form.save()
            return redirect('pdf-list')
    else:
        form = PdfUploadForm()
    context = {
        'form': form
    }
    return render(request, 'partials/pdf_upload_form.htm', context)


class PdfListView(ListView):
    model = PdfUploader
    template_name = 'partials/list_pdfs.htm'

    def get_context_data(self, **kwargs):
        context = super(PdfListView, self).get_context_data(**kwargs)
        context['pdfs'] = PdfUploader.objects.all()
        return context


def pdfedit(request, id=None):
    pdf = get_object_or_404(PdfUploader, id=id)
    if request.method == 'POST':
        form = PdfUploadForm(request.POST or None,
                             request.FILES or None, instance=pdf)
        if form.is_valid():
            form.save()
            return redirect('pdf-list')

    template_name = 'partials/update_pdf.htm'
    context = {'form': PdfUploadForm(instance=pdf)}
    return render(request, template_name, context)



class PdfDeleteView(DeleteView):
    model = PdfUploader
    slug_url_kwarg = 'id'
    slug_field = 'id'
    context_object_name = 'pdf'
    success_url = reverse_lazy('pdf-list')
    template_name = 'partials/delete_pdf.htm'
