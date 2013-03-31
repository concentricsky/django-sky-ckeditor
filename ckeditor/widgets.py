import re

try:
    import simplejson as json
except ImportError:
    import json

from django import forms
from django.conf import settings
from django.contrib.admin import widgets as admin_widgets
from django.template.loader import render_to_string
from django.utils.safestring import mark_safe
from django.contrib.contenttypes.models import ContentType
from django.conf.urls import patterns, url
from django.core.urlresolvers import reverse, NoReverseMatch


CKEDITOR_CONFIGS = dict((k, json.dumps(v)) for k, v in settings.CKEDITOR_CONFIGS.items())
FILEBROWSER_PRESENT = 'filebrowser' in getattr(settings, 'INSTALLED_APPS', [])
CKEDITOR_EMBED_CONTENT = getattr(settings, 'CKEDITOR_EMBED_CONTENT', [])

MEDIA = getattr(settings, 'CKEDITOR_MEDIA_URL',
                '%s' % settings.STATIC_URL.rstrip('/')).rstrip('/')


class CKEditor(forms.Textarea):
    def __init__(self, *args, **kwargs):
        attrs = kwargs.get('attrs', {})
        attrs['class'] = 'django-ckeditor'
        kwargs['attrs'] = attrs
        self.ckeditor_config = kwargs.pop('ckeditor_config', 'default')
        super(CKEditor, self).__init__(*args, **kwargs)

    def render(self, name, value, attrs=None, **kwargs):
        rendered = super(CKEditor, self).render(name, value, attrs)
        content_embed_options = []
        content_embed_urls = {}
        
        for model_string in CKEDITOR_EMBED_CONTENT:

            app_label, model_name = model_string.split('.',1)
            current_contenttype = ContentType.objects.get(app_label=app_label, model=model_name)
            model_label = current_contenttype.model_class()._meta.verbose_name
            contenttype_id = current_contenttype.id
            model_url = '../../../%s/%s/?t=id' % (app_label, model_name)
            content_embed_options += [[model_label, str(contenttype_id)]]
            content_embed_urls[str(contenttype_id)] = model_url

        image_embed_url = '../../../%s/%s/?t=id' % ('structure', 'imageupload')

        context = {
            'name': name,
            'config': CKEDITOR_CONFIGS[self.ckeditor_config],
            'filebrowser': FILEBROWSER_PRESENT,
            'content_embed_options': content_embed_options,
            'content_embed_urls': json.dumps(content_embed_urls),
            'image_embed_url': image_embed_url,

            # This "regex" should match the ID attribute of this field.
            # The reason we use a regex is so we can handle inlines, which will have
            # IDs like: id_subsection-6-description
            'regex': attrs['id'].replace('__prefix__', r'\d+'),
        }
        # added to remove client_admin dependancy
        try:
            context['obj_lookup_url'] = reverse('admin_genericadmin_obj_lookup')
        except NoReverseMatch:
            pass

        return rendered + mark_safe(render_to_string( 'ckeditor/ckeditor_script.html', context )) 

    def value_from_datadict(self, data, files, name):
        val = data.get(name, u'')
        r = re.compile(r"""(.*?)(\s*<br\s*/?>\s*)*\Z""", re.MULTILINE | re.DOTALL)
        m = r.match(val)
        return m.groups()[0].strip()

    class Media:
        js = (
            MEDIA + '/ckeditor/ckeditor/ckeditor.js',
            MEDIA + '/ckeditor/init.js',
            MEDIA + '/client_admin/js/genericadmin.js',
            MEDIA + '/ckeditor/genericadmin.js',
        )



class AdminCKEditor(admin_widgets.AdminTextareaWidget, CKEditor):
    pass

