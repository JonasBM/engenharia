from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        logger.info('checking for superusers')
        from django.contrib.auth import get_user_model
        User = get_user_model()
        if User.objects.filter(is_superuser=True).count() == 0:
            logger.info('No superuser found, creating...')
            username = 'admin'
            password = 'engenharia'
            User.objects.create_superuser(username, f'{username}@admin.com', password)
            logger.info(f'Superuser created! (username: "{username}", password: "{password}")')
