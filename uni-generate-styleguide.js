#!/usr/bin/env node

/**
 * Create a modules parent directory and place you're modules
 * as sub-directories of that parent. `modulesDirName` must
 * have the same name as that parent directory!
 * @type {String}
 */
var modulesDirName = 'test_modules';




var fs = require('fs');
var exec = require('child_process').exec;
var _ = require('underscore')._;
var path = require('path');
var modulesDir = path.join(path.dirname(process.argv[1]), './'+modulesDirName);
var styleguideDirName = 'styleguide';
var styleguideDir = path.join(path.dirname(process.argv[1]), './'+styleguideDirName);
var numDirsToProcess;//becomes the number of <module> dirs found
var MODULE_INDEX_FILENAME = 'index.dev.html';
var MODULE_LBL = 'UNI:MODULE:';
var MODULE_TITLE_TAG = 'h2 class="uni-module-title"';//we wrap in brackets within the code
var TYPE_PRAGMA_START = 'UNI:TYPE:';//indicates what follows is type section
var TYPE_PRAGMA_END = "</section>";//last thing we scrape is closing tag
var OPTIONS_PARTIAL_PATH = '/scss/partials/_options.scss';
var STYLEGUIDE_CSS_PATH = styleguideDir + '/css/styles.css';
var STYLEGUIDE_INDEX_PATH = styleguideDir + '/index.html';


function writeStyleguideHtml(markup, modulesArray) {
    var index = fs.readFile(STYLEGUIDE_INDEX_PATH, "utf8", function(err, data) {
        if (err) {
            return console.log("Issue reading the file "+STYLEGUIDE_INDEX_PATH+ "\nError: " + err +"\nAborting\n");
        }
        // Essentially, we'll replace the line <!-- UNI:STYLEGUIDE --> with our
        // scraped <sections> markup
        var content = data.replace(/\<\!\-\-.UNI\:STYLEGUIDE.\-\-\>/g, markup);

        // Generates sidebar of module names and injects in place of UNI:SIDEBAR
        var sidebar = '<ul>';
        for (var i=0; i<modulesArray.length; i++) {
            sidebar += '<li><a href="#">'+modulesArray[i]+'</a></li>';
        }
        sidebar += '</ul>';
        content = content.replace(/\<\!\-\-.UNI\:SIDEBAR.\-\-\>/g, sidebar);

        fs.writeFile(STYLEGUIDE_INDEX_PATH, content, 'utf8', function(err) {
            if(err) {
                console.log("Issue writing the styleguide markup file: ", err);
            } else {
                console.log("Styleguide index.html written to: ", STYLEGUIDE_INDEX_PATH);
            }
        });
    });
}
function writeStyleguideCSS(css) {
    fs.writeFile(STYLEGUIDE_CSS_PATH, css, 'utf8', function(err) {
        if(err) {
            console.log("Issue writing the styleguide "+STYLEGUIDE_CSS_PATH+" file: ", err);
        } else {
            console.log("Styleguide "+STYLEGUIDE_CSS_PATH+ " written to: ", STYLEGUIDE_CSS_PATH);
        }
    });
}
/**
 * Creates initial boiler-plate files by copying over template files
 * @param {String} styleguideDir path to styleguide directory
 * @param {Function} fn callback function
 */
function createFiles(styleguideDir, fn) {
    console.log('--- Writing Boiler-Plate Files ---');
    var tpl = styleguideDir + '/index.tpl';
    console.log("INDEX Path: " + STYLEGUIDE_INDEX_PATH);
    var destPath = STYLEGUIDE_INDEX_PATH;
    fs.createReadStream(tpl).pipe(fs.createWriteStream(destPath));
    destPath = STYLEGUIDE_CSS_PATH;
    fs.writeFile(destPath, '', function(err) {
        if(err) {
            console.log('Issue creating '+destPath+': ', err);
            fn(false);
        } else {
            console.log("Styleguide CSS file created at: ", destPath);
            fn(true);
        }
    });
}

function getISODateString(d){
    function pad(n) {
        return n<10 ? '0'+n : n;
    }
    return d.getUTCFullYear()+'-'+
        pad(d.getUTCMonth()+1)+'-'+
        pad(d.getUTCDate())+'T'+
        pad(d.getUTCHours())+':'+
        pad(d.getUTCMinutes())+':'+
        pad(d.getUTCSeconds())+'Z';
}
/**
 * Locates all <module> subdirs for processing and realizes `numDirsToProcess`
 * @param {String} modulesDir path to modules dir
 * @param {Function} fnParseModule callback function
 */
function readModules(modulesDir, fnParseModule) {
    var i, currentFile, stats,
        dirs = [],
        files = fs.readdirSync(modulesDir);

    for (i in files) {
        currentFile = modulesDir + path.sep + files[i];
        stats = fs.statSync(currentFile);
        if (stats.isDirectory()) {
            dirs.push(currentFile);
        }
    }
    i = null;
    numDirsToProcess = dirs.length;

    // Process each subdir in dirs
    for (i in files) {
        i = parseInt(i, 10);//it's a string :(
        currentFile = modulesDir + path.sep + files[i];
        stats = fs.statSync(currentFile);
        if (stats.isDirectory()) {
            fnParseModule(currentFile);
        }
    }
}
/**
 * Compiles Sass via `compass compile [options]` system command
 * @param {String} modulePath path to a particular module
 * @param {Function} fn callback function
 */
function compassCompile(modulePath, fn) {
    console.log("compassCompile entered..modulePath: " + modulePath);
    var module = getFilename(modulePath);
    var sassDir = modulePath+'/scss';
    var cssDir = modulePath+'/css';
    var outputStyle = 'nested';
    var options = ' --sass-dir '+sassDir+' --css-dir '+cssDir+' --force --output-style '+outputStyle;
    var cmd = 'compass compile' + options;
    var child = exec(cmd, function (err, stdout, stderr) {
        var cssPath = path.resolve(cssDir + '/'+module+'.css');
        if (err) {
            console.log(err);
            fn(new Error('Issue compass compiling '+module+'.css'));
        } else {
            console.log('looks like compass compile worked...reading back '+module+'.css...');
            fs.readFile(cssPath, 'utf8', function (err, data) {
                if (err) {
                    console.log(err);
                    fn(new Error('Issue reading back '+module+'.css'));
                }
                fn(data);
            });
        }
    });
}

/**
 * Scrapes <module> <type> markup out of that module's corresponding
 * index.dev.html file. Does so based on pragma comments like:
 * <pre>
 * <!-- UNI:TYPE -->
 * </pre>
 * @param {String} modulePath Path to the module's root directory
 * @param {Array} types Types specified in the module's _options partial
 * @param {Function} fn Callback function
 */
function scrapeModuleTypes(modulePath, types, fn) {
    var moduleTypes = [],
        moduleTypesMarkup = '',
        filedata = '',
        remaining = '',
        isScraping = false,
        input;

    // generic is a placeholder for a type that we want included but doesn't
    // really belong in the $uni-<module>-types of user's _options partial
    types.push('generic');
    types = _.uniq(types);
    input = fs.createReadStream(modulePath+'/'+MODULE_INDEX_FILENAME);

    // Looks for pragma comments e.g. UNI:TYPE, and, if finds,
    // starts scraping up to that section's tag close
    function processLine(line) {
        //console.log("processLine: " + line);
        if (isScraping) {
            moduleTypesMarkup += line + '\n';
        }
        if (line.indexOf(TYPE_PRAGMA_START) > -1) {

            // we read in the <type> off UNI:TYPE:<type> to see if it's in
            // our "white list" of types from user's _options.scss. Only if
            // that's true do we scrape in the type's markup.
            var currentType = line.split(TYPE_PRAGMA_START)[1].split(' ')[0];
            _.each(types, function(t) {
                // console.log('t: |' + t +'|');
                // console.log('currentType: |' + currentType + "|");
                // remove the wrapping quotes
                t = t.replace(/[\'\"]/g, '');
                
                if (t === currentType) {
                    console.log("IS SCRAPING TRUE!");
                    isScraping = true;
                }
            });
        }
        else if (line.indexOf(TYPE_PRAGMA_END) > -1) {
            isScraping = false;
        }
    }
    input.on('data', function(data) {
        remaining += data;
        var index = remaining.indexOf('\n');
        var last  = 0;
        // Read data line by line
        while (index > -1) {
            var line = remaining.substring(last, index);
            last = index + 1;
            processLine(line);
            index = remaining.indexOf('\n', last);
        }
        remaining = remaining.substring(last);
    });
    input.on('end', function() {
        fn(moduleTypesMarkup);
    });
}

/**
 * MAIN
 * 1. creates boiler-plate files
 * 2. reads module's in
 * 3. compiles each module's scss
 * 4. scrapes each module's index page for <type> markup sections
 * 5. writes out styleguide markup and css
 */
function main() {

    // Start our pipeline by first creating boiler-plate files
    createFiles(styleguideDir, function(success) {
        var styleguideSections = {},
            styleguideMarkup = [],
            cssCompilations = [],
            count = 0;

        // Gets called once all modules have been processed
        function finished() {
            // Join all module/types markup and place in to our styleguide/index.html
            console.log("****************** In createFiles --> finished....");
            var markup = _.values(styleguideSections).join('\n');
            var modulesArray = _.keys(styleguideSections);



console.log("\n\n\n\n******** modulesArray *******\n");
console.log(modulesArray);

            // var markup = styleguideMarkup.join('\n');
            writeStyleguideHtml(markup, modulesArray);
            var styles = cssCompilations.join('\n');
            writeStyleguideCSS(styles);
        }

        if (success) {
            // Scrape our modules subdirs
            readModules(modulesDir, function parseModuleCallback (path) {
                var moduleName = getFilename(path),
                    types = [],
                    _options;

                // Read in the uni-<module>-types so we can determine which
                // markup to include in the styleguide for this module
                _options = fs.readFileSync(path+OPTIONS_PARTIAL_PATH).toString();
                _options.split('\n').forEach(function(part) {
                    if(part.search(/\$uni.*\-type/) === 0) { 
                        types = part.split(':')[1].trim().split(' ');
                        console.log('TYPES: ' + types);
                        console.log(_.isArray(types));
                    }
                });

                // Compile SCSS
                compassCompile(path, function(compiledCss) {
                    //console.log("Compiled css: " + compiledCss);
                    cssCompilations.push(compiledCss);

                    scrapeModuleTypes(path, types, function(moduleTypesMarkup) {
                        // Place a header h1 and append header w/timestamp
                        moduleTypesMarkup = '\n\t<'+MODULE_TITLE_TAG+'>'+moduleName+'</'+MODULE_TITLE_TAG+'>\n' + moduleTypesMarkup;
                        moduleTypesMarkup = '\n\n<!-- '+MODULE_LBL+' '+moduleName+' -- ' + getISODateString(new Date()) + ' -->\n\n' + moduleTypesMarkup;
                        styleguideSections[moduleName] = moduleTypesMarkup;
                        ++count;
                        // Once all modules processed it's time for finito
                        if (count === numDirsToProcess) {
                            finished();
                        }
                    });
                });
            });
        }
    });
}
main();

/*
function readColorFile(name, modulesDir, destPath, islast, func) {
    // Clear out our global filedata var
    filedata = '';
    var input = fs.createReadStream(modulesDir);
    var remaining = '';

    input.on('data', function(data) {
        remaining += data;
        var index = remaining.indexOf('\n');
        var last  = 0;
        // Read data line by line
        while (index > -1) {
            var line = remaining.substring(last, index);
            last = index + 1;
            func(name, line);
            index = remaining.indexOf('\n', last);
        }
        remaining = remaining.substring(last);
    });
    input.on('end', function() {
        func(name, remaining);
        var str = JSON.stringify(colors);
        // This will write out our temp JSON file at colors.json
        fs.writeFile(destPath, str, function(err) {
            if(err) {
                console.log(err);
            }
            if (islast) {
                // This will finally write out the colors.js file
                writeColorsAsJavascript(colorsDest, colorsJSDest);
            }
        });
    });
}


*/

function getExtension(filename) {
    var ext = path.extname(filename||'').split('.');
    return ext[ext.length - 1];
}

function getFilename(filename, ext) {
    return path.basename(filename, ext);
}


