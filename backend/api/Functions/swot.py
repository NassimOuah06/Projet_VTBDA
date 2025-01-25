import spacy
from transformers import pipeline
from collections import defaultdict
from langdetect import detect # type: ignore

def setup_swot_analyzer():
    """
    Initialise les modèles nécessaires pour l'analyse SWOT.
    Cette fonction doit être appelée une seule fois au début pour éviter de recharger les modèles à chaque appel.
    """
    # Charger un modèle de classification de texte Hugging Face
    classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
    
    # Charger les modèles spaCy pour le traitement du texte en français et en anglais
    nlp_fr = spacy.load("fr_core_news_sm")
    nlp_en = spacy.load("en_core_web_sm")
    
    return classifier, nlp_fr, nlp_en

def perform_swot_analysis(text, classifier, nlp_fr, nlp_en, max_sentences=20):
    """
    Effectue une analyse SWOT sur un texte donné.
    
    :param text: Le texte à analyser.
    :param classifier: Le modèle de classification Hugging Face.
    :param nlp_fr: Le modèle spaCy pour le traitement du texte en français.
    :param nlp_en: Le modèle spaCy pour le traitement du texte en anglais.
    :param max_sentences: Le nombre maximal de phrases à analyser.
    :return: Un dictionnaire contenant les phrases classées par catégorie SWOT.
    """
    # Définir les catégories SWOT
    swot_labels = ["Force", "Faiblesse", "Opportunité", "Menace"]
    
    # Fonction pour extraire les phrases pertinentes
    def extract_relevant_sentences(text, max_sentences, nlp):
        doc = nlp(text)
        sentences = [sent.text for sent in doc.sents]
        return sentences[:max_sentences]  # Limiter le nombre de phrases pour l'analyse
    
    # Fonction pour classifier une phrase en catégorie SWOT
    def classify_sentence(sentence):
        result = classifier(sentence, candidate_labels=swot_labels)
        return result["labels"][0]  # Retourne la catégorie la plus probable
    
    # Détecter la langue du texte
    lang = detect(text)
    
    # Choisir le modèle spaCy approprié en fonction de la langue détectée
    if lang == "fr":
        nlp = nlp_fr
    else:
        nlp = nlp_en
    
    # Extraire les phrases pertinentes
    sentences = extract_relevant_sentences(text, max_sentences, nlp)
    
    # Classer les phrases et les organiser par catégorie SWOT
    swot_analysis = defaultdict(list)
    for sentence in sentences:
        category = classify_sentence(sentence)
        swot_analysis[category].append(sentence)
    
    return swot_analysis
