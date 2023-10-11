
from datetime import timedelta
import os
from pathlib import Path

import environ

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
env = environ.Env()
environ.Env.read_env(os.path.join(BASE_DIR, '.env'))

SECRET_KEY = env('SECRET_KEY', default='secretkeyissecrete')
DEBUG = env.bool('DEBUG', default=False)
ENVIRONMENT = env('ENVIRONMENT', default='production')


SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')

# NOTE: INSECURE
ALLOWED_HOSTS = env.list('ALLOWED_HOSTS', default=['*'])

# NOTE: INSECURE
CORS_ALLOW_ALL_ORIGINS = True
# CORS_ORIGIN_ALLOW_ALL = env.bool('CORS_ORIGIN_ALLOW_ALL', default=True)
# CORS_ALLOWED_ORIGINS = env.list('CORS_ALLOWED_ORIGINS', default=['*'])
# CORS_ALLOWED_ORIGINS = []
# CORS_ALLOWED_ORIGINS_ENV = os.environ.get('CORS_ALLOWED_ORIGINS', '*')
# if CORS_ALLOWED_ORIGINS_ENV:
#     CORS_ALLOWED_ORIGINS.extend(CORS_ALLOWED_ORIGINS_ENV.split(','))

CORS_EXPOSE_HEADERS = (
    'content-length',
    'content-count',
    'Content-Disposition'
)

LOCAL_INSTALLED_APPS = [
    'core',
    'accounts',
    'shp',
    'igc',
]
ADITIONAL_APPS = env.list('ADITIONAL_APPS', default=[])
INSTALLED_APPS = LOCAL_INSTALLED_APPS + ADITIONAL_APPS + [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.postgres',
    'corsheaders',
    'rest_framework',
    'knox',
]

ADITIONAL_MIDDLEWARE_START = env.list('ADITIONAL_MIDDLEWARE_START', default=[])
ADITIONAL_MIDDLEWARE_END = env.list('ADITIONAL_MIDDLEWARE_END', default=[])
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'knox.auth.TokenAuthentication',
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '20/min',
        'user': '600/min',
    },
    'EXCEPTION_HANDLER': 'core.error_handling.custom_exception_handler',
    'TEST_REQUEST_DEFAULT_FORMAT': 'json',
}

REST_KNOX = {
    'TOKEN_TTL': timedelta(hours=48),
    'AUTO_REFRESH': True,
    'USER_SERIALIZER': 'accounts.serializers.UserProfileSerializer',
}

SWAGGER_SETTINGS = {
    'SECURITY_DEFINITIONS': {
        'Basic': {
            'type': 'basic'
        },
        'DRF Token': {
            'type': 'apiKey',
            'name': 'Authorization',
            'in': 'header'
        }
    }
}

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'templates'), ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'core.wsgi.application'


# Database
# https://docs.djangoproject.com/en/3.2/ref/settings/#databases

DATABASES = {
    'default': env.db_url(),
}


AUTH_USER_MODEL = 'accounts.CustomUser'

# Password validation
# https://docs.djangoproject.com/en/3.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 6,
        },
    },
]


# Internationalization
# https://docs.djangoproject.com/en/3.2/topics/i18n/

LANGUAGE_CODE = 'pt-BR'

LANGUAGES = [
    ('pt-BR', 'Português'),
]

TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.2/howto/static-files/


STATIC_URL = 'static/'
MEDIA_URL = 'media/'

# STATIC_ROOT = 'backend/src/static/'
# MEDIA_ROOT = 'backend/src/media/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

STATICFILES_DIRS = [
    os.path.join(BASE_DIR, 'static'),
]

# STATIC_URL = '/static/'

# Default primary key field type
# https://docs.djangoproject.com/en/3.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'


# ########## LOGGING ##########
LOGGING_LEVEL = env('LOGGING_LEVEL', default='INFO')
LOGGING_VERBOSE = env('LOGGING_VERBOSE', default='verbose')
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '[{asctime}] {levelname} | {name}.{funcName}():{lineno:d}: {message}',
            'datefmt': '%d/%b/%Y %H:%M:%S',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': LOGGING_VERBOSE,
        },
    },
    'root': {
        'level': LOGGING_LEVEL,
        'handlers': ['console'],
        'propagate': True,
    },
    'loggers': {
        'fontTools': {
            'level': 'ERROR',
            'handlers': ['console'],
            'propagate': True,
        },
    }
}

CALC_LOGGING_DETAIL = env('CALC_LOGGING_DETAIL', default=True)
