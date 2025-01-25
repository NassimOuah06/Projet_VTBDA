import smtplib
import feedparser # type: ignore
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# Configuration SMTP (exemple pour Gmail)
SMTP_SERVER = "smtp.gmail.com"  # Serveur SMTP de Gmail
SMTP_PORT = 587  # Port SMTP pour TLS
SMTP_USER = "scraperdark@gmail.com"  # Votre adresse Gmail
SMTP_PASSWORD = "gvxz ezbu jqei mgdx"  # Mot de passe d'application Gmail

# Expéditeur
EMAIL_FROM = "scraperdark@gmail.com"  # Expéditeur (votre adresse Gmail)

# Liste des flux RSS à surveiller
RSS_FEEDS = [
    "https://feeds.feedburner.com/TheHackersNews",  # The Hacker News
    "https://krebsonsecurity.com/feed/",  # Krebs on Security
    "https://www.darkreading.com/rss.xml",  # Dark Reading
    "https://nvd.nist.gov/feeds/xml/cve/misc/nvd-rss.xml",  # NVD (National Vulnerability Database)
    "https://feeds.feedburner.com/securityweek",  # SecurityWeek
    "https://threatpost.com/feed/",  # Threatpost
    "https://www.csoonline.com/index.rss",  # CSO Online
    "https://www.bleepingcomputer.com/feed/",  # BleepingComputer
    "https://techcrunch.com/feed/",  # TechCrunch
    "https://www.wired.com/feed/rss",  # Wired
    "https://feeds.arstechnica.com/arstechnica/index",  # Ars Technica
    "https://www.zdnet.com/news/rss.xml",  # ZDNet
    "https://feeds.megaphone.fm/darknetdiaries",  # Darknet Diaries
    "https://darkwebnews.com/feed/",  # Dark Web News
    "https://www.cybersecurity-insiders.com/feed/",  # Cybersecurity Insiders
]

# Liste des mots-clés à surveiller
KEYWORDS = [
    "darknet",
    "darkweb",
    "blackmarkets",
    "vulnerability",
    "vulnerabilities",
    "hacking",
    "exploit",
    "malware",
    "cyberattack",
]

# Fonction pour envoyer un email
def send_email(subject, body, email_to):
    try:
        # Création du message MIME
        msg = MIMEMultipart()
        msg['From'] = EMAIL_FROM
        msg['To'] = email_to
        msg['Subject'] = subject

        # Ajouter le corps du message avec encodage UTF-8
        msg.attach(MIMEText(body, 'plain', 'utf-8'))

        # Connexion au serveur SMTP
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()  # Activation du chiffrement TLS
        server.login(SMTP_USER, SMTP_PASSWORD)  # Authentification

        # Envoi de l'email
        server.sendmail(EMAIL_FROM, email_to, msg.as_string())
        print(f"Email envoyé avec succès à {email_to} !")
    except Exception as e:
        print(f"Erreur lors de l'envoi de l'email : {e}")
    finally:
        # Fermeture de la connexion SMTP
        server.quit()

# Fonction pour surveiller les flux RSS
def monitor_rss_feeds(email_to):
    print("Surveillance des flux RSS en cours...")

    # Parcourir chaque flux RSS
    for rss_feed in RSS_FEEDS:
        print(f"Vérification du flux : {rss_feed}")

        # Récupération du flux RSS
        feed = feedparser.parse(rss_feed)

        # Vérification des nouvelles entrées
        for entry in feed.entries:
            # Vérifie si l'un des mots-clés est dans le titre ou le résumé
            if any(keyword in entry.title.lower() or keyword in entry.summary.lower() for keyword in KEYWORDS):
                # Préparation de l'email
                subject = f"Alerte : {entry.title}"
                body = f"""
                Nouvelle entrée détectée dans le flux {rss_feed} :
                Titre : {entry.title}
                Lien : {entry.link}
                """
                # Envoi de l'email
                send_email(subject, body, email_to)
                break  # Envoyer un seul email par flux pour la première correspondance

# Fonction principale pour exporter
def start_monitoring(email_to):
    """
    Fonction principale pour démarrer la surveillance des flux RSS.
    :param email_to: L'email du destinataire.
    """
    monitor_rss_feeds(email_to)