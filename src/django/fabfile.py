from __future__ import with_statement
from fabric.api import *
from fabric.contrib.console import confirm
from fabric.contrib.files import exists

env.hosts = ['django@mappingbird.com']
 
def get_code(stage=False):
    directory = 'pingismo'
    branch = 'master'

    if stage:
        directory = 'stage/pingismo'
        branch = 'stage'

    with cd(directory):
        run('git pull origin %s' % branch)

def copy_db():
    with cd('pingismo/backup'):
        run('./main2stage.sh')
 
def collect_static(stage=False):
    directory = 'pingismo'

    if stage:
        directory = 'stage/pingismo'

    with prefix('workon pingismo'), cd('%s/src/django' % directory):
        run('python manage.py collectstatic')
 
def restart_pingismo(stage=False):
    service = 'pingismo'

    if stage:
        service = 'mappingbird-stage'

    sudo('service %s restart' % service)

def deploy():
    get_code()
    collect_static()
    restart_pingismo()

def stage():
    get_code(stage=True)
    collect_static(stage=True)
    restart_pingismo(stage=True)
