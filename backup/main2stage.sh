#!/bin/bash
DATE=`date +'%Y-%m%d-%H%M%S'`
FILENAME=pingismo-$DATE-main.sql

DB_PRODUCTION='pingismo'
DB_STAGE='mappingbird-stage'

# Copy database
pg_dump -U django -h localhost $DB_PRODUCTION > /home/django/backups/$FILENAME
psql -U django -h localhost $DB_STAGE < ./clear-tables.sql
psql -U django -h localhost $DB_STAGE < /home/django/backups/$FILENAME
rm /home/django/backups/$FILENAME

# Copy media
rm -r /home/django/stage/pingismo/src/django/media/*
cp -r /home/django/pingismo/src/django/media/* /home/django/stage/pingismo/src/django/media/
