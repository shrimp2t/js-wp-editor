/*
 *	JavaScript Wordpress editor
 *	Author: 		Ante Primorac
 *	Author URI: 	http://anteprimorac.from.hr
 *	Version: 		1.0
 *	License:
 *		Copyright (c) 2013 Ante Primorac
 *		Permission is hereby granted, free of charge, to any person obtaining a copy
 *		of this software and associated documentation files (the "Software"), to deal
 *		in the Software without restriction, including without limitation the rights
 *		to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *		copies of the Software, and to permit persons to whom the Software is
 *		furnished to do so, subject to the following conditions:
 *
 *		The above copyright notice and this permission notice shall be included in
 *		all copies or substantial portions of the Software.
 *
 *		THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *		IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *		FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *		AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *		LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *		OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *		THE SOFTWARE.
 *	Usage:
 *		server side(WP):
 *			js_wp_editor( $settings );
 *		client side(jQuery):
 *			$('textarea').wp_editor( options );
 */


;(function( $, window ) {
    $.fn.wp_editor = function( options ) {
        if( !$(this).is('textarea') || typeof window.tinyMCEPreInit == 'undefined' || typeof QTags == 'undefined' ) return this;

        var default_options = {
            'wp_root': location.origin,
            'mode': 'html',
            'mceInit': {
                "mode":"textareas",
                "width":"100%",
                "theme": window.tinyMCEPreInit.mceInit.content.theme,
                "skin": window.tinyMCEPreInit.mceInit.content.skin,
                "language": window.tinyMCEPreInit.mceInit.content.lang,

                "formats": window.tinyMCEPreInit.mceInit.formats,
                "relative_urls":false,
                "remove_script_host":false,
                "convert_urls":false,
                "remove_linebreaks":false,
                browser_spellcheck: true,
                "fix_list_elements":true,
                entity_encoding: "raw",
                "keep_styles":true,
                "entities":window.tinyMCEPreInit.mceInit.content.entities,
                "accessibility_focus":true,
                "media_strict":false,
                "paste_remove_styles":false,
                "paste_remove_spans":false,
                "paste_text_use_dialog":true,
                "webkit_fake_resize":false,
                "preview_styles": window.tinyMCEPreInit.mceInit.content.preview_styles,
                "schema":"html5",
                 wpeditimage_disable_captions:  window.tinyMCEPreInit.mceInit.content.wpeditimage_disable_captions,
                 wpeditimage_html5_captions:  window.tinyMCEPreInit.mceInit.content.wpeditimage_html5_captions,
                "wp_fullscreen_content_css": tinyMCEPreInit.base + "/plugins/wpfullscreen/css/wp-fullscreen.css",
                external_plugins: window.tinyMCEPreInit.mceInit.content.external_plugins,
                "plugins": window.tinyMCEPreInit.mceInit.content.plugins,
                "content_css": window.tinyMCEPreInit.mceInit.content.content_css,
                "elements":"ap[id]",
                 menubar: false,
                "wpautop":true,
                indent: false,
                toolbar1: window.tinyMCEPreInit.mceInit.content.toolbar1 ,
                toolbar2: window.tinyMCEPreInit.mceInit.content.toolbar2 ,
                toolbar3: window.tinyMCEPreInit.mceInit.content.toolbar3,
                toolbar4: window.tinyMCEPreInit.mceInit.content.toolbar4,
                "tabfocus_elements": window.tinyMCEPreInit.mceInit.tabfocus_elements,
                "body_class":"ap[id]",
                "theme_advanced_resizing_use_cookie": false
            }
        }, id_regexp = new RegExp('ap\\[id\\]', 'g'), wp_root_regexp = new RegExp('ap\\[wp\\_root\\]', 'g');



      //  var default_options  = window.tinyMCEPreInit,  id_regexp = new RegExp('ap\\[id\\]', 'g'), wp_root_regexp = new RegExp('ap\\[wp\\_root\\]', 'g');;

        if(window.tinyMCEPreInit.mceInit['ap[id]'])
            default_options.mceInit = window.tinyMCEPreInit.mceInit['ap[id]'];

        var options = $.extend(true, default_options, options);
        $.each(options.mceInit, function( key, value ) {
            if( $.type( value ) == 'string' )
                options.mceInit[key] = value.replace(wp_root_regexp, options.wp_root);
        });
        return this.each(function() {
            if($(this).is('textarea')) {
               // console.dir(options);
                var current_id = $(this).attr('id');
                options.mceInit.elements = options.mceInit.elements.replace(id_regexp, current_id);
                options.mceInit.body_class = options.mceInit.body_class.replace(id_regexp, current_id);
             //   options.mode = options.mode == 'tmce' ? 'tmce' : 'html';

                window.tinyMCEPreInit.mceInit[current_id] = options.mceInit;

                $(this).addClass('wp-editor-area').show();
                var self = this;
                if($(this).closest('.wp-editor-wrap').length) {
                    var parent_el = $(this).closest('.wp-editor-wrap').parent();
                    $(this).closest('.wp-editor-wrap').before($(this).clone());
                    $(this).closest('.wp-editor-wrap').remove();
                    self = parent_el.find('textarea[id="' + current_id + '"]');
                }
                var wrap = $('<div id="wp-' + current_id + '-wrap" class="wp-core-ui wp-editor-wrap ' + options.mode + '-active" />'),
                    editor_tools = $('<div id="wp-' + current_id + '-editor-tools" class="wp-editor-tools hide-if-no-js" />'),
                    switch_editor_html = $('<a id="' + current_id + '-html" class="wp-switch-editor switch-html" onclick="switchEditors.switchto(this);">Text</a>'),
                    switch_editor_tmce = $('<a id="' + current_id + '-tmce" class="wp-switch-editor switch-tmce" onclick="switchEditors.switchto(this);">Visual</a>'),
                    media_buttons = $('<div id="wp-' + current_id + '-media-buttons" class="wp-media-buttons" />'),
                    insert_media_button = $('<a href="#" id="insert-media-button" class="button insert-media add_media" data-editor="' + current_id + '" title="Add Media"><span class="wp-media-buttons-icon"></span> Add Media</a>'),
                    editor_container = $('<div id="wp-' + current_id + '-editor-container" class="wp-editor-container" />'),
                    content_css = false;
                    //content_css = Object.prototype.hasOwnProperty.call(window.tinyMCEPreInit.mceInit[current_id], 'content_css') ? window.tinyMCEPreInit.mceInit[current_id]['content_css'].split(',') : false;

                insert_media_button.appendTo(media_buttons);
                switch_editor_html.appendTo(editor_tools);
                switch_editor_tmce.appendTo(editor_tools);
                media_buttons.appendTo(editor_tools);

                editor_tools.appendTo(wrap);
                editor_container.appendTo(wrap);

                editor_container.append($(self).clone());

                if( content_css != false )
                    $.each( content_css, function() {
                        $(self).before('<link rel="stylesheet" type="text/css" href="' + this + '">');
                    } );
                $(self).before(wrap);
                $(self).remove();

                new QTags(current_id);
                QTags._buttonsInit();
                switchEditors.go(current_id, options.mode);

                $(wrap).on("click", ".insert-media", function(e) {
                    var f = $(this), d = f.data("editor"), c = {frame: "post",state: "insert",title: wp.media.view.l10n.addMedia,multiple: true};
                    e.preventDefault();
                    f.blur();
                    if (f.hasClass("gallery")) {
                        c.state = "gallery";
                        c.title = wp.media.view.l10n.createGalleryTitle
                    }
                    wp.media.editor.open(d, c);
                });
            }
        });
    }
})( jQuery, window );
