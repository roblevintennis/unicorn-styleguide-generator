(function(){
    'use strict';

    /*globals Unicorn, Backbone, escape, prettyPrint */

    //CODE EXAMPLE VIEW
    Unicorn.Views.Showcase = Backbone.View.extend({

        initialize: function() {
            //REGISTER ELEMENTS
            this.codebox = this.$('pre');
            this.gallery = this.$('.gallery');

            //LISTEN FOR CHANGES ON THE MODEL THEN RE-RENDER
            this.listenTo(this.model, 'change', this.render);
        },

        render: function() {
            //GET UPDATED ATTRIBUTES
            var attrs = this.model.toJSON();

            //UPDATE BUTTONS AND CODE SAMPLE
            this.updateButtons(attrs);
            this.updateCodePreview(attrs);

            return this;
        },

        updateButtons: function(attributes) {

        },

        updateCodePreview: function(attributes) {
            var encodedHTML = this._encodeHTML(this.gallery.html());
            this.codebox.html(encodedHTML);
            prettyPrint();
        },

        _encodeHTML: function(str) {
            return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
        }
    });
})();