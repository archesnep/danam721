from django.conf.urls import include, url
from django.conf import settings
from django.conf.urls.static import static
from django.contrib.auth.decorators import login_required
from django.urls import include, path
from django.conf.urls.i18n import i18n_patterns
from django.views.generic import TemplateView

from danam.views import (danamviews, glossary_form, glossaryviews, newsviews,
                         teamviews)
from danam.views.danamviews import (PdfDeleteView, PdfListView, mom_delete,
                                    mom_detail, mom_list, mom_update,
                                    mom_upload, pdfedit, pdfupload)
from danam.views.download_views import DownloadFiles, OpenFile
from danam.views.glossary_form import (AddData, DeleteData, ListData, PostData,
                                       UpdateData, UploadTerms)

urlpatterns = [
    url(r'^', include('arches.urls')),
    path('danam/', danamviews.danam, name='danam_page'),
    path('nhdp/', danamviews.nhdp, name='nhdp_page'),
    path('team/', teamviews.team, name='team'),
    path('news/', newsviews.news_list, name='news_list'),
    path('upload-news', newsviews.upload_post, name="upload_news"),
    path('<int:id>/<slug:slug>/', newsviews.post_detail, name="post_detail"),
    path('about_aa/', teamviews.about_aa, name='about_aa'),
    path('about_ab/', teamviews.about_ab, name='about_ab'),
    path('about_ag/', teamviews.about_ag, name='about_ag'),
    path('about_ak/', teamviews.about_ak, name='about_ak'),
    path('about_am/', teamviews.about_am, name='about_am'),
    path('about_em/', teamviews.about_em, name='about_em'),
    path('about_bb/', teamviews.about_bb, name='about_bb'),
    path('about_bbs/', teamviews.about_bbs, name='about_bbs'),
    path('about_bm/', teamviews.about_bm, name='about_bm'),
    path('about_cb/', teamviews.about_cb, name='about_cb'),
    path('about_cw/', teamviews.about_cw, name='about_cw'),
    path('about_dk/', teamviews.about_dk, name='about_dk'),
    path('about_hd/', teamviews.about_hd, name='about_hd'),
    path('about_ib/', teamviews.about_ib, name='about_ib'),
    path('about_lo/', teamviews.about_lo, name='about_lo'),
    path('about_ma/', teamviews.about_ma, name='about_ma'),
    path('about_mb/', teamviews.about_mb, name='about_mb'),
    path('about_ng/', teamviews.about_ng, name='about_ng'),
    path('about_nk/', teamviews.about_nk, name='about_nk'),
    path('about_pm/', teamviews.about_pm, name='about_pm'),
    path('about_rk/', teamviews.about_rk, name='about_rk'),
    path('about_rm/', teamviews.about_rm, name='about_rm'),
    path('about_rs/', teamviews.about_rs, name='about_rs'),
    path('about_rt/', teamviews.about_rt, name='about_rt'),
    path('about_sd/', teamviews.about_sd, name='about_sd'),
    path('about_st/', teamviews.about_st, name='about_st'),
    path('about_ts/', teamviews.about_ts, name='about_ts'),
    path('about_rga/', teamviews.about_rga, name='about_rga'),
    path('about_vs/', teamviews.about_vs, name='about_vs'),
    path('about_yb/', teamviews.about_yb, name='about_yb'),
    path('about_mm/', teamviews.about_mm, name='about_mm'),
    path('about_jl/', teamviews.about_jl, name='about_jl'),
    path('about_ld/', teamviews.about_ld, name='about_ld'),
    path('about_pb/', teamviews.about_pb, name='about_pb'),
    path('about_vb/', teamviews.about_vb, name='about_vb'),
    path('about_ra/', teamviews.about_ra, name='about_ra'),
    path('about_rmh/', teamviews.about_rmh, name='about_rmh'),
    path('about_mg/', teamviews.about_mg, name='about_mg'),
    path('about_jm/', teamviews.about_jm, name='about_jm'),
    path('about_jlama/', teamviews.about_jlama, name='about_jlama'),
    path('glossary/', glossaryviews.glossary, name='list_glossary'),
    path('about_da/', teamviews.about_da, name='about_da'),
    path('about_rsk/', teamviews.about_rsk, name='about_rsk'),
    path('about_ar/', teamviews.about_ar, name='about_ar'),
    path('about_ns/', teamviews.about_ns, name='about_ns'),
    path('about_pn/', teamviews.about_pn, name='about_pn'),
    path('about-sabrina-dangol/', teamviews.about_sad, name='about_sad'),
    path('about-monalisa-maharjan/', teamviews.about_mmn, name='about_mmn'),
    path('about-bishal-diganta/', teamviews.about_bishal_diganta, name='about_bishal_diganta'),
    path('glossary/', login_required(TemplateView.as_view(
        template_name="glossary/glossary.html"))),
    path('glossary/add/', AddData.as_view()),
    path('glossary/list/', ListData.as_view()),
    path('glossary/glossaries/',
         TemplateView.as_view(template_name="glossary/list.html"), name='list_glossary'),
    path('glossary/upload/', UploadTerms.as_view()),
    path('glossary/update/', UploadTerms.as_view()),
    path('glossary/do_update/', UpdateData.as_view()),
    path('glossary/remove/', DeleteData.as_view()),
    path('glossary/api/<uuid>', PostData.as_view()),
    path('glossary/modify-term/<uuid>/',
         login_required(TemplateView.as_view(template_name="glossary/update.html"))),
    path('glossary/meaning/<uuid>/',
         TemplateView.as_view(template_name="glossary/details.html")),
    path('glossary/meaning/meaning/<str:word>/', glossary_form.redirect_page),
    path('glossary/glossary/report/<str:word>/',
         glossary_form.redirect_page_report),
    path('date-conversion-chart/',
         danamviews.date_conversion, name='date_conversion'),
    path('download/jsonfile/', DownloadFiles.as_view()),
    path('download/listjson/',
         TemplateView.as_view(template_name="downloads/json-download.html")),
    path('download/downloadfile/<file>/', OpenFile.as_view()),
    path('danam-feedback/', danamviews.feedback, name='feedback'),
    path('heritage-focus-areas/', danamviews.heritage_focus, name='heritage_focus'),
    path('how-we-work/', danamviews.how_we_work, name='how_we_work'),
    path('how-to-find-monument/', danamviews.how_to_search, name='how_to_find'),
    path('heritage-focus-area-pimbahal/', danamviews.pimbahal, name='pimbahal'),
    path('heritage-focus-area-bhurticomplex/', danamviews.bhurticomplex, name='bhurticomplex'),
    path('heritage-focus-area-ikalakhu/', danamviews.ikalakhu, name='ikalakhu'),
    path('heritage-focus-area-sundhara/', danamviews.sundhara, name='sundhara'),
    path('heritage-foucus-area-cyasal/', danamviews.cyasal, name='cyasal'),
    path('heritage-foucus-area-devagala-kirtipur/', danamviews.devagala_kritipur, name='devagala_kritipur'),
    path('heritage-foucus-area-baghabhairava-kirtipur/', danamviews.baghabhairava_kritipur, name='baghabhairava_kritipur'),
    path('heritage-foucus-area-patan-durbar-square/', danamviews.patan_durbar_square, name='patan_durbar_square'),
    path('heritage-foucus-area-sinja-valley/', danamviews.sinja_valley, name='sinja_valley'),
    path('heritage-foucus-area-sunaguthi/', danamviews.sunaguthi, name='sunaguthi'),
    path('heritage-foucus-area-bungamati/', danamviews.bungamati, name='bungamati'),
    path('publications/', danamviews.published_articles, name='publications'),
    path('phuydah-dipankara/', danamviews.phudyah_dipankara, name='phudyah-dipankara'),
    path('associated-projects/', danamviews.associated_project,
         name='associated_project'),
    path('tinymce/', include('tinymce.urls')),
    path('monument-of-the-month/upload/',
         danamviews.mom_upload, name='mom-create'),
    path('monument-of-the-month/', danamviews.mom_list, name='mom-list'),
    path('<uuid:uuid>/<str:slug>/',
         danamviews.mom_detail, name='mom-detail'),
    path('<uuid:uuid>/<str:slug>/update/',
         danamviews.mom_update, name='mom-update'),
    path('<uuid:uuid>/<str:slug>/delete/', danamviews.mom_delete, name='mom-delete'),
    path('pdfs', PdfListView.as_view(), name='pdf-list'),
    path('pdf-upload', danamviews.pdfupload, name='pdf-upload'),
    path('pdf/update/<int:id>/', danamviews.pdfedit, name='pdf-edit'),
    path('pdf/delete/<int:id>/', PdfDeleteView.as_view(), name='pdf-delete'),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# if settings.SHOW_LANGUAGE_SWITCH is True:
#     urlpatterns = i18n_patterns(*urlpatterns)
