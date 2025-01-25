import requests
from bs4 import BeautifulSoup
import time
import concurrent.futures
import logging
import json
from concurrent.futures import ThreadPoolExecutor
import re
from transformers import pipeline
from langdetect import detect



# Configuration du logging pour plus de clarté dans l'exécution
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Une liste des dictionnaires contenant le titre et url
results_ahmia = []

# Liste des requêtes à rechercher
queries = ["malware", "cyber attaque", "black market", "virus"]

# Parametre pour limiter la recherche au n derniers jours
days = 10

# Liste finale contenant les résultats (titre, url, et contenu de la page)
fin = []




def analyze_long_text_with_bert(text, summarizer, max_chunk_length=1500, base_max_length=400, base_min_length=100):
    """
    Génère un résumé d'un texte long en le divisant en morceaux si nécessaire.
    """
    if max_chunk_length:
        chunks = [text[i:i + max_chunk_length] for i in range(0, len(text), max_chunk_length)]
    else:
        chunks = [text]

    summaries = []
    for chunk in chunks:
        input_length = len(chunk.split())
        max_length = min(base_max_length, input_length // 2) if base_max_length else input_length // 2
        min_length = min(base_min_length, input_length // 4) if base_min_length else input_length // 4
        
        try:
            summary = summarizer(chunk, max_length=max_length, min_length=min_length, do_sample=False)
            summaries.append(summary[0]['summary_text'])
        except Exception as e:
            print(f"Erreur lors du résumé d'un morceau : {e}")
    
    combined_summary = " ".join(summaries)

    combined_input_length = len(combined_summary.split())
    final_max_length = min(base_max_length, combined_input_length // 2) if base_max_length else combined_input_length // 2
    final_min_length = min(base_min_length, combined_input_length // 4) if base_min_length else combined_input_length // 4

    try:
        final_summary = summarizer(combined_summary, max_length=final_max_length, min_length=final_min_length, do_sample=False)
    except Exception as e:
        print(f"Erreur lors du résumé final : {e}")
        final_summary = [{"summary_text": combined_summary}]

    return {
        'resume': final_summary[0]['summary_text']
    }

def summarize_contenu_field(fin_sans_doublons, num_sentences=5, model_name="facebook/bart-large-cnn"):
    """
    Résume le champ 'contenu' dans une liste de dictionnaires en parallèle à l'aide de threads.

    :param fin_sans_doublons: Liste de dictionnaires contenant un champ 'contenu'.
    :param num_sentences: Nombre de phrases souhaitées dans chaque résumé.
    :param model_name: Modèle de résumé à utiliser.
    :return: La liste mise à jour avec les champs 'resume' modifiés.
    """
    summarizer = pipeline("summarization", model=model_name)

    def process_entry(entry):
        """
        Traite un dictionnaire et génère un résumé pour le champ 'contenu'.
        """
        try:
            content = entry.get('contenu', '')  # Récupérer le texte à résumer
            if content:
                summary = analyze_long_text_with_bert(content, summarizer, max_chunk_length=None,
                                                      base_max_length=num_sentences * 40,
                                                      base_min_length=num_sentences * 20)
                entry['resume'] = summary['resume']  # Mettre à jour le champ 'resume'
            else:
                entry['resume'] = "Contenu vide"
        except Exception as e:
            entry['resume'] = f"Erreur : {str(e)}"
        return entry

    # Utilisation de threads pour traiter les résumés
    with ThreadPoolExecutor(max_workers=len(fin_sans_doublons)) as executor:
        processed_entries = list(executor.map(process_entry, fin_sans_doublons))

    return processed_entries



# Fonction pour vérifier si le contenu est compatible avec les sujets donnés
def est_compatible(contenu, sujets_autorises):
    # Vérifie si le contenu contient au moins un des sujets autorisés
    for sujet in sujets_autorises:
        if sujet.lower() in contenu.lower():
            return True
    return False

# Fonction pour détecter la langue du contenu
def detecter_langue(contenu):
    try:
        langue = detect(contenu)
        return langue
    except:
        return None

def remplacer_sequences(chaine):
    """
    Remplace les séquences répétées de \n, \t et \r par un seul caractère correspondant.

    :param chaine: La chaîne de caractères à nettoyer.
    :return: La chaîne nettoyée.
    """
    # Remplacer les séquences de \n par un seul \n
    chaine = re.sub(r'\n+', '\n', chaine)
    # Remplacer les séquences de \t par un seul \t
    chaine = re.sub(r'\t+', '\t', chaine)
    # Remplacer les séquences de \r par un seul \r
    chaine = re.sub(r'\r+', '\r', chaine)
    
    return chaine

def search_ahmia(query,days):
    base_url = "https://ahmia.fi/search/"
    params = {"q": query, "d": days}
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    }

    try:
        response = requests.get(base_url, params=params, headers=headers)
        logging.info(f"URL de la requête : {response.url}")
        response.raise_for_status()

        soup = BeautifulSoup(response.text, "html.parser")
        for result in soup.find_all("li", class_="result"):
            title_tag = result.find("a")
            if title_tag:
                title = title_tag.text.strip()
                url = title_tag.get("href")
                if url and title:
                    if not url.startswith(("http://", "https://")):
                        url = f"https://ahmia.fi{url}"
                    results_ahmia.append({"url": url, "title": title})
        return results_ahmia

    except requests.exceptions.HTTPError as err:
        logging.error(f"Erreur HTTP : {err}")
        return []
    except requests.exceptions.RequestException as err:
        logging.error(f"Erreur lors de la requête : {err}")
        return []

def fetch_page_content(result):
    proxies = {
        'http': 'socks5h://127.0.0.1:9050',
        'https': 'socks5h://127.0.0.1:9050'
    }
    try:
        logging.info(f"Traitement du contenu en cours pour : {result['url']}")
        response = requests.get(result["url"], proxies=proxies, timeout=3)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'lxml')
        page_text = soup.get_text()

        sequence = remplacer_sequences(page_text)

        return {
                    "title": result["title"],
                    "url": result["url"],
                    "contenu": sequence,
                    "resume": ""
                }
    except requests.exceptions.RequestException as e:
        logging.error(f"Erreur lors de l'extraction pour {result['url']} : {e}")
        return None

def extract_contenu(results):
    extract_list = []
    CMT = 0

    with concurrent.futures.ThreadPoolExecutor(max_workers=100) as executor:
        future_to_url = {executor.submit(fetch_page_content, result): result for result in results}
        for future in concurrent.futures.as_completed(future_to_url):
            try:
                data = future.result()  # Tente d'obtenir le résultat
                if data:  # Ignorer les données nulles
                    extract_list.append(data)
            except Exception as e:
                logging.error(f"Erreur dans le thread pour {future_to_url[future]['url']} : {e}")
            CMT+=1
            print("************Le compteur = "+str(CMT)+"************")
    return extract_list

def compter_doublons(liste_dict, champ):
    """
    Compte le nombre de doublons pour chaque valeur d'un champ spécifique dans une liste de dictionnaires.

    :param liste_dict: La liste de dictionnaires à vérifier.
    :param champ: Le champ à vérifier pour les doublons.
    :return: Un dictionnaire où les clés sont les valeurs du champ et les valeurs sont le nombre d'occurrences.
    """
    compteur = {}  # Dictionnaire pour compter les occurrences de chaque valeur

    for dico in liste_dict:
        valeur = dico.get(champ)  # Récupérer la valeur du champ
        if valeur in compteur:
            compteur[valeur] += 1  # Incrémenter le compteur si la valeur existe déjà
        else:
            compteur[valeur] = 1  # Ajouter la valeur au dictionnaire avec un compteur à 1

    # Filtrer pour ne garder que les valeurs avec plus d'une occurrence
    doublons = {url: count for url, count in compteur.items() if count > 1}

    return doublons

def ecrire_liste_dict_vers_json(liste_dict, fichier_json):
    """
    Écrit une liste de dictionnaires dans un fichier JSON.

    :param liste_dict: La liste de dictionnaires à écrire.
    :param fichier_json: Le chemin du fichier JSON de sortie.
    """
    try:
        with open(fichier_json, 'w', encoding='utf-8') as f:
            json.dump(liste_dict, f, ensure_ascii=False, indent=4)  # Écriture dans le fichier JSON
        print(f"La liste de dictionnaires a été écrite dans le fichier {fichier_json}.")
    except Exception as e:
        print(f"Erreur lors de l'écriture du fichier JSON : {e}")

def traiter_recherche(query, days):
    logging.info(f"Lancement de la recherche pour la requête : {query}")
    return search_ahmia(query, days)


# ThreadPoolExecutor pour gérer les recherches en parallèle
with ThreadPoolExecutor(max_workers=len(queries)) as executor:
    future_to_query = {executor.submit(traiter_recherche, query, days): query for query in queries}
    for future in concurrent.futures.as_completed(future_to_query):
        query = future_to_query[future]
        try:
            results = future.result()
            logging.info(f"Résultats pour la requête '{query}': {len(results)} trouvés.")
            # Extraire le contenu des résultats de recherche
            contenu_extrait = extract_contenu(results)
            fin.extend(contenu_extrait)  # Ajouter les résultats extraits à la liste finale
        except Exception as e:
            logging.error(f"Erreur lors de la recherche pour '{query}': {e}")

# Supprimer les doublons en fonction de l'URL
urls_uniques = {result['url']: result for result in fin}
fin_sans_doublons = list(urls_uniques.values())

logging.info("---------------------------Terminé---------------------------")
logging.info(f"Nombre de pages extraites : {len(fin)}")
logging.info(f"Nombre total de résultats après suppression des doublons : {len(fin_sans_doublons)}")


print("Debut de la partie resume :")
resultats = summarize_contenu_field(fin_sans_doublons, num_sentences=5, model_name="facebook/bart-large-cnn")


# Enregistrer les résultats dans un fichier JSON
ecrire_liste_dict_vers_json(fin_sans_doublons, "result.json")
