/*
    genericadmin - original by Weston Nielson (wnielson@gmail.com)

    updated by Kyle Rimkus (krimkus@concentricsky.com)

 */
 (function($) {
    var GenericAdmin = {
        url_array: null,
        admin_media_url: window.__admin_media_prefix__,
        prepareSelect: function(elem) {
            return $(elem).parents('div.cke_dialog_page_contents').find('select.content_type').first();
        },

        getLookupUrl: function(cID) {
            return this.url_array[cID];
        },
        hideLookupLink: function() {
            $('#lookup_' + this.object_input.id).unbind().remove();
            $('#lookup_text_' + this.object_input.id).remove();
        },
        showLookupLink: function() {
            var that = this;
            var url = this.getLookupUrl(this.cID);
            var id = 'lookup_' + this.object_input.id;
            var link_text = 'Choose an item';
            if (this.object_input.value) {link_text = 'Change';}
            var link = '<a class="related-lookup cke_dialog_ui_button" id="' + id + '" href="' + url + '">';
            link = link + '<span id="lookup_button_' + this.object_input.id + '" style="cursor: pointer; " class="cke_dialog_ui_button">'+link_text+'</span></a>';
            link = link + '<strong id="lookup_text_' + this.object_input.id + '" style="line-height: 2.9em; float:left; margin-right: 10px"></strong>';
            // insert link html after input element
            $(this.object_input).after(link);

            return id;
        },
        pollInputChange: function(window) {
            var that = this;
            var interval_id = setInterval(function() {
                if (window.closed == true) {
                    clearInterval(interval_id);
                    that.updateObjectData()();
                    return true;
                }
            },
            150);
        },
        popRelatedObjectLookup: function(link) {
            var name = link.id.replace(/^lookup_/, '');
            var href;
            var win;

            name = id_to_windowname(name);

            if (link.href.search(/\?/) >= 0) {
                href = link.href + '&pop=1';
            } else {
                href = link.href + '?pop=1';
            }
            win = window.open(href, name, 'height=500,width=800,resizable=yes,scrollbars=yes');

            // wait for popup to be closed and load object data
            this.pollInputChange(win);

            win.focus();
            return false;
        },
        updateObjectDataCallback: function(){
            $('#lookup_button_' + this.object_input.id).text('Change');
        },
        updateObjectData: function() {
            var that = this;

            return function() {
                // if (!that.object_input.value) { return } 
                // bail if no input
                $('#lookup_text_' + that.object_input.id).text('').text('loading...');
                $.ajax({
                    url: CKEDITOR.config.obj_lookup_url,
                    dataType: 'json',
                    data: {
                        object_id: that.object_input.value,
                        content_type: that.cID
                    },
                    success: function(data) {
                        var item = data[0];
                        if (item && item.content_type_text && item.object_text) {
                            $('#lookup_text_'+that.object_input.id).text(item.object_text);
                            // run a callback to do other stuff like prepopulating url fields
                            // can't be done with normal django admin prepopulate
                            if (that.updateObjectDataCallback) {
                                that.updateObjectDataCallback(item);
                            }
                        }
                    }
                });
            };
        },

        updateObjectLookup: function(elem){
            var that = this;
            var link_id;
            that.hideLookupLink();
            // Set our objectId when the content_type is changed
            if (elem.value) {
                that.cID = elem.value;
                link_id = that.showLookupLink();
                $('#' + link_id).click(function(e) {
                    that.popRelatedObjectLookup(this);
                    return false;
                });
            }
        },

        installLookup: function(elem) {
            var that = this;
            // initialize the url array
            that.url_array = CKEDITOR.config.content_embed_urls;
            // store the base element
            that.object_input = elem;
            // find the select we need to change
            that.object_select = that.prepareSelect(elem);

            // install event handler for select change
            $(that.object_select).change(function() {
                // Clear the ID if the type changes
                $(that.object_input).val('');
                that.hideLookupLink();
                // Update the lookup url
                that.updateObjectLookup(this);

            });

            // Initialize object_data
            if ($(this.object_select).val()) {
                if ($(this.object_input).val()) {
                    // If both type and id exist, look up the obj and update the obj data
                    that.updateObjectLookup($(that.object_select)[0]);
                    this.updateObjectData()();
                } else {
                    // run a full change event on object_select
                    $(this.object_select).trigger('change');
                }
            }

            // Bind to the onblur of the object_id input.
            $(this.object_input).blur(this.updateObjectData());
            $(this.object_input).hide();
        },
    };

    var ImageEmbedAdmin = {
        url_array: null,
        admin_media_url: window.__admin_media_prefix__,
        showLookupLink: function() {
            var that = this;
            var id = 'lookup_' + this.object_input.id;
            var link_text = 'Choose an uploaded image';
            var link = '<a class="related-lookup cke_dialog_ui_button" id="' + id + '" href="' + this.url + '">';
            link = link + '<span id="lookup_button_' + this.object_input.id + '" style="cursor: pointer;" class="cke_dialog_ui_button">'+link_text+'</span></a>';
            // insert link html after input element
            $(this.object_input).parents('.cke_dialog_ui_vbox > table > tbody > tr').last().after(link);

            return id;
        },
        pollInputChange: function(window) {
            var that = this;
            var interval_id = setInterval(function() {
                if (window.closed == true) {
                    clearInterval(interval_id);
                    that.url_obj.setValue('/imageuploadpreview/' + that.url_obj.getValue());
                    return true;
                }
            },
            150);
        },
        popRelatedObjectLookup: function(link) {
            var name = link.id.replace(/^lookup_/, '');
            var href;
            var win;

            name = id_to_windowname(name);

            if (link.href.search(/\?/) >= 0) {
                href = link.href + '&pop=1';
            } else {
                href = link.href + '?pop=1';
            }
            win = window.open(href, name, 'height=500,width=800,resizable=yes,scrollbars=yes');

            // wait for popup to be closed and load object data
            this.pollInputChange(win);

            win.focus();
            return false;
        },
        
        installLookup: function(elem, url_obj) {
            var that = this;
            
            that.url_obj = url_obj
            // initialize the url 
            that.url = CKEDITOR.config.image_embed_url;
            // store the base element
            that.object_input = elem;

            var link_id = that.showLookupLink();

            $('#' + link_id).click(function(e) {
                that.popRelatedObjectLookup(this);
                return false;
            });
        }
    };


    // This is for the LINK module. It is called by onShow() on the contentOptions field.
    // in link.js, line 766
    activate_content_type_select = function(){
        $("div.object_id input").each(function(i, e) {
            $.extend({}, GenericAdmin).installLookup(this);
        });
    };

    // This is for the IMAGE module. It is called by onShow() on the txtUrl field.
    // in image.js, line 321
    activate_image_select = function(url_obj){
        $("div.image_url input").each(function(i, e) {
            $.extend({}, ImageEmbedAdmin).installLookup(this, url_obj);
        });
    };

} (django.jQuery));
