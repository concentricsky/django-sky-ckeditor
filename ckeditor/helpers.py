import jingo
import jinja2
from django.contrib.contenttypes.models import ContentType
import re

ImageUploadClass = None
try:
    from skycms.structure.models import ImageUpload
    ImageUploadClass = ImageUpload
except ImportError:
    pass


@jingo.register.function
def object_url(content_type_id, id):
    try:
        content_type = ContentType.objects.get(id=content_type_id)
        model = content_type.model_class()
        content = model.objects.get(id=id)
        return content.get_absolute_url()
    except:
        return None


_object_url_regex = '\[\[\s*object_url\(\s*(\d*)\s*,\s*(\d*)\s*\)\s*\]\]'

def _replace_urls(match):
    try:
        content_type = ContentType.objects.get(id=match.groups()[0])
        model = content_type.model_class()
        content = model.objects.get(id=match.groups()[1])
        if content:
            new_substr = content.get_absolute_url()
        elif content_type:
            new_substr = content_type.absolute_list_url()
    except:
        new_substr = '/'
    return new_substr


_image_preview_url_regex = '/imageuploadpreview/(\d+)'

def _replace_image_preview_urls(match):
    try:
        new_substr = ImageUploadClass.objects.get(id=match.groups()[0]).file.url
    except:
        new_substr = match.group()
    return new_substr


@jingo.register.filter
def safe_ckeditor(text):
    # replace object_url tags
    text = re.sub(_object_url_regex, _replace_urls, text)

    # replace image preview urls
    text = re.sub(_image_preview_url_regex, _replace_image_preview_urls, text)

    return jinja2.Markup(text)