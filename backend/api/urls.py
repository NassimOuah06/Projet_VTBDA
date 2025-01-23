from django.urls import path
from . import views

urlpatterns = [
    path('scrap/', views.scrape.as_view(), name='article_scrap'),
    path('delete/', views.delete.as_view(), name='article_delete'),
    path('articles/', views.ArticleListAPIView.as_view(), name='article_liste'),
    path('articles/<int:article_id>', views.ArticleDetailAPIView.as_view(), name='alrticle_detail'),
    path('articles/resumer/<int:article_id>',views.SummarizeArticleAPIView.as_view(), name='article_resumer'),
    path('articles/analyser/<int:article_id>',views.AnalyzeArticleAPIView.as_view(), name='article_analyser'),
    path('articles/finaliser/<int:article_id>',views.FinalizeArticleAPIView.as_view(), name='article_finaliser'),
    path('articles/statestique/',views.Statestique.as_view(), name='article_visuele'),
    path('login/',views.Login.as_view(), name='login'),
    path('signeup/',views.Signe.as_view(), name='sign_up'),
]
