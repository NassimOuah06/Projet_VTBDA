from transformers import pipeline

def analyze_long_text_with_bert(text, summarizer, max_chunk_length=1500, base_max_length=400, base_min_length=100):
    """
    Génère un résumé d'un texte long en le divisant en morceaux.

    Args:
        text (str): Le texte long à résumer.
        summarizer (transformers.pipeline): Un pipeline de résumé préconfiguré.
        max_chunk_length (int): La longueur maximale de chaque morceau de texte (en tokens).
        base_max_length (int): Longueur maximale de base du résumé.
        base_min_length (int): Longueur minimale de base du résumé.

    Returns:
        dict: Un dictionnaire contenant le résumé généré.
    """
    # Diviser le texte en morceaux
    chunks = [text[i:i + max_chunk_length] for i in range(0, len(text), max_chunk_length)]

    # Résumer chaque morceau
    summaries = []
    for chunk in chunks:
        # Calcul dynamique des longueurs basées sur la longueur du chunk
        input_length = len(chunk.split())
        max_length = min(base_max_length, input_length // 2)  # max_length ne doit pas dépasser la moitié de la longueur d'entrée
        min_length = min(base_min_length, input_length // 4)  # min_length proportionnel à la longueur d'entrée

        try:
            summary = summarizer(chunk, max_length=max_length, min_length=min_length, do_sample=False)
            summaries.append(summary[0]['summary_text'])
        except Exception as e:
            print(f"Erreur lors du résumé d'un morceau : {e}")

    # Combiner les résumés partiels en un seul texte
    combined_summary = " ".join(summaries)

    # Calcul dynamique pour le résumé final
    combined_input_length = len(combined_summary.split())
    final_max_length = min(base_max_length, combined_input_length // 2)
    final_min_length = min(base_min_length, combined_input_length // 4)

    try:
        final_summary = summarizer(combined_summary, max_length=final_max_length, min_length=final_min_length, do_sample=False)
    except Exception as e:
        print(f"Erreur lors du résumé final : {e}")
        final_summary = [{"summary_text": combined_summary}]  # En cas d'erreur, retourner le texte combiné

    return {
        'resume': final_summary[0]['summary_text']
    }

def summarize_long_text(content, num_sentences=10, model_name="facebook/bart-large-cnn"):
    """
    Génère un résumé pour un texte long.

    :param content: Le texte à résumer.
    :param num_sentences: Nombre de phrases souhaitées dans le résumé.
    :param model_name: Nom du modèle à utiliser pour le résumé.
    :return: Résumé généré.
    """
    # Configuration du pipeline de résumé
    summarizer = pipeline("summarization", model=model_name)

    # Ajuster les paramètres de base pour des résumés longs
    base_max_length = num_sentences * 40
    base_min_length = num_sentences * 20

    # Appel de la fonction
    result = analyze_long_text_with_bert(content, summarizer, base_max_length=base_max_length, base_min_length=base_min_length)

    return result['resume']


