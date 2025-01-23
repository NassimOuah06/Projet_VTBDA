import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from collections import defaultdict
import heapq
import re
import os
import json

# Vérifier si les ressources nécessaires sont déjà téléchargées
def vérifier_ressources_téléchargées():
    try:
        # Tester si les fichiers de stopwords et punkt sont déjà présents
        nltk.data.find('tokenizers/punkt')
        nltk.data.find('tokenizers/punkt_tab')
        nltk.data.find('corpora/stopwords')
    except LookupError:
        # Si les ressources ne sont pas trouvées, les télécharger
        nltk.download('punkt')
        nltk.download('punkt_tab')
        nltk.download('stopwords')

# Appeler la fonction pour vérifier les ressources
vérifier_ressources_téléchargées()

def nettoyer_texte(texte):
    """
    Nettoie le texte en supprimant les caractères spéciaux et les espaces inutiles.
    """
    texte = re.sub(r'\s+', ' ', texte)  # Supprimer les espaces multiples
    texte = re.sub(r'[^\w\s]', '', texte)  # Supprimer les caractères spéciaux
    return texte.strip()

def vérifier_langue_supportée(langue):
    """
    Vérifie si la langue est supportée par NLTK (stopwords et tokenizers).
    """
    langues_supportées = stopwords.fileids()
    if langue not in langues_supportées:
        raise ValueError(f"La langue '{langue}' n'est pas supportée. Langues disponibles : {', '.join(langues_supportées)}")
    
   

def résumer_texte(texte, nombre_de_phrases=3, langue='french'):
    """
    Résume un texte de manière professionnelle en extrayant les phrases les plus significatives.
    
    :param texte: Le texte à résumer.
    :param nombre_de_phrases: Le nombre de phrases à inclure dans le résumé.
    :param langue: La langue du texte (par défaut : 'french').
    :return: Le texte résumé.
    """
    # Vérifier si la langue est supportée
    vérifier_langue_supportée(langue)

    # Vérifier si le texte est vide ou trop court
    if not texte or len(texte.split()) < nombre_de_phrases:
        raise ValueError("Le texte est trop court pour être résumé.")

    # Nettoyer le texte
    texte = nettoyer_texte(texte)

    # Tokenizer le texte en phrases
    phrases = sent_tokenize(texte, language=langue)
    
    # Tokenizer le texte en mots
    mots = word_tokenize(texte.lower(), language=langue)
    
    # Charger les stopwords pour la langue spécifiée
    stop_words = set(stopwords.words(langue))
    
    # Calculer la fréquence des mots
    freq_table = defaultdict(int)
    for mot in mots:
        if mot not in stop_words and mot.isalnum():
            freq_table[mot] += 1
    
    # Calculer le score de chaque phrase en tenant compte de la pertinence contextuelle
    scores_phrases = defaultdict(int)
    for phrase in phrases:
        for mot in word_tokenize(phrase.lower(), language=langue):
            if mot in freq_table:
                scores_phrases[phrase] += freq_table[mot]
    
    # Trier les phrases par score et les filtrer en fonction de leur pertinence
    phrases_résumées = heapq.nlargest(nombre_de_phrases, scores_phrases, key=scores_phrases.get)
    
    # Créer un résumé plus fluide en enchaînant les points clés
    résumé = ' '.join(phrases_résumées)
    
    # Améliorer le résumé pour une rédaction professionnelle
    résumé_professionnel = résumé.capitalize()  # Commence avec une majuscule
    résumé_professionnel = résumé_professionnel.replace("le machine learning", "Le machine learning")  # Personnalisation si nécessaire
    résumé_professionnel = résumé_professionnel.replace("les données", "des données")  # Ajuster pour un langage plus professionnel
    résumé_professionnel = résumé_professionnel.replace("et faire des prédictions ou des décisions", "et effectuer des prédictions ou prendre des décisions")

    return résumé_professionnel


with open("resultats_darknet.json", "r", encoding="utf-8") as fichier_json:
    data = json.load(fichier_json)    
    
        
for i, article in enumerate(data):
    try:
        # Récupérer le contenu
        contenu = article.get("content", "")
        titre = article.get("title", "Sans titre")
        
        if contenu:
            # Résumer le contenu
            résumé = résumer_texte(contenu, nombre_de_phrases=3, langue="english")
            print(f"Résumé de l'article {i + 1} - {titre} :\n{résumé}\n")
        else:
            print(f"Article {i + 1} - {titre} : Aucun contenu disponible.\n")
    except ValueError as e:
        print(f"Erreur avec l'article {i + 1} : {e}")
    

    except ValueError as e:
        print(e)
