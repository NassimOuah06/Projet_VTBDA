# Importation des bibliothèques nécessaires
import pandas as pd
import numpy as np
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
df = pd.read_csv('data_scrapped.csv')
print("Données importées :")
print(df.head())

# 2. Nettoyage des Données
def clean_data(df):
    df.fillna(df.mean(), inplace=True)
    df.drop_duplicates(inplace=True)
    df['date'] = pd.to_datetime(df['date'], errors='coerce')
    df.dropna(subset=['date'], inplace=True)
    return df

df_cleaned = clean_data(df)
print("Données nettoyées :")
print(df_cleaned.head())

# 3. Exploration des Données
def explore_data(df):
    print(df.describe())
    sns.pairplot(df)
    plt.show()
    sns.heatmap(df.corr(), annot=True, cmap='coolwarm')
    plt.show()

explore_data(df_cleaned)

# 4. Transformation des Données
def transform_data(df):
    scaler = StandardScaler()
    df_scaled = pd.DataFrame(scaler.fit_transform(df.select_dtypes(include=[np.number])), columns=df.select_dtypes(include=[np.number]).columns)
    return df_scaled

df_transformed = transform_data(df_cleaned)

# 5. Modélisation des Données
def model_data(X, y):
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = RandomForestClassifier()
    model.fit(X_train, y_train)
    y_pred = model.predict(X_test)
    print(classification_report(y_test, y_pred))

# Suppose que 'target' est la colonne cible
X = df_transformed.drop('target', axis=1) if 'target' in df_transformed.columns else df_transformed
y = df_transformed['target'] if 'target' in df_transformed.columns else np.array([])  # Remplacer si une colonne cible est présente
if not y.empty:
    model_data(X, y)

# 6. Visualisation des Données
def visualize_data(df):
    sns.histplot(df['variable'], kde=True)  # Remplacer 'variable' par une colonne spécifique
    plt.show()
    df.boxplot(column=[col for col in df.columns if df[col].dtype in ['int64', 'float64']])
    plt.show()

visualize_data(df_cleaned)

# 7. Analyse de Texte (si applicable)
def text_analysis(df, text_column):
    stop_words = set(stopwords.words('english'))
    df[text_column] = df[text_column].astype(str)
    df['cleaned_text'] = df[text_column].apply(lambda x: ' '.join([word for word in word_tokenize(x) if word.lower() not in stop_words and word.isalpha()]))
    all_words = ' '.join([text for text in df['cleaned_text']])
    wordcloud = WordCloud(width=800, height=400, background_color='white').generate(all_words)
    plt.figure(figsize=(10, 7))
    plt.imshow(wordcloud, interpolation='bilinear')
    plt.axis('off')
    plt.show()

# Suppose que 'text_column' est la colonne contenant le texte scrappé
if 'text_column' in df_cleaned.columns:
    text_analysis(df_cleaned, 'text_column')

# 8. Interprétation et Reporting
def report_results():
    print("Data analysis complete. Results have been interpreted and reported.")

report_results()