(function(){
    'use strict';

    /*globals Unicorn, Backbone, _, $, prettyPrint*/


    //APP CONTROLLER
    Unicorn.Views.App = Backbone.View.extend({

        initialize: function() {
            this.listenTo(this.model, 'change', this.updateGlobalStyles);

            this.render();
        },

        render: function() {

            //CREATE MENU BAR
            this.menubar = new Unicorn.Views.Menu({
                el: $('.menu-bar'),
                model: this.model
            });

            //ACTIVATE SHOWCASE VIEWS
            this.showcases = $('.showcase');
            _.each(this.showcases, this.createShowCase, this);

            return this;
        },

        createShowCase: function(showcase) {
            new Unicorn.Views.Showcase({
                model: this.model,
                el: showcase
            });
        },

        updateGlobalStyles: function() {
            var css = this.model.get('css');
            var styleTag = $('#custom-styles');
            styleTag.text(css);

            prettyPrint();
        },
    });




    //START APP ON PAGE LOAD
    $(document).ready(function(){
        prettyPrint();

        new Unicorn.Views.App({model: new Unicorn.Models.Button()});
    });
})();



