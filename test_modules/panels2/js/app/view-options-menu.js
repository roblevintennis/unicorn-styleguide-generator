(function(){
    'use strict';

    /*globals Unicorn, Backbone, $ */

    //MENU BAR
    Unicorn.Views.Menu = Backbone.View.extend({
        events: {
            'click .button-download a': 'download',
            'click .button-jsonp a': 'build'
        },

        initialize: function() {
            //REGISTER ELEMENTS
            this.listenTo(this.model, 'change', this.updateComplete);

            this.render();
        },

        render: function() {
            return this;
        },

        updateComplete: function() {
            var data = this.model.toJSON();
            console.log(data);
        },

        build: function(e) {
            e.preventDefault();
            this.model.save();
        },

        download: function(e) {
            e.preventDefault();
            var url = 'http://localhost:5000/download/buttons?';
            var data = this.model.generate('buttons');
            url += $.param(data);
            console.log("URL: ", url);
            window.open(url, 'Download');
        }

    });
})();