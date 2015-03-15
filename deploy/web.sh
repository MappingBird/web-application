#!/bin/bash

DIR=$(dirname $0)
BASEDIR=$DIR/../

# virtualenv
VENV=/home/django/venvs/pingismo
source $VENV/bin/activate
source $VENV/bin/postactivate

# gunicorn
USER=django
GROUP=django
NUM_WORKERS=3
LOGFILE=/var/log/pingismo/gunicorn.log
PID=/var/run/gunicorn.pid
PORT=9002
BIND_IP=127.0.0.1:$PORT
LANG=en_US.UTF-8

if [ -f $PID ]; then rm $PID; fi

cd $BASEDIR/src/django
LANG=$LANG exec gunicorn pingismo.wsgi:application --pid=$PID --workers=$NUM_WORKERS --user=$USER --group=$GROUP --log-file=$LOGFILE 2>>$LOGFILE --bind=$BIND_IP
