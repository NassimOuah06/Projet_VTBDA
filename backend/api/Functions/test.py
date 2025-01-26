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
import subprocess

def start_tor_process():
    try:
        # Lancer le processus Tor
        process = subprocess.Popen(["tor"], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

        print("Serveur Tor lancé avec succès.")
        return process
    except FileNotFoundError:
        print("Tor n'est pas installé ou introuvable.")
    except Exception as e:
        print(f"Erreur lors du démarrage du serveur Tor : {e}")

# Configuration du logging pour plus de clarté dans l'exécution
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Une liste des dictionnaires contenant le titre et url
results_ahmia = []

# Liste des requêtes à rechercher
queries = ["malware", "cyber attaque", "black market", ]

# Paramètre pour limiter la recherche aux n derniers jours
days = 10

# Liste finale contenant les résultats (titre, url, et contenu de la page)
fin = []


def summarize_large_text(text, model_name="facebook/bart-large-cnn", max_chunk_length=1024, summary_ratio=0.8):
    """
    Résume un texte de grande taille en le divisant en morceaux.

    Args:
        text (str): Le texte à résumer.
        model_name (str): Le modèle de résumé à utiliser (par défaut : "facebook/bart-large-cnn").
        max_chunk_length (int): La longueur maximale de chaque morceau de texte (en tokens).
        summary_ratio (float): Le ratio de la taille du résumé par rapport au texte d'origine (par défaut : 0.8 pour 80%).

    Returns:
        str: Le résumé du texte.
    """
    # Initialiser le pipeline de résumé
    summarizer = pipeline("summarization", model=model_name)

    # Diviser le texte en morceaux
    chunks = [text[i:i + max_chunk_length] for i in range(0, len(text), max_chunk_length)]

    # Résumer chaque morceau
    summaries = []
    for chunk in chunks:
        try:
            # Calculer dynamiquement max_length et min_length en fonction de la taille du chunk
            chunk_length = len(chunk.split())  # Nombre de mots dans le chunk
            max_length = int(chunk_length * summary_ratio)
            min_length = int(max_length * 0.5)  # min_length est la moitié de max_length

            # Générer un résumé pour le morceau
            summary = summarizer(chunk, max_length=max_length, min_length=min_length, do_sample=False)
            summaries.append(summary[0]['summary_text'])
        except Exception as e:
            print(f"Erreur lors du résumé d'un morceau : {e}")
            summaries.append(chunk)  # En cas d'erreur, ajouter le morceau non résumé

    # Combiner les résumés partiels en un seul texte
    combined_summary = " ".join(summaries)

    # Calculer dynamiquement max_length et min_length pour le résumé final
    combined_length = len(combined_summary.split())  # Nombre de mots dans le texte combiné
    final_max_length = int(combined_length * summary_ratio)
    final_min_length = int(final_max_length * 0.5)

    # Résumer le texte combiné pour obtenir un résumé final
    try:
        final_summary = summarizer(combined_summary, max_length=final_max_length, min_length=final_min_length, do_sample=False)
        return final_summary[0]['summary_text']
    except Exception as e:
        print(f"Erreur lors du résumé final : {e}")
        return combined_summary  # En cas d'erreur, retourner le texte combiné

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

def search_ahmia(query, days):
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
            "html": str(soup),
            "contenu": sequence,
            "resume": "",
        }
    except requests.exceptions.RequestException as e:
        logging.error(f"Erreur lors de l'extraction pour {result['url']} : {e}")
        return None

def extract_contenu(results):
    extract_list = []
    CMT = 0

    with ThreadPoolExecutor(max_workers=100) as executor:
        future_to_url = {executor.submit(fetch_page_content, result): result for result in results}
        for future in concurrent.futures.as_completed(future_to_url):
            try:
                data = future.result()  # Tente d'obtenir le résultat
                if data:  # Ignorer les données nulles
                    extract_list.append(data)
            except Exception as e:
                logging.error(f"Erreur dans le thread pour {future_to_url[future]['url']} : {e}")
            CMT += 1
            print("************Le compteur = " + str(CMT) + "************")
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


def execute_all():
    # process = start_tor_process()
    # time.sleep(4)
    
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

    # Partie Resume
    print("Début de la partie résumé :")

    # for c in fin_sans_doublons:
    #     try:
    #         summary = summarize_large_text(c["contenu"], summary_ratio=0.8)        
    #         c["resume"] = summary
    #     except Exception as e:
    #         logging.error(f"Erreur lors du résumé pour {c['url']} : {e}")
    #         c["resume"] = "Erreur lors du résumé"


    # Enregistrer les résultats dans un fichier JSON
    ecrire_liste_dict_vers_json(fin_sans_doublons, "result.json")

    return fin_sans_doublons

pr = execute_all()
print(pr)