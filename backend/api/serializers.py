# articles/serializers.py
from rest_framework import serializers
from .models import Article
from .models import Personne

class ArticleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Article
        fields = '__all__'
        
class PersonneSerializer(serializers.ModelSerializer):
    class Meta:
        model = Personne
        fields = ['id', 'username', 'email', 'date_joined', 'password']  # Inclure 'password'
        extra_kwargs = {
            'password': {
                'write_only': False,  # Permet d'afficher le mot de passe dans les réponses
                'read_only': True,    # Empêche la modification du mot de passe via le sérialiseur
            }
        }

    def create(self, validated_data):
        # Hache le mot de passe avant de créer l'utilisateur
        user = Personne.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        return user

    def update(self, instance, validated_data):
        # Met à jour l'utilisateur et hache le mot de passe si nécessaire
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        
        # Si un nouveau mot de passe est fourni, hachez-le
        if 'password' in validated_data:
            instance.set_password(validated_data['password'])
        
        instance.save()
        return instance      
