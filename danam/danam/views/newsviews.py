from danam.danam_models import News, Image
from django.contrib.auth.decorators import login_required
from danam.newsforms import NewsForm, ImageForm
from django.contrib.auth import authenticate, login, logout
from django.shortcuts import render, get_object_or_404, redirect
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.contrib import messages


def news_list(request):
    post_list = News.objects.filter(status='p').order_by('-created_date')
    paginator = Paginator(post_list, 5)
    page = request.GET.get('page')
    try:
        posts = paginator.page(page)
    except PageNotAnInteger:
        posts = paginator.page(1)
    except EmptyPage:
        posts = paginator.page(paginator.num_pages)

    if page is None:
        start_index = 0
        end_index = 7
    else:
        (start_index, end_index) = proper_pagination(posts, index=4)

    page_range = list(paginator.page_range)[start_index:end_index]

    context = {
        'posts': posts,
        'page_range': page_range,
    }
    return render(request, 'news/post_list.htm', context)


def proper_pagination(posts, index):
    start_index = 0
    end_index = 7
    if posts.number > index:
        start_index = posts.number - index
        end_index = start_index + end_index
    return (start_index, end_index)


def post_detail(request, id, slug):
    post = get_object_or_404(News, id=id, slug=slug)
    context = {
        'post': post
    }
    return render(request, 'news/post_detail.htm', context)


@login_required
def upload_post(request):
    if request.method == 'POST':
        form = NewsForm(request.POST)
        file_form = ImageForm(request.POST, request.FILES)
        files = request.FILES.getlist('image')
        if form.is_valid and file_form.is_valid():
            feed_instance = form.save(commit=False)
            feed_instance.save()
            for f in files:
                file_instance = Image(image=f, post=feed_instance)
                file_instance.save()
            messages.success(request, "Post has been successfully created.")
            return redirect('news_list')
    else:
        form = NewsForm()
        file_form = ImageForm()
    context = {
        'form': form,
        'file_form': file_form
    }
    return render(request, 'news/post_create.htm', context)
