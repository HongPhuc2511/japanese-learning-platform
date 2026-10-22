#!/bin/sh
set -e

echo "Chạy migrate..."
python manage.py migrate --noinput

echo "Gom file tĩnh..."
python manage.py collectstatic --noinput

exec gunicorn core.wsgi:application \
    --bind 0.0.0.0:8000 \
    --workers 3 \
    --timeout 90 \
    --access-logfile - \
    --error-logfile -