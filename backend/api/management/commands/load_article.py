import json
from django.core.management.base import BaseCommand
from api.models import Article  # Remplace par ton modèle

class Command(BaseCommand):
    help = 'Charge les articles depuis un fichier JSON'

    def handle(self, *args, **kwargs):
        with open('api/data.json', 'r', encoding='utf-8') as file:  # Remplace par le chemin de ton fichier
            data = json.load(file)

        for item in data:
            Article.objects.get_or_create(
                title=item['title'],
                defaults={
                    "description": item['description'],
                    "link": item['link'],
                    "category": item['category'],
                    "date": item['date'],
                }
            )

        self.stdout.write(self.style.SUCCESS('Les articles ont été chargés avec succès.'))
