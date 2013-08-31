'use strict';
module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        clean: {
            dist: ['dist']
        },
        compass: {
            dev: {
                options: {
                    config: 'config.rb',
                    sassDir: 'scss',
                    cssDir: 'css',
                    force: true
                }
            },
            dist: {
                options: {
                    config: 'config.rb',
                    sassDir: 'scss',
                    cssDir: 'css',
                    environment: 'production',
                    outputStyle: 'compressed',
                    force: true
                }
            }
        },
        watch: {
            sass: {
                files: ['scss/**/*.scss'],
                tasks: ['compass:dev']
            },
            scripts: {
                files: ['js/**/*js'],
            },
            css: {
                files: ['*.css']
            },
            livereload: {
                files: ['css/*.css', 'js/**/*.js'],
                options: { livereload: true }
            }
        },
        copy: {
            // Purpose of this task is to simply copy index.dev.html to index.html
            // (before usemin task), since usemin will replace our dev js/css includes
            // with something like src='path/to/all.min.js'. That way, we preserve
            // our index.dev.html which with all manual includes
            preUsemin: {
                files: [{cwd: '.', dest: 'index.html', src: 'index.dev.html'}]
            },
            // Copy over all fontawesome fonts to dist/font/
            fonts: {
                files: [{expand: true, src: ['font/*'], dest: 'dist/', filter: 'isFile'}]
            }
        },
        concat: {
            options: {
                //string to put between concatenated files
                //can be necessary when processing minified js code
                separator: ';'
            },
            vendor: {
                src: [  'js/vendor/jquery.1.10.2.js',
                        'js/vendor/scrollto.js',
                        'js/vendor/underscore.1.5.1.js',
                        'js/vendor/backbone.1.0.0.js',
                        'js/vendor/jszip.js',
                        'js/vendor/jszip-load.js',
                        'js/vendor/jszip-inflate.js',
                        'js/vendor/jszip-deflate.js'],
                dest: 'dist/js/vendor/all.js'
            },
            app: {
                src: [  'js/buttons.js',
                        'js/app/setup.js',
                        'js/app/zip.js',
                        'js/app/model.js',
                        'js/app/view-options-menu.js',
                        'js/app/view-showcase.js',
                        'js/app/app.js',
                        'js/main.js'],
                dest: 'dist/js/app/all.js'
            },
            css: {
                src: [  'css/font-awesome.min.css',
                        'css/main.css',
                        'css/buttons.css'],
                dest: 'dist/css/all.css'
            }
        },
        uglify: {
            options: {
                banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
            app: {
                src: 'dist/js/app/all.js',
                dest: 'dist/js/app/all.min.js'
            },
            vendor: {
                src: 'dist/js/vendor/all.js',
                dest: 'dist/js/vendor/all.min.js'
            }
            // TODO: css minfication throwing errors ... work out later
            // ,css: {
            //     src: 'dist/css/all.css',
            //     dest: 'dist/css/all.min.css'
            // }
        },
        //Depends on copy:preUsemin task to first copy index.dev.html to index.html
        useminPrepare: {
            html: ['index.html'],
            options: {
                dest: ['dest']
            }
        },
        usemin: {
            html: ['index.html']
            // css: ['**/*.css']
        }
    });
    grunt.loadNpmTasks('grunt-usemin');
    [
        // 'grunt-contrib-jshint',
        'grunt-contrib-compass',
        'grunt-contrib-watch',
        'grunt-contrib-clean',
        'grunt-contrib-copy',
        'grunt-contrib-concat',
        'grunt-contrib-uglify',
        'grunt-contrib-cssmin',
        'grunt-usemin'
    ].forEach(function(task) { grunt.loadNpmTasks(task); });

    // Same as Development without watch
    grunt.registerTask('default', [
        'clean:dist',
        'compass:dev',
        'copy:preUsemin'//copy index.dev.html to index.html
    ]);

    // Development
    grunt.registerTask('dev', [
        'clean:dist',
        'compass:dev',
        'copy:preUsemin',//copy index.dev.html to index.html
        'watch'
    ]);

    // Production
    grunt.registerTask('prod', [
        'clean:dist',
        'compass:dist',
        'useminPrepare',
        // 'imagemin',
        // 'htmlmin',
        'concat',
        // 'cssmin',
        'copy:preUsemin',//copy index.dev.html to index.html before usemine strips includes
        'uglify',
        'copy:fonts',//copy font-awesome fonts
        'usemin'
    ]);



};
