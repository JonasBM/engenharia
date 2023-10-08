from django.contrib import admin

from .models import Signatory


@admin.register(Signatory)
class SignatoryAdmin(admin.ModelAdmin):
    model = Signatory
    list_display = ['id', 'name', 'title', 'document']
    search_fields = ['id', 'name', 'title', 'document']


