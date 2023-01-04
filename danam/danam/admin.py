from django.contrib import admin
from django.contrib import messages
from django.utils.translation import ngettext
from danam.danam_models import News, Image, MonumentOfMonth, PdfUploader
from danam.newsforms import NewsAdminForm


def published_filter(modeladmin, request, queryset):
    queryset.update(status='p')


published_filter.short_description = 'Mark selected news as published'


class Imagesinline(admin.TabularInline):
    model = Image
    readonly_fields = ('thumbnail_preview',)
    list_display = [
        'image'
    ]

    def thumbnail_preview(self, obj):
        return obj.thumbnail_preview

    thumbnail_preview.short_description = 'Image Preview'
    thumbnail_preview.allow_tags = True


class PostAmdin(admin.ModelAdmin):
    inlines = [
        Imagesinline
    ]
    list_display = (
        "title",
        "created_date",
        "short_description",
        "status",
    )
    search_fields = ['title', 'created_date']
    ordering = ['-created_date']
    actions = [published_filter, ]
    form = NewsAdminForm

    class Media:
        js = ('/media/js/tinymce/tinymce.min.js',
              '',)


admin.site.register(News, PostAmdin)


class MonumentOfMonthAdmin(admin.ModelAdmin):

    def make_selected_monument_of_month_published(self, request, queryset):
        updated = queryset.update(status='p')
        self.message_user(request, ngettext(
            '%d story was successfully marked as published.',
            '%d stories were successfully marked as published.',
            updated,
        ) % updated, messages.SUCCESS)

    def make_selected_monument_of_month_draft(self, request, queryset):
        updated = queryset.update(status='d')
        self.message_user(request, ngettext(
            '%d monumement was successfully marked as draft.',
            '%d monuments were successfully marked as draft.',
            updated,
        ) % updated, messages.SUCCESS)

    list_display = ('title', 'description', 'date',
                    'status', 'thumbnail_preview')
    actions = [make_selected_monument_of_month_published, make_selected_monument_of_month_draft]


admin.site.register(MonumentOfMonth, MonumentOfMonthAdmin)


class PdfuploaderAdmin(admin.ModelAdmin):
    list_display = ('title', 'author', 'publication_date', 'uploaded_at')

admin.site.register(PdfUploader, PdfuploaderAdmin)
