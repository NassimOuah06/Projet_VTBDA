import re
import spacy
from collections import defaultdict

# Charger le modèle de langue spaCy
nlp = spacy.load("fr_core_news_sm")  # Pour le français. Utilisez "en_core_web_sm" pour l'anglais.

# Liste de mots-clés liés aux menaces
MOTS_CLES_MENACES = {
    "ransomware", "malware", "phishing", "exploit", "zero-day", "ddos", "brute force",
    "backdoor", "trojan", "spyware", "keylogger", "botnet", "rootkit", "social engineering",
    "vulnerability", "data breach", "cyber attack", "hacking", "dark web", "leak", "cryptojacking"
}

# Liste de motifs regex pour détecter des patterns suspects
PATTERNS_SUSPECTS = [
    r"\b(?:0-day|zero ?day)\b",  # Détecte "0-day" ou "zero day"
    r"\b(?:exploit|vuln(?:erability)?)\b",  # Détecte "exploit" ou "vulnerability"
    r"\b(?:ransom|lockbit|wannacry)\b",  # Détecte des noms de ransomwares
    r"\b(?:brute force|dictionary attack)\b",  # Détecte des méthodes d'attaque
    r"\b(?:dark ?web|deep ?web)\b",  # Détecte des références au dark web
]

# Liste de mots-clés liés aux technologies et outils utilisés dans les cyberattaques
TECHNOLOGIES_ET_OUTILS = {
    "Apache", "Log4j", "SQL injection", "Metasploit", "Wireshark", "Nmap", "Kali Linux", "Burp Suite", "Tor",
    "Python", "C", "Java", "PowerShell", "Linux", "Windows", "Android", "iOS", "Docker"
}

# Liste de patterns regex pour détecter des méthodes spécifiques d'attaque
METHODES_ATTAQUE = [
    r"\b(?:phishing|spear phishing|social engineering|SQL injection|cross site scripting|XSS)\b",  # Méthodes d'attaque
    r"\b(?:brute force|dictionary attack|password cracking)\b",  # Méthodes de cracking
    r"\b(?:DDoS|Distributed Denial of Service)\b",  # Méthode d'attaque DDoS
    r"\b(?:keylogger|backdoor|trojan)\b"  # Outils malveillants
]

def detecter_mots_cles(texte):
    """
    Détecte les mots-clés liés aux menaces dans un texte.
    """
    mots_cles_trouves = set()
    for mot in MOTS_CLES_MENACES:
        if re.search(rf"\b{mot}\b", texte, re.IGNORECASE):
            mots_cles_trouves.add(mot)
    return mots_cles_trouves

def detecter_patterns_suspects(texte):
    """
    Détecte des patterns suspects dans un texte en utilisant des expressions régulières.
    """
    patterns_trouves = []
    for pattern in PATTERNS_SUSPECTS:
        if re.search(pattern, texte, re.IGNORECASE):
            patterns_trouves.append(pattern)
    return patterns_trouves

def detecter_entites_nommees(texte):
    """
    Détecte les entités nommées (comme les noms de logiciels malveillants ou de groupes de hackers).
    """
    doc = nlp(texte)
    entites_trouvees = defaultdict(list)
    for ent in doc.ents:
        if ent.label_ in ["ORG", "PRODUCT", "GPE"]:  # Organisations, produits, lieux
            entites_trouvees[ent.label_].append(ent.text)
    return entites_trouvees

def detecter_technologies_et_outils(texte):
    """
    Détecte les technologies et outils utilisés dans les cyberattaques.
    """
    technologies_trouvees = set()
    for tech in TECHNOLOGIES_ET_OUTILS:
        if re.search(rf"\b{tech}\b", texte, re.IGNORECASE):
            technologies_trouvees.add(tech)
    return technologies_trouvees

def detecter_methodes_attaque(texte):
    """
    Détecte les méthodes d'attaque dans le texte.
    """
    methodes_trouvees = []
    for methode in METHODES_ATTAQUE:
        if re.search(methode, texte, re.IGNORECASE):
            methodes_trouvees.append(methode)
    return methodes_trouvees

def analyser_texte(texte):
    """
    Analyse un texte pour détecter des menaces potentielles.
    Retourne un rapport détaillé.
    """
    rapport = {
        "mots_cles": detecter_mots_cles(texte),
        "patterns_suspects": detecter_patterns_suspects(texte),
        "entites_nommees": detecter_entites_nommees(texte),
        "technologies_et_outils": detecter_technologies_et_outils(texte),
        "methodes_attaque": detecter_methodes_attaque(texte)
    }
    return rapport

def afficher_rapport(rapport):
    """
    Affiche un rapport de détection de menaces de manière lisible.
    """
    print("=== Rapport de détection de menaces ===")
    
    print("\nMots-clés détectés :")
    for mot in rapport["mots_cles"]:
        print(f" - {mot}")

    print("\nPatterns suspects détectés :")
    if rapport["patterns_suspects"]:
        for pattern in rapport["patterns_suspects"]:
            print(f" - {pattern}")
    else:
        print(" - Aucun pattern suspect détecté.")

    print("\nTechnologies et outils détectés :")
    if rapport["technologies_et_outils"]:
        for tech in rapport["technologies_et_outils"]:
            print(f" - {tech}")
    else:
        print(" - Aucun outil ou technologie spécifique détecté.")
        
    print("\nMéthodes d'attaque détectées :")
    if rapport["methodes_attaque"]:
        for methode in rapport["methodes_attaque"]:
            print(f" - {methode}")
    else:
        print(" - Aucune méthode d'attaque détectée.")

    print("\nEntités nommées détectées :")
    if rapport["entites_nommees"]:
        for label, entites in rapport["entites_nommees"].items():
            print(f" - {label}: {', '.join(entites)}")
    else:
        print(" - Aucune entité nommée détectée.")

# Exemple d'utilisation
if __name__ == "__main__":
    texte = """
    Northern california man arrested for distributing narcotics through darknet marketplace websites  ice skip to main content an official website of the united states government heres how you know heres how you know official websites use gov a gov website belongs to an official government organization in the united states secure gov websites use https a lock  lock locked padlock  or https means youve safely connected to the gov website share sensitive information only on official secure websites en español contact us quick links menu call 1866dhs2ice to report suspicious activity report crime main navigation about us mission who we are leadership history information library career opportunities fact sheets learn facts about us immigration and customs enforcement learn more about ice immigration enforcement identify and arrest criminal apprehension program fugitive operations immigration authority delegation program 287g immigration detainers detain detention facilities health service corps detention management facility inspections family residential standards remove removal recalcitrant countries ero statistics dashboard how ice enforces immigration laws ice identifies and apprehends removable aliens detains these individuals and removes illegal aliens from the united states learn more about ero ice checkin learn more about how to check in with a local ice office student and exchange visitor program sevp is a part of the national security investigations division and acts as a bridge for government organizations that have an interest in information on nonimmigrants whose primary reason for coming to the united states is to be students learn more about sevp combating transnational crime operational priorities protecting national security preventing crimes of exploitation securing the border ensuring public safety upholding fairness in global trade investigating cybercrime combating financial crime investigations outreach programs partnerships  centers recognize  report crime securing the homeland combating crossborder criminal activity is a critical component of the overall safety security and wellbeing of our nation learn more about hsi newsroom news releases and statements feature stories multimedia social media speeches and testimonies ero statistics dashboard ices ero officers uphold united states immigration laws by focusing on individuals who present the greatest risk to national security public safety or border security view the most recent statistics 2023 year in review ices fy2023 annual report view the annual report media inquiries breadcrumb ice newsroom northern california man arrested for distributing narcotics through darknet marketplace websites  share share on facebook share on x share on linkedin email this page print this page march 29 2016 fresno  ca  united states contraband cyber crimes northern california man arrested for distributing narcotics through darknet marketplace websites fresno calif  a northern california man was arrested monday for distributing marijuana and cocaine nationwide through marketplace sites on the darknet following an investigation by us immigration and customs enforcements ice homeland security investigations hsi the internal revenue servicecriminal investigation the us postal inspection service and the fresno police department david ryan burchard 38 of merced is charged in a criminal complaint with distribution of marijuana and cocaine on darknet marketplaces including the silk road burchard made his initial appearance in federal court tuesday before us magistrate judge erica p grosjean in fresno according to the criminal complaint burchard using the moniker caliconnect was a major narcotics vendor on the silk road and other darknet marketplaces such as agora abraxas and alphabay darknet marketplaces operate on computer networks designed to conceal the true internet protocol ip address of the computers accessing them in addition darknet marketplaces only allow payments to be made in the form of digital currency most commonly in bitcoin while not inherently illegal digital currency is used by darknet marketplaces because online transactions in digital currency can be completed without a thirdparty payment processor and are therefore perceived to be more anonymous and less vulnerable to law enforcement scrutiny the department of justice and our federal law enforcement partners will continue to investigate and prosecute major interstate narcotics traffickers said us attorney benjamin b wagner those traffickers who believe they can escape the scrutiny of law enforcement by conducting their business on the dark web and receiving payments in digital currency are mistaken according to the complaint burchard accepted orders for marijuana and cocaine on darknet marketplaces and then mailed the narcotics from post offices in merced and fresno counties to customers throughout the us burchard was paid primarily in bitcoin the federal government estimates burchard whose sales through the silk road exceeded 14 million before that website was closed was one of the largest vendors on that site the complaint alleges that after federal law enforcement shut down the silk road website and arrested its founder in october 2013 burchard transferred his narcotics business to agora and then to alphabay hsi and our partners are at the forefront of combating illicit activities and financial crimes now seen in virtual currency systems said ryan l spradlin special agent in charge of hsi san francisco criminals continue to spread their businesses through online black markets using digital currency like bitcoin however they do not escape the reach of law enforcement we continue to investigate disrupt and dismantle hidden illegal networks that pose a threat in cyberspace the combined efforts of law enforcement agencies in this type of investigation produce a formidable force against narcotics trafficking said michael t batdorf special agent in charge of irscriminal investigation with the increase use of the dark web to facilitate the drug trade and other illicit activities irsci will continue to trace the complex financial transactions that identify where the money comes from and where it goes postal inspectors worked closely with the us attorneys office and our partners in law enforcement on this investigation and will continue to vigorously protect the us mail against all forms of criminal misuse said rafael nunez inspector in charge of the us postal inspection services san francisco division trial attorney anitha ibrahim with the us department of justices computer crimes and intellectual property section aided with the investigation assistant us attorney grant rabenn is prosecuting the case updated 11182024 return to top media inquiries for media inquiries about ice activities operations or policies contact the ice office of public affairs at icemediaicedhsgov  about us immigration enforcement combating transnational crime newsroom ice contact center report suspicious activity 1866dhs2ice icegov an official website of the us department of homeland security ice uswds footer links about ice accessibility foia requests privacy policy dhsgov archive no fear act data site links performance reports inspector general the white house dhs components usagov mobile menu bar menu search en español contact main navigation on mobile devices about us mission who we are leadership history information library career opportunities immigration enforcement identify and arrest criminal apprehension program fugitive operations immigration authority delegation program 287g immigration detainers detain detention facilities health service corps detention management facility inspections family residential standards remove recalcitrant countries removal ero statistics dashboard combating transnational crime operational priorities protecting national security preventing crimes of exploitation securing the border ensuring public safety upholding fairness in global trade investigating cybercrime combating financial crime investigations outreach programs partnerships  centers recognize  report crime newsroom news releases and statements feature stories multimedia social media speeches and testimonies search search home who we are newsroom information library contact ice careers en español
    """

    rapport = analyser_texte(texte)
    afficher_rapport(rapport)
