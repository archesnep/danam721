from __future__ import unicode_literals
import uuid
from django.db import models
from django.contrib.postgres.fields import JSONField
from django.urls import reverse
from django.db.models.signals import pre_save
from django.dispatch import receiver
from django.utils.text import slugify
from tinymce.models import HTMLField
from django.utils.html import mark_safe
from django.template.defaultfilters import truncatechars
from django.utils.translation import gettext_lazy as _
from django.utils import timezone



STATUS_CHOICES = (
    ('d', "Draft"),
    ('p', "Published")
)


class News(models.Model):
    title = models.CharField(max_length=255, blank=True)
    slug = models.SlugField(max_length=300)
    content = HTMLField()
    created_date = models.DateTimeField()
    created_date.editable = True
    status = models.CharField(
        max_length=1, choices=STATUS_CHOICES, default='d')

    def get_absolute_url(self):
        return reverse("post_detail", args=[self.id, self.slug])

    @property
    def short_description(self):
        return truncatechars(self.content, 100)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_date']
        verbose_name = 'news'
        verbose_name_plural = 'news'
        db_table = 'danam_news'


@receiver(pre_save, sender=News)
def pre_save_slug(sender, **kwargs):
    slug = slugify(kwargs['instance'].title)
    kwargs['instance'].slug = slug


class Image(models.Model):
    post = models.ForeignKey(
        News, on_delete=models.CASCADE, related_name='images')
    image = models.ImageField(upload_to='uploadedfiles/news_img/', blank=True, null=True)

    class Meta:
        db_table = 'news_images'

    @property
    def thumbnail_preview(self):
        if self.image:
            return mark_safe('<img src="{}" width="200" height="200" />'.format(self.image.url))
        return ""

    def __str__(self):
        return str(self.post.id)


class Terms(models.Model):
    uuid = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False)
    preflabel = models.CharField(max_length=50)
    altlabel = models.CharField(max_length=50)
    definition = models.TextField()

    def __str__(self):
        return self.preflabel


class Glossimages(models.Model):
    uuid = models.ForeignKey(Terms, on_delete=models.CASCADE)
    altimage = models.CharField(max_length=300)  # alternative ImageField
    tnimage = models.CharField(max_length=300)  # should be tried
    heidicon = models.CharField(max_length=200)
    imgmain = models.BooleanField()

    def __self__(self):
        return self.altimage


# monument of the month model
class MonumentOfMonth(models.Model):
    uuid = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)
    title = models.CharField(_("Title"), max_length=255)
    slug = models.SlugField(
        default='',
        editable=False,
        max_length=300,
    )
    author = models.CharField(
        _("Curated by"), max_length=100, blank=True, null=True)
    thumbnail = models.ImageField(
        _("Thumbnail"), upload_to='danam-cms/', blank=True, null=True)
    image = models.ImageField(
        _("Primary Image"), upload_to='danam-cms/', blank=True, null=True)
    caption = models.CharField(
        _("Caption"), max_length=255, blank=True, null=True)
    description = models.TextField(blank=True)
    date = models.DateField(_("Date"), default=timezone.now)
    status = models.CharField(
        max_length=1, choices=STATUS_CHOICES, default='d')

    class Meta:
        ordering = ['-date']
        verbose_name = 'monument-of-month'
        verbose_name_plural = 'monument-of-months'
        db_table = 'monument_of_month'

    def get_absolute_url(self):
        kwargs = {
            'uuid': self.uuid,
            'slug': self.slug,
        }
        return reverse('mom-detail', kwargs=kwargs)

    def save(self, *args, **kwargs):
        value = self.title
        self.slug = slugify(value, allow_unicode=True)
        super().save(*args, **kwargs)

    @property
    def thumbnail_preview(self):
        if self.image:
            return mark_safe('<img src="{}" width="200" height="200" />'.format(self.image.url))
        return ""


# pdf uploaders
class PdfUploader(models.Model):
    title = models.CharField(_("Title"), max_length=200)
    identifier = models.CharField(_("Identifier"), null=True, blank=True, max_length=200)
    publisher = models.CharField(_("Publisher"), null=True, blank=True, max_length=200)
    author = models.CharField(max_length=100, null=True, blank=True)
    publication_date = models.CharField(
        _("Publication Date"), max_length=100, null=True, blank=True)
    docfile = models.FileField(upload_to='danam-cms/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'pdf_uploader'
        ordering = ['-publication_date']

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        kwargs = {
            'pk': self.id
        }
        return reverse('pdf-detail', kwargs=kwargs)
