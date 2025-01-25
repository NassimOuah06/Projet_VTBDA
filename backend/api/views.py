from rest_framework.views import APIView # type: ignore
from rest_framework.response import Response # type: ignore
from rest_framework import status # type: ignore
from django.contrib.auth.hashers import make_password
from rest_framework_simplejwt.tokens import RefreshToken # type: ignore
from .models import Article, Personne
from rest_framework.permissions import AllowAny # type: ignore
from django.core.validators import validate_email
from django.core.exceptions import ValidationError
from .serializers import ArticleSerializer
from .Functions.scrap import scrape_darknet_data
from .Functions.swot import perform_swot_analysis,setup_swot_analyzer
from .Functions.resumer import summarize_long_text
from .Functions.detecteMenace import analyser_texte
from .Functions.notification import monitor_rss_feeds
from rest_framework.permissions import IsAuthenticated # type: ignore
from django.contrib.auth.hashers import check_password
import json
import os
import smtplib
import feedparser  # type: ignore # Pour lire les flux RSS
import pandas as pd # type: ignore
from django.contrib.auth import authenticate
from collections import Counter
from sklearn.feature_extraction.text import TfidfVectorizer
import re
from .serializers import PersonneSerializer  # Vous devrez créer ce sérialiseur

MOTS_CLES_MENACES = {
    "ransomware", "malware", "phishing", "exploit", "zero-day", "ddos", "brute force", "backdoor", 
    "trojan", "spyware", "keylogger", "botnet", "rootkit", "social engineering", "vulnerability", 
    "data breach", "cyber attack", "hacking", "dark web", "leak", "cryptojacking", "bitcoin", 
    "Monero", "AlphaBay", "Agora", "Silk Road", "illegal drugs", "weapons", "stolen data", 
    "identity theft", "blackmail", "fraud", "credit card scam", "money laundering", "cryptocurrency", 
    "hidden services", "P2P network", "TOR network", "illegal transactions", "darknet vendor"
}

KEYWORD_IMAGE_MAPPING = {
    "backdoor": "backdoor.jpg",
    "cryptojacking": "cryptojacking.jpg",
    "cyber crimes": "cybercrimes.jpg",
    "darknet": "darknet.jpg",
    "darkweb": "darkweb.jpg",
    "ddos": "ddos.png",
    "hacking": "hacking.jpg",
    "malware": "malware.jpg",
    "mitm": "MITM.png",
    "phishing": "phishing.png",
    "ransomware": "ransomware.jpg",
    "rat": "RAT.jpg",
    "rootkit": "rootkit.png",
    "sql injection": "sqlinjection.png",
    "trojan": "trojan.jpg",
    "xss": "XSS.jpg",
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


class Notification(APIView):
    def post(self, request, email_user):  # Récupérer l'email depuis l'URL
        email_to = email_user  # Utiliser l'email de l'URL
        if not email_to:
            return Response({"error": "L'email de l'utilisateur est requis."}, status=status.HTTP_400_BAD_REQUEST)

        # Appeler la fonction pour surveiller les flux RSS et envoyer les notifications
        monitor_rss_feeds(email_to)

        return Response({"message": "Notifications établies avec succès."}, status=status.HTTP_200_OK)


""" lister les utilisateurs  """
class Users(APIView):
    def get(self, request):
        # Récupérer tous les utilisateurs
        users = Personne.objects.all()
        
        # Sérialiser les données
        serializer = PersonneSerializer(users, many=True)
        
        # Retourner la réponse
        return Response(serializer.data, status=status.HTTP_200_OK)

class scrape(APIView):
    def post(self, request):
        API_KEY = "AIzaSyA5AnkgAu7SSU9Zquq475xW28tVQqxqrMQ"
        THEMES = ["darknet", "darkweb", "darknet forums", "cyber crimes", "darkweb forums", "darknet new malwares", "darknet marketplace"]
        ID_SEARCH = "459e8c331e3324237"
        OUTPUT_FILE = "resultats_darknet.json"

        try:
            # Call the scraping function
            scraped_data = scrape_darknet_data(API_KEY, THEMES, ID_SEARCH, output_file=OUTPUT_FILE)

            # Process and save data to the database
            for item in scraped_data:
                content = item.get("content", "")
                if content:
                    mot_cles = detecter_mots_cles(content)  # mot_cles is a list of keywords
                else:
                    mot_cles = ["No Keywords"]  # Default keyword if no content

                # Select the image based on the first matching keyword
                image_name = "default.jpg"  # Default image
                for keyword in mot_cles:
                    if keyword.lower() in KEYWORD_IMAGE_MAPPING:
                        image_name = KEYWORD_IMAGE_MAPPING[keyword.lower()]
                        break  # Use the first matching keyword

                image_path = os.path.join("images", image_name)

                # Clean the description
                description = clean_text(content)

                # Create the article in the database
                Article.objects.create(
                    title=item.get("title", "Titre indisponible"),
                    description=description,
                    link=item.get("url", ""),
                    mot_cle=", ".join(mot_cles),  # Store keywords as a comma-separated string
                    image=image_path,  # Use the image path
                    analyser=False,
                    finaliser=False
                )

            return Response({"message": "Articles importés avec succès."}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


""" supprimer tout les articles (juste pour les tests) """    
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
            summary = summarize_long_text(article.description)
            article_data = {
                "title": article.title,
                "summary": summary  # Assuming 'description' contains the content to summarize
            }
            # Summarize the article
            
            return Response(article_data, status=status.HTTP_200_OK)
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
            article.finaliser = True
            article.save()
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

        # Valide l'email
        try:
            validate_email(email)
        except ValidationError:
            return Response(
                {"error": "Veuillez fournir un email valide."},
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
        try:
            user = Personne.objects.create_user(
                username=username,
                email=email,
                password=password  # Le mot de passe est automatiquement hashé
            )

            # Génération des tokens
            refresh = RefreshToken.for_user(user)
            access_token = str(refresh.access_token)

            return Response(
                {
                    "message": "Compte créé avec succès.",
                    "access_token": access_token,
                    "refresh_token": str(refresh)
                },
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
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

        try:
            # Récupérer l'utilisateur (Personne) correspondant au username
            user = Personne.objects.get(username=username)
        except Personne.DoesNotExist:
            return Response(
                {"error": "Nom d'utilisateur ou mot de passe incorrect."},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Vérifier que le mot de passe est correct
        if check_password(password, user.password):  # Compare le mot de passe fourni avec le mot de passe haché
            try:
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
            except Exception as e:
                return Response(
                    {"error": "Une erreur s'est produite lors de la génération du token."},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            return Response(
                {"error": "Nom d'utilisateur ou mot de passe incorrect."},
                status=status.HTTP_400_BAD_REQUEST
            )
            
class GetEmailUser(APIView):
    def get(self, request, username):
        try:
            # Récupérer l'utilisateur
            user = Personne.objects.get(username=username)
        except Personne.DoesNotExist:
            return Response(
                {"error": "Utilisateur non trouvé."},
                status=status.HTTP_404_NOT_FOUND
            )

        return Response({"email": user.email}, status=status.HTTP_200_OK)            
            
class Logout(APIView):
    def post(self, request):
        try:
            # Récupérer le token de rafraîchissement (refresh token) de la requête
            refresh_token = request.data.get('refresh_token')
            print(refresh_token)
            if not refresh_token:
                return Response(
                    {"error": "Le token de rafraîchissement est requis."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Invalider le token de rafraîchissement
            token = RefreshToken(refresh_token)
            
           
            
            return Response(
                {"message": "Déconnexion réussie."},
                status=status.HTTP_200_OK
            )
        except Exception as e:
            return Response(
                {"error": "Une erreur s'est produite lors de la déconnexion."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
""" avoir les informations d'un utilisateur """                   
class UsersInfo(APIView):
    def get(self, request, email):
        try:
            # Récupérer l'utilisateur
            user = Personne.objects.get(email=email)
        except Personne.DoesNotExist:
            return Response(
                {"error": "Utilisateur non trouvé."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Sérialiser les données de l'utilisateur
        serializer = PersonneSerializer(user)

        return Response(serializer.data, status=status.HTTP_200_OK)


class UpdateUser(APIView):
    def put(self, request, email):
        try:
            # Retrieve the user to update
            user = Personne.objects.get(email=email)
        except Personne.DoesNotExist:
            return Response(
                {"error": "Utilisateur non trouvé."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Update user fields
        data = request.data
        user.username = data.get('username', user.username)
        print(user.username)
        # Update email if provided and ensure it's unique
        new_email = data.get('newEmail')
        if new_email and new_email != user.email:
            if Personne.objects.filter(email=new_email).exists():
                return Response(
                    {"error": "Cet email est déjà utilisé."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.email = new_email
            print(new_email)
        # Update password if provided
        new_password = data.get('newPassword')
        if new_password:
            user.password = make_password(new_password)
        print(new_password)
            
        # Save changes
        user.save()

        return Response(
            {"message": "Utilisateur mis à jour avec succès."},
            status=status.HTTP_200_OK
        )   
                
class DeleteUser(APIView):
    def delete(self, request, user_id):
        try:
            # Récupérer l'utilisateur à supprimer
            user_to_delete = Personne.objects.get(id=user_id)
        except Personne.DoesNotExist:
            return Response(
                {"error": "Utilisateur non trouvé."},
                status=status.HTTP_404_NOT_FOUND
            )

        # Supprimer l'utilisateur
        user_to_delete.delete()

        return Response(
            {"message": f"Utilisateur avec l'ID {user_id} a été supprimé avec succès."},
            status=status.HTTP_200_OK
        )
        
classifier, nlp_fr, nlp_en = setup_swot_analyzer()
class Swot(APIView):
    def post(self, request, article_id, *args, **kwargs):
        """
        Effectue une analyse SWOT sur le texte de l'article spécifié par son ID.
        """
        try:
            # Récupérer l'article à partir de son ID
            article = Article.objects.get(id=article_id)
            text = article.description  # Supposons que le texte de l'article est dans le champ `description`
            
            # Effectuer l'analyse SWOT en passant classifier et nlp
            swot_results = perform_swot_analysis(text, classifier, nlp_fr, nlp_en)
            return Response(swot_results, status=status.HTTP_200_OK)
        except Article.DoesNotExist:
            return Response(
                {"error": "Article non trouvé."},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": f"Une erreur s'est produite lors de l'analyse SWOT : {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
