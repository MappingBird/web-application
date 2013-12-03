from __future__ import with_statement
from fabric.api import *
from fabric.contrib.console import confirm
from fabric.contrib.files import exists

env.hosts = ['django@pingismo.com']
 
def get_code():
    with cd('pingismo'):
        run('git pull origin master')
 
def collect_static():
    with prefix('workon pingismo'), cd('pingismo/src/django'):
        run('python manage.py collectstatic')
 
def restart_pingismo():
    sudo('service pingismo restart')

def deploy():
    get_code()
    collect_static()
    restart_pingismo()
