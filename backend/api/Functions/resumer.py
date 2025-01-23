import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize, sent_tokenize
from collections import defaultdict
import heapq
import re

# Ensure NLTK resources are downloaded
def ensure_nltk_resources():
    try:
        nltk.data.find('tokenizers/punkt')
        nltk.data.find('corpora/stopwords')
    except LookupError:
        nltk.download('punkt')
        nltk.download('stopwords')


ensure_nltk_resources()


def clean_text(text):
    """
    Cleans the text by removing special characters and unnecessary spaces.
    """
    text = re.sub(r'\s+', ' ', text)  # Remove multiple spaces
    text = re.sub(r'[^\w\s]', '', text)  # Remove special characters
    return text.strip()


def summarize_text(content, num_sentences=3, language='french'):
    """
    Summarizes a given text by extracting the most significant sentences.

    :param content: The text to summarize.
    :param num_sentences: The number of sentences to include in the summary.
    :param language: The language of the text (default: 'french').
    :return: The summarized text.
    """
    if language not in stopwords.fileids():
        raise ValueError(f"Language '{language}' is not supported. Supported languages: {', '.join(stopwords.fileids())}")

    if not content or len(content.split()) < num_sentences:
        raise ValueError("Text is too short to summarize.")

    content = clean_text(content)
    sentences = sent_tokenize(content, language=language)
    words = word_tokenize(content.lower(), language=language)
    stop_words = set(stopwords.words(language))

    word_freq = defaultdict(int)
    for word in words:
        if word not in stop_words and word.isalnum():
            word_freq[word] += 1

    sentence_scores = defaultdict(int)
    for sentence in sentences:
        for word in word_tokenize(sentence.lower(), language=language):
            if word in word_freq:
                sentence_scores[sentence] += word_freq[word]

    summarized_sentences = heapq.nlargest(num_sentences, sentence_scores, key=sentence_scores.get)
    return ' '.join(summarized_sentences).capitalize()


def summarize_article(article, num_sentences=3, language='english'):
    """
    Summarizes a single article.

    :param article: A dictionary containing 'title' and 'content'.
    :param num_sentences: Number of sentences to include in the summary.
    :param language: Language of the article.
    :return: A dictionary with the title and summarized content.
    """
    content = article.get("content", "")
    title = article.get("title", "Untitled")

    if not content:
        raise ValueError("No content available to summarize.")

    summary = summarize_text(content, num_sentences=num_sentences, language=language)
    return {"title": title, "summary": summary}
