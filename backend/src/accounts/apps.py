from django.apps import AppConfig
import logging

logger = logging.getLogger(__name__)


class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        logger.info('checking for superusers')
        from django.contrib.auth import get_user_model
        from django.contrib.auth.models import Group
        User = get_user_model()
        if User.objects.filter(is_superuser=True).count() == 0:
            logger.info('No superuser found, creating...')
            username = 'admin'
            password = 'engenharia'
            User.objects.create_superuser(username, f'{username}@admin.com', password)
            logger.info(f'Superuser created! (username: "{username}", password: "{password}")')

        logger.info('checking for groups')
        group_names = set(('Administrator', 'Staff', 'intern'))
        groups_already_in = set(Group.objects.filter(name__in=group_names).values_list('name', flat=True))
        missing = list(sorted(group_names - groups_already_in))
        if len(missing):
            logger.info('Missing groups, creating...')
            groups_to_create = []
            for name in missing:
                groups_to_create.append(Group(name=name))
            groups = Group.objects.bulk_create(groups_to_create)
            logger.info(f'Missing groups created! (groups: "{groups}")')
