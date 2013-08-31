(function(){
    'use strict';

    /*globals Backbone, _, $ */


    ////////////////////////////////////////////////
    // BACKBONE CUSTOM SETTINGS ////////////////////
    ////////////////////////////////////////////////

    Backbone.emulateHTTP = true;

    Backbone.sync = function(method, model, options) {
        options = options || {};
        // `model.generate` will provide proper data object
        // in the structure that's expected by server.
        var data = model.generate();

        var params = {
            type: 'POST',
            dataType: 'jsonp',
            data: data,
            url: model.url,
        };

        var data = _.extend(params, options);

        return $.ajax(data);
    };



    ////////////////////////////////////////////////
    // APP NAMESPACE ///////////////////////////////
    ////////////////////////////////////////////////
    window.Unicorn = {
        Models: {},
        Views: {},
        Utils: {}
    };

})();




