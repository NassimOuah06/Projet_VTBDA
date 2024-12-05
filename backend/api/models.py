from django.db import models

class Article(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    link = models.URLField()
    category = models.CharField(max_length=100)
    date = models.DateField()

    def __str__(self):
        return self.title
