from django import forms
from .danam_models import News, Image
from tinymce.widgets import TinyMCE
from django.contrib.admin.widgets import AdminDateWidget


TITLE_LENGTH_ERROR = "This title lenght is too long, Please make sure title characters are 200 characters or less."
TITLE_EMPTY_ERROR = "You'll have to add a title."
TEXT_EMPTY_ERROR = "Please enter the content of the news."
NO_CATEGORY_ERROR = "Please select a author category."


class NewsForm(forms.ModelForm):
    title = forms.CharField(
        label='Title',
        widget=forms.TextInput(
            attrs={'placeholder': 'Enter the suitable title for the article'})
    )
    content = forms.CharField(widget=TinyMCE(
        attrs={'cols': 50, 'rows': 15}), error_messages={
            'required': TEXT_EMPTY_ERROR
    })

    class Meta:
        model = News
        fields = ['title', 'content', 'created_date', 'status']
        widgets = {
            'created_date': forms.DateInput(format=('%d-%m-%Y'), attrs={'firstDay': 1, 'pattern=': '\d{4}-\d{2}-\d{2}', 'format': 'yyyy-mm-dd', 'type': 'date'}),
        }


class NewsAdminForm(forms.ModelForm):
    title = forms.CharField(
        label='Title',
        widget=forms.TextInput(
            attrs={'placeholder': 'Enter the suitable title for the article'})
    )
    content = forms.CharField(widget=TinyMCE(
        attrs={'cols': 50, 'rows': 15}), error_messages={
            'required': TEXT_EMPTY_ERROR
    })
    created_date = forms.DateField(widget=AdminDateWidget())

    class Meta:
        model = News
        fields = ['title', 'content', 'created_date', 'status']
        widgets = {
            'created_date': forms.DateInput(format=('%d-%m-%Y'), attrs={'firstDay': 1, 'pattern=': '\d{4}-\d{2}-\d{2}', 'format': 'yyyy-mm-dd', 'type': 'date'}),
        }


class ImageForm(forms.ModelForm):
    image = forms.FileField(
        required=False, widget=forms.ClearableFileInput(attrs={'multiple': True}))

    class Meta:
        model = Image
        fields = (
            'image',
        )
