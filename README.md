![Concentric Sky](https://concentricsky.com/media/uploads/images/csky_logo.jpg)


Django CKEditor
===============

This library was forked from https://github.com/dwaiter/django-ckeditor. `django-ckeditor` makes it easy to use [CKEditor][] with your Django 1.3+ text fields.

[CKEditor]: http://ckeditor.com/


### Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [License](#license)
- [About Concentric Sky](#about-concentric-sky)


## Installation

Install the package with [pip][] and [git][]:

    pip install git://github.com/concentricsky/django-sky-ckeditor

[pip]: http://pip.openplans.org/
[git]: http://git-scm.com/

Add `ckeditor` to your `INSTALLED_APPS`.

Add a `CKEDITOR_CONFIGS` variable to your `settings.py` with at least a
`default` config:

    CKEDITOR_CONFIGS = {
        'default': {
            'toolbar': [
                [      'Undo', 'Redo',
                  '-', 'Format',
                  '-', 'Bold', 'Italic', 'Underline',
                  '-', 'Link', 'Unlink', 
                  '-', 'BulletedList', 'NumberedList',
                ],
                [      'SpellChecker', 'Scayt',
                ],
                [      'Image',
                  '-', 'PasteText','PasteFromWord',
                  '-', 'Source',
                ]
            ],
            'width': 655,
            'height': 250,
            'toolbarCanCollapse': False,
            'linkShowTargetTab': False,
            'linkShowAdvancedTab': False,
        }
    }

Collect the static files:

    python manage.py collectstatic


## Usage


To use CKEditor for a particular field in a form, set its widget to an
instance of `ckeditor.widgets.CKEditor` like this:

    from ckeditor.widgets import CKEditor
    
    class SampleForm(forms.Form):
        body = forms.CharField(
            widget=CKEditor()
        )
    

As a shortcut you can use a `ckeditor.fields.HTMLField` instead of
`django.db.models.TextField` in a model to automatically use the CKEditor
widget, like so:

    from django.db import models
    from ckeditor.fields import HTMLField
    
    class Sample(models.Model):
        # This will use a normal <textarea> when rendered in a (Model)Form
        plain_body = models.TextField(blank=True, verbose_name='plain version')
        
        # This will use CKEditor when rendered in a (Model)Form
        html_body = HTMLField(blank=True, verbose_name='HTML version')

Custom Configurations
---------------------

Sometimes it's nice to be able to configure each CKEditor widget separately.
For example, you may want one field to have all the buttons on the toolbar,
but another field to only show bold/italic/underline buttons.

To do this, add additional configurations to your `CKEDITOR_CONFIGS` setting
like this:

    CKEDITOR_CONFIGS = {
        'default': {
            'toolbar': [
                [      'Undo', 'Redo',
                  '-', 'Format',
                  '-', 'Bold', 'Italic', 'Underline',
                  '-', 'Link', 'Unlink', 
                  '-', 'BulletedList', 'NumberedList',
                ],
                [      'SpellChecker', 'Scayt',
                ],
                [      'Image',
                  '-', 'PasteText','PasteFromWord',
                  '-', 'Source',
                ]
            ],
            'width': 655,
            'height': 250,
            'toolbarCanCollapse': False,
            'linkShowTargetTab': False,
            'linkShowAdvancedTab': False,
        }
        , 'basic': {
            'toolbar': [
                [      'Bold', 'Italic',
                  '-', 'Link', 'Unlink',
                ]
            ]
            , 'width': 600
            , 'height': 250
            , 'toolbarCanCollapse': False
            , 'toolbarLocation': 'bottom'
            , 'resize_enabled': False
            , 'removePlugins': 'elementspath'
            , 'forcePasteAsPlainText': True
      }
    }

When setting up the `CKEditor` widget in your `Form` class you can pass a
`ckeditor_config` keyword argument to specify the config to use:

    class BlogPostForm(forms.Form):
        title = forms.CharField()
        
        # This field will render as a CKEditor with the 'simple_toolbar' config.
        subtitle = forms.CharField(
            widget=CKEditor(ckeditor_config='basic')
        )
        
        # This field will render as a CKEditor with the 'default' config.
        body = forms.CharField(
            widget=CKEditor()
        )


You cannot use the `HTMLField` shortcut if you want to specify a custom config
-- you *must* create a form.

### Additional Configuration Options

If you want to limit the formats available in the Format drop-down, add the following to the config definition:

    'format_tags': 'p;h3;h4', 

### Embedded content

Links in your HTMLFields will be able to point to either a model's list view or a model instance's absolute url. To provide a url for a model, define a class method called absolute_list_url:

    @classmethod
    def absolute_list_url(cls):
        return reverse('career_posting')

To provide a url for a model instance, define a method called get_absolute_url:

    @models.permalink
    def get_absolute_url(self):
        return ('structure_page', None, {
            'slug': self.slug
        })

By default, links will be able to point to any model from any registered app. You can specify a list to limit the options by providing a `CKEDITOR_EMBED_CONTENT` setting like this:

  CKEDITOR_EMBED_CONTENT = ['structure.page', 'services.service', 'services.technology', 'portfolio.portfolioitem']

This will limit the list to four items and hide models that don't have absolute urls like 'auth.group', etc.

### Media URL

You can also customize the URL that django-ckeditor will look for the CKEditor
media at by adding `CKEDITOR_MEDIA_URL` to your `settings.py` file like this:

    CKEDITOR_MEDIA_URL = '/static/third-party/ckeditor'

The default value is `MEDIA_URL/ckeditor` which is why the setup instructions
tell you to symlink it into your `media/` directory.


## License

Details can be found in the LICENSE.md file.


## About Concentric Sky

_For nearly a decade, Concentric Sky has been building technology solutions that impact people everywhere. We work in the mobile, enterprise and web application spaces. Our team, based in Eugene Oregon, loves to solve complex problems. Concentric Sky believes in contributing back to our community and one of the ways we do that is by open sourcing our code on GitHub. Contact Concentric Sky at hello@concentricsky.com._

