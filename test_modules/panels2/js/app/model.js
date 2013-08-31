(function(){
    'use strict';

    /*globals Unicorn, Backbone _ */

    //MODEL
    Unicorn.Models.Base = Backbone.Model.extend({
        module: '', //required override e.g. 'buttons', 'grids', etc.
        url: '', //required override
        // Black listed properties to omit when building http requests
        // from model. Used by `generate` callback.
        blackList: ['css', 'options'],
        initialize: function() {},

        /**
         * Precondition: Decendents of `Models.Base` MUST define `module` and `url`
         * or `parse` will not work correctly.
         * @param  {Object} response http response
         * @return {Object}          Object literal like: `{css:...,options:...}`
         */
        parse: function(response) {
            var styles = {css: '', options: ''};
            // parse can be invoked for fetch and save, in case of save it can be undefined so check before using
            if (response && response[this.module] && response.optionsScss) {
                styles.css = response[this.module];
                styles.options = response.optionsScss;
            }
            return styles;
        },
        /**
         * `generate` is a required callback that must be implemented by "sub-classes"
         * of Unicorn.Models.Base, and must generate an object with the following
         * properties:
         * <pre>
         * {
         *     _options: <valid_options_scss>,
         *     _module: <valid_module_scss>,
         *     name: <module_name>
         * }
         * </pre>
         * A recommended approach to build these for example might use Array.join like:
         * <pre>
         * var css = [];
         *     css.push('$namespace: "' + namespace + '";')
         *     css.push('$bgcolor: ' + bgColor + ';');
         *     css.push('$height: ' + height + ';');
         *     css.push("$font-family: '" + fontFamily + "';");
         *     css.push('$dropdown-background: ' + dropdownBackground + ';');
         *     return css.join('\n');
         * </pre>
         * @return {Object} Object with strings for the _options.scss and _<MODULE>.scss
         * that can be compiled via `compass compile`
         */
        generate: function() {
            // NO-OP ... this method MUST be overriden
            throw new Error('Generate not implemented!');
        },
        /**
         * Generates a simple css property as string
         * @param  {String}  k        Key
         * @param  {String}  v        Value
         * @param  {Boolean} isQuoted Whether the value needs to be quoted
         * @return {String}           css string
         */
        generateSimpleProperty: function(k, v, isQuoted) {
            if (!k || !v) return;
            if (isQuoted) {
                return k +": '"+v+"';";
            }
            return k +': '+v+';';
        }
    });
    Unicorn.Models.Button = Unicorn.Models.Base.extend({
        module: 'buttons',
        //Back-end now has route /build/:module where :module will be buttons, grids, etc.
        url: 'http://localhost:5000/build/buttons',
        //url: 'http://options-compiler.herokuapp.com/build/'+this.module, //production
        defaults: function() {
            return {
                '$namespace': '.button',
                '$glow_namespace': '.glow',
                '$glow_color': '#2c9adb',
                '$bgcolor': '#CCC',
                '$height': '32px',
                '$font-color': '#666',
                '$font-size': '14px',
                '$font-weight': '300',
                '$font-family': '\'HelveticaNeue-Light\', \'Helvetica Neue Light\', \'Helvetica Neue\', Helvetica, Arial, \'Lucida Grande\', sans-serif',
                '$dropdown-background': '#fcfcfc',
                '$dropdown-link-color': '#333',
                '$dropdown-link-hover': '#FFF',
                '$dropdown-link-hover-background': '#3c6ab9',
                '$button_actions': {
                    primary: '#00A1CB #FFF',
                    action: '#7db500 #FFF',
                    highlight: '#F18D05 #FFF',
                    caution: '#E54028 #FFF',
                    royal: '#87318C #FFF'
                    // ... define more as you please
                },
                '$button_styles': ['rounded', 'pill', 'circle'],
                '$button_sizes': ['large', 'small', 'tiny'],
                '$circle-size': '120px'
            };
        },
        /**
         * Example of a custom module's implementation of generate. We place the burden
         * on the module author to generate this, which in turn, adds flexibility. All
         * that's required really, is that they provide properties for _options and
         * _<module> that are "compilable" by issuing `compass compile`.
         * @return {Object} A valid `generate` object (@see Unicorn.Models.Base.generate)
         */
        generate: function() {
            var self = this;
            var css = [];
            var json = this.toJSON();
            // We need to loops through these so black list them from the simple
            // key: value properties we're about to generate
            var blackList = this.blackList.concat(['$button_actions', '$button_sizes', '$button_styles']);
            var mustQuoteList = ['$namespace', '$glow_namespace'];

            // First work with simple props that we don't have to quote
            var simpleProps = _.omit(json, blackList);
            _.each(_.omit(simpleProps, mustQuoteList), function(v, k) {
                css.push(self.generateSimpleProperty(k, v));
            });

            // These have to be quoted
            _.each(_.pick(simpleProps, mustQuoteList), function(v, k) {
                css.push(self.generateSimpleProperty(k, v, true));
            });

            // Now we manually build our more complex properties
            // Button Actions
            var buttonActions = '';
            _.each(json['$button_actions'], function(v, k) {
                buttonActions += "('" +k+ "' " +v+ ") ";
            });
            buttonActions += ';';
            css.push('$button_actions: ' + buttonActions);

            // Button Styles
            var buttonStyles = '';
            _.each(json['$button_styles'], function(v, k) {
                buttonStyles += "'" + v + "' ";
            });
            buttonStyles += ';';
            css.push('$button_styles: ' + buttonStyles);

            // Button Sizes
            var buttonSizes = '';
            _.each(json['$button_sizes'], function(v, k) {
                buttonSizes += "'" + v + "' ";
            });
            buttonSizes += ';';
            css.push('$button_sizes: ' + buttonSizes);
            return {name: this.module, _options: css.join('\n')};
        }
    });
    // Unicorn.Models.Grid = Unicorn.Models.Base.extend({
    //     module: 'grids',
    //     url: 'http://localhost:5000/build/'+this.module,
    //     //TODO define defaults here...
    //     default: function() {
    //         return {};
    //     }
    // });
})();