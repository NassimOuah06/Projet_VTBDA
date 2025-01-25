from django.urls import path
from . import views

urlpatterns = [
    path('scrape/', views.scrape.as_view(), name='article_scrap'),
    path('delete/', views.delete.as_view(), name='article_delete'),
    path('articles/', views.ArticleListAPIView.as_view(), name='article_liste'),
    path('articles/<int:article_id>', views.ArticleDetailAPIView.as_view(), name='alrticle_detail'),
    path('articles/resumer/<int:article_id>',views.SummarizeArticleAPIView.as_view(), name='article_resumer'),
    path('articles/analyser/<int:article_id>',views.AnalyzeArticleAPIView.as_view(), name='article_analyser'),
    path('articles/finaliser/<int:article_id>',views.FinalizeArticleAPIView.as_view(), name='article_finaliser'),
    path('articles/statestique/',views.Statestique.as_view(), name='article_visuele'),
    path('login/',views.Login.as_view(), name='login'),
    path('signeup/',views.Signe.as_view(), name='sign_up'),
    path('users/',views.Users.as_view(), name='users'),
    path('usersInfo/<str:email>',views.UsersInfo.as_view(), name='usersinfo'),
    path('getemailuser/<str:username>',views.GetEmailUser.as_view(), name='getemailuser'),
    path('updateuser/<str:email>',views.UpdateUser.as_view(), name='update_user'),
    path('deleteuser/<int:user_id>',views.DeleteUser.as_view(), name='delete_user'),
    path('logout/',views.Logout.as_view(), name='logout'),
    path('swot/<int:article_id>',views.Swot.as_view(), name='swot'),
    path('notification/<str:email_user>/', views.Notification.as_view(), name='notification'),
    
]


