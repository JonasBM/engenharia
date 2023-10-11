from django.db import models


class Signatory(models.Model):

    name = models.CharField(max_length=255, unique=True, verbose_name='nome')
    title = models.CharField(max_length=255, verbose_name='título')
    document = models.CharField(max_length=255, verbose_name='documento')

    class Meta:
        verbose_name = 'signatário'
        verbose_name_plural = 'signatários'
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
        ]

    def __str__(self):
        return (f'{self.id} - {self.name}')

