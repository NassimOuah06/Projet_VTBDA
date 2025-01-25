import pandas as pd # type: ignore
import plotly.express as px # type: ignore
import plotly.graph_objects as go # type: ignore
from collections import defaultdict

# Données d'exemple (simulées)
donnees_menaces = [
    {"type": "Ransomware", "date": "2023-10-01", "count": 5},
    {"type": "Phishing", "date": "2023-10-01", "count": 10},
    {"type": "DDoS", "date": "2023-10-01", "count": 3},
    {"type": "Ransomware", "date": "2023-10-02", "count": 7},
    {"type": "Phishing", "date": "2023-10-02", "count": 12},
    {"type": "DDoS", "date": "2023-10-02", "count": 2},
    {"type": "Ransomware", "date": "2023-10-03", "count": 6},
    {"type": "Phishing", "date": "2023-10-03", "count": 8},
    {"type": "DDoS", "date": "2023-10-03", "count": 4},
]

# Convertir les données en DataFrame
df = pd.DataFrame(donnees_menaces)

# 1. Graphique en courbes (évolution des menaces dans le temps)
def visualiser_evolution_menaces(df):
    fig = px.line(df, x="date", y="count", color="type", title="Évolution des menaces dans le temps",
                  labels={"count": "Nombre de menaces", "date": "Date", "type": "Type de menace"})
    fig.show()

# 2. Graphique en barres (répartition des menaces par type)
def visualiser_repartition_menaces(df):
    df_agg = df.groupby("type", as_index=False).sum()  # Agréger les données par type
    fig = px.bar(df_agg, x="type", y="count", title="Répartition des menaces par type",
                 labels={"count": "Nombre de menaces", "type": "Type de menace"})
    fig.show()

# 3. Carte thermique (heatmap) des menaces par date et type
def visualiser_heatmap_menaces(df):
    df_pivot = df.pivot(index="date", columns="type", values="count").fillna(0)
    fig = px.imshow(df_pivot, labels=dict(x="Type de menace", y="Date", color="Nombre de menaces"),
                    title="Carte thermique des menaces")
    fig.show()

# 4. Graphique en camembert (pourcentage des menaces par type)
def visualiser_camembert_menaces(df):
    df_agg = df.groupby("type", as_index=False).sum()  # Agréger les données par type
    fig = px.pie(df_agg, values="count", names="type", title="Répartition en pourcentage des menaces par type")
    fig.show()

# 5. Tableau de bord interactif (combinaison de plusieurs graphiques)
def creer_tableau_de_bord(df):
    # Créer une figure avec plusieurs sous-graphiques
    fig = go.Figure()

    # Ajouter un graphique en courbes pour chaque type de menace
    for menace_type in df["type"].unique():
        df_filtered = df[df["type"] == menace_type]
        fig.add_trace(go.Scatter(x=df_filtered["date"], y=df_filtered["count"], mode="lines+markers", name=menace_type))

    # Mise en forme du tableau de bord
    fig.update_layout(
        title="Tableau de bord des menaces",
        xaxis_title="Date",
        yaxis_title="Nombre de menaces",
        template="plotly_white"
    )
    fig.show()

# Exemple d'utilisation
if __name__ == "__main__":
    print("Visualisation de l'évolution des menaces dans le temps :")
    visualiser_evolution_menaces(df)

    print("\nVisualisation de la répartition des menaces par type :")
    visualiser_repartition_menaces(df)

    print("\nVisualisation de la carte thermique des menaces :")
    visualiser_heatmap_menaces(df)

    print("\nVisualisation de la répartition en pourcentage des menaces par type :")
    visualiser_camembert_menaces(df)

    print("\nCréation d'un tableau de bord interactif :")
    creer_tableau_de_bord(df)