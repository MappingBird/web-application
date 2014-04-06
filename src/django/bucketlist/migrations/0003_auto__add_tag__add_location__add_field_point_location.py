# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Tag'
        db.create_table(u'bucketlist_tag', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(max_length=32)),
        ))
        db.send_create_signal(u'bucketlist', ['Tag'])

        # Adding model 'Location'
        db.create_table(u'bucketlist_location', (
            (u'id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('title', self.gf('django.db.models.fields.CharField')(max_length=512, blank=True)),
            ('description', self.gf('django.db.models.fields.TextField')(blank=True)),
            ('place_name', self.gf('django.db.models.fields.CharField')(max_length=512, blank=True)),
            ('place_address', self.gf('django.db.models.fields.CharField')(max_length=128, blank=True)),
            ('place_phone', self.gf('django.db.models.fields.CharField')(max_length=64, blank=True)),
            ('coordinates', self.gf('django.db.models.fields.CharField')(max_length=64, blank=True)),
            ('type', self.gf('django.db.models.fields.CharField')(max_length=32, blank=True)),
            ('create_time', self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, blank=True)),
            ('update_time', self.gf('django.db.models.fields.DateTimeField')(auto_now=True, blank=True)),
        ))
        db.send_create_signal(u'bucketlist', ['Location'])

        # Adding field 'Point.location'
        db.add_column(u'bucketlist_point', 'location',
                      self.gf('django.db.models.fields.related.ForeignKey')(related_name='points', null=True, to=orm['bucketlist.Location']),
                      keep_default=False)

        # Adding M2M table for field tags on 'Point'
        m2m_table_name = db.shorten_name(u'bucketlist_point_tags')
        db.create_table(m2m_table_name, (
            ('id', models.AutoField(verbose_name='ID', primary_key=True, auto_created=True)),
            ('point', models.ForeignKey(orm[u'bucketlist.point'], null=False)),
            ('tag', models.ForeignKey(orm[u'bucketlist.tag'], null=False))
        ))
        db.create_unique(m2m_table_name, ['point_id', 'tag_id'])


    def backwards(self, orm):
        # Deleting model 'Tag'
        db.delete_table(u'bucketlist_tag')

        # Deleting model 'Location'
        db.delete_table(u'bucketlist_location')

        # Deleting field 'Point.location'
        db.delete_column(u'bucketlist_point', 'location_id')

        # Removing M2M table for field tags on 'Point'
        db.delete_table(db.shorten_name(u'bucketlist_point_tags'))


    models = {
        u'auth.group': {
            'Meta': {'object_name': 'Group'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '80'}),
            'permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        u'auth.permission': {
            'Meta': {'ordering': "(u'content_type__app_label', u'content_type__model', u'codename')", 'unique_together': "((u'content_type', u'codename'),)", 'object_name': 'Permission'},
            'codename': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'content_type': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['contenttypes.ContentType']"}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '50'})
        },
        u'base.user': {
            'Meta': {'object_name': 'User'},
            'email': ('django.db.models.fields.EmailField', [], {'unique': 'True', 'max_length': '255', 'db_index': 'True'}),
            'groups': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Group']", 'symmetrical': 'False', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'is_active': ('django.db.models.fields.BooleanField', [], {'default': 'True'}),
            'is_admin': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_staff': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'is_superuser': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'last_login': ('django.db.models.fields.DateTimeField', [], {'default': 'datetime.datetime.now'}),
            'password': ('django.db.models.fields.CharField', [], {'max_length': '128'}),
            'user_permissions': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['auth.Permission']", 'symmetrical': 'False', 'blank': 'True'})
        },
        u'bucketlist.collection': {
            'Meta': {'object_name': 'Collection'},
            'create_time': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '512', 'blank': 'True'}),
            'update_time': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'user': ('django.db.models.fields.related.ForeignKey', [], {'to': u"orm['base.User']"})
        },
        u'bucketlist.image': {
            'Meta': {'object_name': 'Image'},
            'create_time': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'point': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'images'", 'to': u"orm['bucketlist.Point']"}),
            'update_time': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '200', 'blank': 'True'})
        },
        u'bucketlist.location': {
            'Meta': {'object_name': 'Location'},
            'coordinates': ('django.db.models.fields.CharField', [], {'max_length': '64', 'blank': 'True'}),
            'create_time': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'place_address': ('django.db.models.fields.CharField', [], {'max_length': '128', 'blank': 'True'}),
            'place_name': ('django.db.models.fields.CharField', [], {'max_length': '512', 'blank': 'True'}),
            'place_phone': ('django.db.models.fields.CharField', [], {'max_length': '64', 'blank': 'True'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '512', 'blank': 'True'}),
            'type': ('django.db.models.fields.CharField', [], {'max_length': '32', 'blank': 'True'}),
            'update_time': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'})
        },
        u'bucketlist.point': {
            'Meta': {'object_name': 'Point'},
            'collection': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'points'", 'to': u"orm['bucketlist.Collection']"}),
            'coordinates': ('django.db.models.fields.CharField', [], {'max_length': '64', 'blank': 'True'}),
            'create_time': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'description': ('django.db.models.fields.TextField', [], {'blank': 'True'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'location': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'points'", 'null': 'True', 'to': u"orm['bucketlist.Location']"}),
            'place_address': ('django.db.models.fields.CharField', [], {'max_length': '128', 'blank': 'True'}),
            'place_name': ('django.db.models.fields.CharField', [], {'max_length': '512', 'blank': 'True'}),
            'place_phone': ('django.db.models.fields.CharField', [], {'max_length': '64', 'blank': 'True'}),
            'tags': ('django.db.models.fields.related.ManyToManyField', [], {'to': u"orm['bucketlist.Tag']", 'symmetrical': 'False'}),
            'title': ('django.db.models.fields.CharField', [], {'max_length': '512', 'blank': 'True'}),
            'type': ('django.db.models.fields.CharField', [], {'max_length': '32', 'blank': 'True'}),
            'update_time': ('django.db.models.fields.DateTimeField', [], {'auto_now': 'True', 'blank': 'True'}),
            'url': ('django.db.models.fields.URLField', [], {'max_length': '4096', 'blank': 'True'})
        },
        u'bucketlist.tag': {
            'Meta': {'object_name': 'Tag'},
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '32'})
        },
        u'contenttypes.contenttype': {
            'Meta': {'ordering': "('name',)", 'unique_together': "(('app_label', 'model'),)", 'object_name': 'ContentType', 'db_table': "'django_content_type'"},
            'app_label': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            u'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'model': ('django.db.models.fields.CharField', [], {'max_length': '100'}),
            'name': ('django.db.models.fields.CharField', [], {'max_length': '100'})
        }
    }

    complete_apps = ['bucketlist']