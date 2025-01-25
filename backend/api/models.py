from django.db import models
from django.utils import timezone
from django.contrib.auth.models import AbstractUser

class Article(models.Model):
    title = models.CharField(max_length=255, db_index=True)  # Add an index for faster querying
    description = models.TextField()
    link = models.URLField()
    mot_cle = models.CharField(max_length=512, null=True, blank=True, default='')  # Optional field
    created_at = models.DateField(default=timezone.now, db_index=True)  # Use timezone.now as default
    image = models.ImageField(upload_to='images/', null=True, blank=True, default='images/default.jpg')  # Optional field
    analyser = models.BooleanField(default=False)
    finaliser = models.BooleanField(default=False)

    def __str__(self):
        return self.title  # Human-readable representation


class Personne(AbstractUser):
    username = models.CharField(max_length=255, unique=True)  # Utilisez 'username' ici
    password = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
   
    # Définis des related_name et related_query_name uniques
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        related_name="personne_groups",
        related_query_name="personne",
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name="personne_user_permissions",
        related_query_name="personne",
    )

    def __str__(self):
        return self.username  # Human-readable representation
