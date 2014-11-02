from __future__ import with_statement
from fabric.api import *
from fabric.contrib.console import confirm
from fabric.contrib.files import exists

import requests

env.hosts = ['django@mappingbird.com']
TOKEN = 'UukVO7JB1xFFOdsCNapq8GAPqkvvTRlg4UIWmgEj'
ROOM = 'PinGismo'

def notify(message):
    headers = {'content-type': 'application/json'}
    url = 'https://api.hipchat.com/v2/room/%s/notification?auth_token=%s' % (ROOM, TOKEN)

    payload = {
        'color': 'green',
        'message_format': 'html',
        'message': message,
    }

    r = requests.post(url, data=json.dumps(payload), headers=headers)
 
def get_code(stage=False):
    directory = 'pingismo'
    branch = 'master'

    if stage:
        directory = 'stage/pingismo'
        branch = 'stage'

    with cd(directory):
        # Get remote HEAD hash
        head_hash = run("git ls-remote git@github.com:mariachimike/pingismo.git refs/heads/%s | awk -F' ' '{print $1}'" % branch)
        previous_hash = run("git rev-parse HEAD")
        run('git pull origin %s' % branch)
        logs_output = run("git log --pretty=format:'<a href=\"https://github.com/mariachimike/pingismo/commit/%H\">%h</a> - %an, %ar: %s' --graph %s^..HEAD" % previous_hash)
        _logs = logs_output.split('\n')
        logs = '<br>'.join(_logs)
        notify(logs)

def copy_db():
    with cd('pingismo/backup'):
        run('./main2stage.sh')
 
def collect_static(stage=False):
    directory = 'pingismo'
    venv = 'pingismo'

    if stage:
        directory = 'stage/pingismo'
        venv = 'stage'

    with prefix('workon %s' % venv), cd('%s/src/django' % directory):
        run('python manage.py collectstatic')
 
def restart_pingismo(stage=False):
    service = 'pingismo'

    if stage:
        service = 'mappingbird-stage'

    sudo('service %s restart' % service)

def gittags(stage=False):
    directory = 'pingismo'

    if stage:
        directory = 'stage/pingismo'

def deploy():
    get_code()
    collect_static()
    restart_pingismo()

def stage():
    copy_db()
    get_code(stage=True)
    collect_static(stage=True)
    restart_pingismo(stage=True)

def testgit():
    get_code(stage=True)
