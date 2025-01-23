# Importation des bibliothèques nécessaires
import pandas as pd
import numpy as np
import json
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report
from wordcloud import WordCloud
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize

# Téléchargement des stopwords pour l'analyse de texte
nltk.download('stopwords')
nltk.download('punkt')

# 1. Importation et Préparation des Données
def load_data(file_path):
    try:
        df = pd.read_json(file_path)  # Charger les données depuis un fichier JSONL
        print("Données importées :")
        print(df.head())
        return df
    except Exception as e:
        print(f"Erreur lors du chargement des données : {e}")
        return None

# 2. Nettoyage des Données
def clean_data(df):
    # Remplir les valeurs manquantes uniquement pour les colonnes numériques
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].mean())

    # Pour les colonnes non numériques, remplir les valeurs manquantes avec 'missing'
    non_numeric_cols = df.select_dtypes(exclude=[np.number]).columns
    df[non_numeric_cols] = df[non_numeric_cols].fillna('missing')

    df.drop_duplicates(inplace=True)
    if 'date' in df.columns:
        df['date'] = pd.to_datetime(df['date'], errors='coerce')
        df.dropna(subset=['date'], inplace=True)
    return df

# 3. Enregistrement des Données Nettoyées
def save_data_to_json(df, output_path):
    try:
        df.to_json(output_path, orient='records', force_ascii=False)
        print(f"Données sauvegardées dans le fichier : {output_path}")
    except Exception as e:
        print(f"Erreur lors de l'enregistrement des données : {e}")

# 4. Analyse de Texte
def text_analysis(df, text_column):
    stop_words = set(stopwords.words('english'))
    df[text_column] = df[text_column].astype(str)
    df['cleaned_text'] = df[text_column].apply(
        lambda x: ' '.join([word for word in word_tokenize(x.lower()) if word not in stop_words and word.isalpha()])
    )
    return df

# Chemin des fichiers
data_path = './data.json'  # Chemin vers les données incomplètes
output_path = './data_cleaned.json'   # Chemin vers les données nettoyées

# Chargement et traitement des données
df = load_data(data_path)
if df is not None:
    df_cleaned = clean_data(df)

    # Analyse de texte si une colonne spécifique est présente
    if 'description' in df_cleaned.columns:
        df_cleaned = text_analysis(df_cleaned, 'description')

    # Sauvegarde des données nettoyées dans un fichier JSON
    save_data_to_json(df_cleaned, output_path)
