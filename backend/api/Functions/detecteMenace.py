import re
import spacy
from collections import defaultdict

# Charger le modèle de langue spaCy
nlp = spacy.load("fr_core_news_sm")

# Définir les constantes
MOTS_CLES_MENACES = {
    "ransomware", "malware", "phishing", "exploit", "zero-day", "ddos", "brute force", "backdoor", 
    "trojan", "spyware", "keylogger", "botnet", "rootkit", "social engineering", "vulnerability", 
    "data breach", "cyber attack", "hacking", "dark web", "leak", "cryptojacking", "bitcoin", 
    "Monero", "AlphaBay", "Agora", "Silk Road", "illegal drugs", "weapons", "stolen data", 
    "identity theft", "blackmail", "fraud", "credit card scam", "money laundering", "cryptocurrency", 
    "hidden services", "P2P network", "TOR network", "illegal transactions", "darknet vendor"
}


PATTERNS_SUSPECTS = [
    r"\b(?:0-day|zero ?day|zero-day vulnerability)\b",
    r"\b(?:exploit|vuln(?:erability)?|exploit kits)\b",
    r"\b(?:ransom|lockbit|wannacry|revil|conti|maze|blackmatter)\b",  # Inclut des ransomwares connus
    r"\b(?:brute force|dictionary attack|credential stuffing)\b",
    r"\b(?:dark ?web|deep ?web|hidden services)\b",
    r"\b(?:illegal drugs|cocaine|fentanyl|mdma|LSD|narcotics)\b",
    r"\b(?:weapons|firearms|ammunition|explosives)\b",
    r"\b(?:stolen credit cards|CVV dump|fake IDs|SSN theft)\b",
    r"\b(?:money laundering|crypto tumblers|mixing services)\b"
]

TECHNOLOGIES_ET_OUTILS = {
    "Apache", "Log4j", "SQL injection", "Metasploit", "Wireshark", "Nmap", "Kali Linux", 
    "Burp Suite", "Tor", "Python", "C", "Java", "PowerShell", "Linux", "Windows", 
    "Android", "iOS", "Docker", "Bitcoin", "Monero", "Blockchain", "Ethereum", "Exploit kits", 
    "Maltego", "BloodHound", "Empire", "Cobalt Strike", "Hydra", "John the Ripper", 
    "Hashcat", "OpenSSH", "VPN services", "Anonymous proxies", "Shodan", "Recon-ng"
}


METHODES_ATTAQUE = [
    r"\b(?:phishing|spear phishing|whaling|vishing|smishing)\b",
    r"\b(?:social engineering|business email compromise|BEC attacks)\b",
    r"\b(?:SQL injection|XSS|cross site scripting|command injection|RFI|LFI)\b",
    r"\b(?:brute force|dictionary attack|rainbow tables|password cracking)\b",
    r"\b(?:DDoS|Distributed Denial of Service|amplification attacks|botnet-based DDoS)\b",
    r"\b(?:keylogger|backdoor|trojan|remote access trojan|RAT)\b",
    r"\b(?:malvertising|drive-by download|watering hole attacks)\b",
    r"\b(?:fileless malware|memory injection attacks)\b",
    r"\b(?:cryptojacking|illicit cryptocurrency mining)\b",
    r"\b(?:supply chain attacks|software tampering)\b",
    r"\b(?:data exfiltration|sniffing|MITM attacks|session hijacking)\b",
    r"\b(?:zero-day vulnerabilities|0-day exploits)\b",
    r"\b(?:ransomware attacks|double extortion ransomware)\b"
]

def detecter_mots_cles(texte):
    mots_cles_trouves = set()
    for mot in MOTS_CLES_MENACES:
        if re.search(rf"\b{mot}\b", texte, re.IGNORECASE):
            mots_cles_trouves.add(mot)
    return mots_cles_trouves

def detecter_patterns_suspects(texte):
    patterns_trouves = []
    for pattern in PATTERNS_SUSPECTS:
        if re.search(pattern, texte, re.IGNORECASE):
            patterns_trouves.append(pattern)
    return patterns_trouves

def detecter_entites_nommees(texte):
    doc = nlp(texte)
    entites_trouvees = defaultdict(list)
    for ent in doc.ents:
        if ent.label_ in ["ORG", "PRODUCT", "GPE"]:
            entites_trouvees[ent.label_].append(ent.text)
    return entites_trouvees

def detecter_technologies_et_outils(texte):
    technologies_trouvees = set()
    for tech in TECHNOLOGIES_ET_OUTILS:
        if re.search(rf"\b{tech}\b", texte, re.IGNORECASE):
            technologies_trouvees.add(tech)
    return technologies_trouvees

def detecter_methodes_attaque(texte):
    methodes_trouvees = []
    for methode in METHODES_ATTAQUE:
        if re.search(methode, texte, re.IGNORECASE):
            methodes_trouvees.append(methode)
    return methodes_trouvees

def analyser_texte(texte):
    return {
        "mots_cles": detecter_mots_cles(texte),
        "patterns_suspects": detecter_patterns_suspects(texte),
        "entites_nommees": detecter_entites_nommees(texte),
        "technologies_et_outils": detecter_technologies_et_outils(texte),
        "methodes_attaque": detecter_methodes_attaque(texte),
    }
x="Le ransomware LockBit est un exemple de menace informatique qui peut causer des dommages importants. Il exploite les vulnérabilités des systèmes pour chiffrer les données et demander une rançon en échange de la clé de déchiffrement. Les attaques de ransomware sont souvent réalisées à l'aide de techniques sophistiquées comme le phishing ou l'ingénierie sociale. Les organisations doivent se protéger contre ces menaces en mettant en place des mesures de sécurité robustes et en sensibilisant leurs employés aux risques potentiels. En cas d'infection par un ransomware, il est recommandé de ne pas payer la rançon et de contacter les autorités compétentes pour obtenir de l'aide."
print(analyser_texte(x))