# Styleguide Generator for Unicorn

Generates a Styleguide from either:

* a parent directory containing one to many Unicorn Modules, or,
* a directory with just one Unicorn Module

These two main use cases can be achieved as follows:

1. Generate styleguide for modules placed within a parent directory. For this use the -M:
```bash
./uni-generate-styleguide.js -M ./test_modules
```

__This might be useful if you've downloaded several Unicorn Modules for which you'd like to generate a single styleguide.__

2. Generate a styleguide for a single Unicorn module. For this use the -m option:
```bash
./uni-generate-styleguide.js -m ./test_modules/panels
```

__This is used primarily by Unicorn's Backend (server) to generate a styleguide when a user clicks the 'Download' button for a particular Unicorn Module.__

-----------------------

### Usage

*NOTE: This requires your module to use the new `uni-<module>-type` namespacing to declare your types in `scss/partials/_options.scss` file (e.g. `$uni-buttons-types`)*

The usage printed by help best explains how to run:

```bash
./uni-generate-styleguide.js -h

  Usage: uni-generate-styleguide.js [options]

  Options:

    -h, --help                           output usage information
    -V, --version                        output the version number
    -m, --module-dir [directory]         Path to module directory to generate styleguide for
    -M, --parent-module-dir [directory]  Path to parent directory from which direct sub-directories are considered modules to include when generating the styleguide. If both -m and -M supplied, only the later will be considered and -m will be ignored.
    -l, --logo-url [url]                 URL to your company or project logo
    -n, --name [name]                    Company or project name. Will be used in title of generated styleguide
```
-------

### JSDoc

Unfortunately, it seems that jsdoc disallows shebang '#' character at top of our main script. So I've created a script to allow generating docs easily. Just run:

```bash
./makedocs.sh
```

