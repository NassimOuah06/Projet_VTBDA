from django.urls import path
from . import views

urlpatterns = [
    path('articles/', views.ArticleListAPIView.as_view(), name='alrticle_liste'),
    path('articles/<int:article_id>', views.ArticleDetailAPIView.as_view(), name='alrticle_liste'),
]
