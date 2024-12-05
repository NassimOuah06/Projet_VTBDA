from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Article
from .serializers import ArticleSerializer

# Vue pour récupérer tous les articles
class ArticleListAPIView(APIView):
    def get(self, request):
        articles = Article.objects.all()
        serializer = ArticleSerializer(articles, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

# Vue pour récupérer un article spécifique par son ID
class ArticleDetailAPIView(APIView):
    def get(self, request, article_id):
        try:
            article = Article.objects.get(id=int(article_id))
        except Article.DoesNotExist:
            return Response({"error": "Article non trouvé"}, status=status.HTTP_404_NOT_FOUND)

        serializer = ArticleSerializer(article)
        return Response(serializer.data)
