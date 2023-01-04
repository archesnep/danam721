import os
from django.core.exceptions import ImproperlyConfigured
import ast
import requests
import sys


def get_env_variable(var_name):
    msg = "Set the %s environment variable"
    try:
        return os.environ[var_name]
    except KeyError:
        error_msg = msg % var_name
        raise ImproperlyConfigured(error_msg)


def get_optional_env_variable(var_name):
    try:
        return os.environ[var_name]
    except KeyError:
        return None


# options are either "PROD" or "DEV" (installing with Dev mode set gets you extra dependencies)
MODE = get_env_variable("DJANGO_MODE")

DEBUG = ast.literal_eval(get_env_variable("DJANGO_DEBUG"))

CELERY_BROKER_URL = "amqp://{}:{}@{}:{}".format(
    get_env_variable("RABBITMQ_USER"), get_env_variable("RABBITMQ_PASS"), get_env_variable("RABBITMQ_HOST"), get_env_variable("RABBITMQ_PORT")
)  # defaults to amqp://guest:guest@rabbitmq:5672


DATABASES = {
    "default": {
        "ENGINE": "django.contrib.gis.db.backends.postgis",
        "NAME": get_env_variable("PGDBNAME"),
        "USER": get_env_variable("PGUSERNAME"),
        "PASSWORD": get_env_variable("PGPASSWORD"),
        "HOST": get_env_variable("PGHOST"),
        "PORT": get_env_variable("PGPORT"),
        "POSTGIS_TEMPLATE": "template_postgis",
    }
}

ELASTICSEARCH_HTTP_PORT = int(get_env_variable("ESPORT"))
ELASTICSEARCH_HOSTS = [{"scheme": "http", "host": get_env_variable("ESHOST"), "port": ELASTICSEARCH_HTTP_PORT}]


USER_ELASTICSEARCH_PREFIX = get_optional_env_variable("ELASTICSEARCH_PREFIX")
if USER_ELASTICSEARCH_PREFIX:
    ELASTICSEARCH_PREFIX = USER_ELASTICSEARCH_PREFIX

ALLOWED_HOSTS = [get_env_variable("DOMAIN_NAMES"),"localhost"]

USER_SECRET_KEY = get_optional_env_variable("DJANGO_SECRET_KEY")
if USER_SECRET_KEY:
    # Make this unique, and don't share it with anybody.
    SECRET_KEY = USER_SECRET_KEY

STATIC_ROOT = "/static_root"
STATIC_URL = '/media/'

# To fix the issue of open() permission in nginx for user uploadedfiles more than 2MB
FILE_UPLOAD_MAX_MEMORY_SIZE = 524288000

# For webpack host ultrasonic
ARCHES_NAMESPACE_FOR_DATA_EXPORT = "http://localhost:8000/"