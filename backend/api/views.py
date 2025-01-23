from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Article, Personne
from .serializers import ArticleSerializer
from .Functions.scrap import scrape_darknet_data
from .Functions.resumer import summarize_article
from .Functions.detecteMenace import analyser_texte
import json
import pandas as pd
from django.contrib.auth import authenticate
from collections import Counter
from sklearn.feature_extraction.text import TfidfVectorizer
import re

MOTS_CLES_MENACES = {
    "ransomware", "malware", "phishing", "exploit", "zero-day", "ddos", "brute force", "backdoor", 
    "trojan", "spyware", "keylogger", "botnet", "rootkit", "social engineering", "vulnerability", 
    "data breach", "cyber attack", "hacking", "dark web", "leak", "cryptojacking", "bitcoin", 
    "Monero", "AlphaBay", "Agora", "Silk Road", "illegal drugs", "weapons", "stolen data", 
    "identity theft", "blackmail", "fraud", "credit card scam", "money laundering", "cryptocurrency", 
    "hidden services", "P2P network", "TOR network", "illegal transactions", "darknet vendor"
}

def detecter_mots_cles(texte):
    mots_cles_trouves = set()
    for mot in MOTS_CLES_MENACES:
        if re.search(rf"\b{mot}\b", texte, re.IGNORECASE):
            mots_cles_trouves.add(mot)
    return mots_cles_trouves


def clean_text(text):
    """
    Cleans the text by removing special characters and unnecessary spaces.
    """
    text = re.sub(r'\s+', ' ', text)  # Remove multiple spaces
    text = re.sub(r'[^\w\s]', '', text)  # Remove special characters
    return text.strip()

class scrape(APIView):
    def post(self, request):
        # Chemin vers le fichier JSON généré par scrape_darknet_data
        API_KEY = "AIzaSyA5AnkgAu7SSU9Zquq475xW28tVQqxqrMQ"
        THEMES = ["darknet", "darkweb", "darknet forums", "cyber crimes", "darkweb forums", "darknet new malwares", "darknet marketplace"]
        ID_SEARCH = "459e8c331e3324237"
        OUTPUT_FILE = "resultats_darknet.json"
        try:
            # Call the scraping function
            scraped_data = scrape_darknet_data(API_KEY, THEMES, ID_SEARCH, output_file=OUTPUT_FILE)

            # Process and save the scraped data to the database
            for item in scraped_data:
                content = item.get("content", "") 
                if content:
                    mot_cle = detecter_mots_cles(content)
                else:
                    mot_cle = "No Keywords"
                description = clean_text(content)
                Article.objects.create(
                    title=item.get("title", "Titre indisponible"),
                    description=description,
                    link=item.get("url", ""),
                    mot_cle=mot_cle,
                    image='images/default.jpg',
                    analyser=False,
                    finaliser=False
                )
            return Response({"message": "Articles importés avec succès."}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
class delete(APIView):
    def post(self, request):
        Article.objects.all().delete()
        return Response({"message": "Tous les articles ont été supprimés."}, status=status.HTTP_200_OK)

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

class SummarizeArticleAPIView(APIView):
    def get(self, request, article_id):

        try:
            # Fetch the article from the database
            article = Article.objects.get(id=article_id)
            article_data = {
                "title": article.title,
                "content": article.description  # Assuming 'description' contains the content to summarize
            }

            # Summarize the article
            summary = summarize_article(article_data, num_sentences= 3 , language='french')
            return Response(summary, status=status.HTTP_200_OK)
        except Article.DoesNotExist:
            return Response({"error": "Article not found."}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class Statestique(APIView):
    def get(self, request):
        try:
            article = Article.objects.filter()

        except Article.DoesNotExist:
            return Response({"error": "Article non trouvé"}, status=status.HTTP_404_NOT_FOUND)

        return Response({"image": article.image})

class AnalyzeArticleAPIView(APIView):
    def post(self, request, article_id):
        try:
            article = Article.objects.get(id=int(article_id))
        except Article.DoesNotExist:
            return Response({"error": "Article non trouvé"}, status=status.HTTP_404_NOT_FOUND)
        try:
            # Analyse de l'article
            rapport = analyser_texte(article.description)
            # article.analyser = True
            # article.save()
            return Response({"Rapport": rapport}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class FinalizeArticleAPIView(APIView):
    def post(self, request, article_id):
        try:
            article = Article.objects.get(id=int(article_id))
        except Article.DoesNotExist:
            return Response({"error": "Article non trouvé"}, status=status.HTTP_404_NOT_FOUND)
        try:
            # Analyse de l'article
            

            
            # article.finaliser = True
            # article.save()
            return Response(message="Article finalisé avec succes", status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class Signe(APIView):
    def post(self, request):
        data = request.data
        email = data.get('email')
        username = data.get('username')
        password = data.get('password')

        # Vérifie que tous les champs sont présents
        if not username or not password or not email:
            return Response(
                {"error": "Veuillez fournir un nom d'utilisateur, un email et un mot de passe."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Vérifie si l'utilisateur ou l'email existe déjà
        if Personne.objects.filter(username=username).exists():
            return Response(
                {"error": "Ce nom d'utilisateur est déjà pris."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if Personne.objects.filter(email=email).exists():
            return Response(
                {"error": "Cet email est déjà utilisé."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Crée l'utilisateur
        user = Personne.objects.create_user(
            username=username,
            email=email,
            password=password  # Le mot de passe est automatiquement hashé
        )

        return Response(
            {"message": "Compte créé avec succès."},
            status=status.HTTP_201_CREATED
        )

class Login(APIView):
    def post(self, request):
        data = request.data
        username = data.get('username')
        password = data.get('password')

        # Vérifie que les champs 'username' et 'password' sont présents
        if not username or not password:
            return Response(
                {"error": "Veuillez fournir un nom d'utilisateur et un mot de passe."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Authentification de l'utilisateur
        user = authenticate(username=username, password=password)

        if user:
            # Génération du token JWT
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "message": "Authentification réussie.",
                    "access_token": str(refresh.access_token),
                    "refresh_token": str(refresh)
                },
                status=status.HTTP_200_OK
            )
        else:
            return Response(
                {"error": "Nom d'utilisateur ou mot de passe incorrect."},
                status=status.HTTP_400_BAD_REQUEST
            )