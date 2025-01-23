import http.client
import json
import requests
from bs4 import BeautifulSoup

def site_extract(sujet, api_key, id_search):
    """
    Rechercher des résultats avec l'API Google Search.
    """
    try:
        conn = http.client.HTTPSConnection("www.googleapis.com")
        query = f"/customsearch/v1?q={'+'.join(sujet.split(' '))}&key={api_key}&cx={id_search}"
        conn.request("GET", query)
        res = conn.getresponse()
        response_data = res.read()
        data = json.loads(response_data)
        return data
    except Exception as e:
        print(f"Erreur lors de l'extraction de '{sujet}': {e}")
        return None

def scrape(liste_url):
    """Extraire le contenu des pages Web fournies."""
    results = []
    for url in liste_url:
        try:
            response = requests.get(url, timeout=10)
            response.raise_for_status()
            soup = BeautifulSoup(response.text, 'html.parser')

            # Extraire titre et contenu principal
            title = soup.title.string if soup.title else "Titre indisponible"
            body_text = soup.get_text(separator="\n", strip=True)

            results.append({
                "url": url,
                "title": title,
                "content": body_text
            })
        except Exception as e:
            print(f"Erreur lors du scraping de {url}: {e}")

    return results

def scrape_darknet_data(api_key, themes, id_search, output_file=None):
    """
    Fonction principale pour extraire et scraper des données sur le darknet.
    
    :param api_key: Clé API pour Google Custom Search.
    :param themes: Liste des thèmes à rechercher.
    :param id_search: ID de recherche pour Google Custom Search.
    :param output_file: Fichier de sortie pour enregistrer les résultats (optionnel).
    :return: Liste des données scrapées.
    """
    URLs = []
    for theme in themes:
        data = site_extract(theme, api_key, id_search)
        if data and "items" in data:
            URLs.extend([item["link"] for item in data["items"]])

    # Supprimer les doublons
    unique_urls = list(set(URLs))

    print(f"{len(unique_urls)} URLs récupérées. Début du scraping...")
    scraped_data = scrape(unique_urls)

    if output_file:
        # Enregistrer les résultats dans un fichier JSON
        with open(output_file, "w", encoding="utf-8") as json_file:
            json.dump(scraped_data, json_file, ensure_ascii=False, indent=4)
        print(f"Scraping terminé. Les résultats sont enregistrés dans '{output_file}'.")
    else:
        print("Scraping terminé. Aucun fichier de sortie spécifié.")

    return scraped_data

if __name__ == "__main__":
    API_KEY = "AIzaSyA5AnkgAu7SSU9Zquq475xW28tVQqxqrMQ"
    THEMES = ["darknet forums", "darkweb forums", "darknet new malwares", "darknet marketplace"]
    ID_SEARCH = "459e8c331e3324237"
    
    # Appeler la fonction principale
    results = scrape_darknet_data(API_KEY, THEMES, ID_SEARCH, output_file="resultats_darknet.json")