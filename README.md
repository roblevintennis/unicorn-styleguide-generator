# Styleguide Generator for Unicorn

Allows you to create a modules directory with one to many Unicorn modules, and then generate a styleguide from that directory
-----------------------

### Usage

*NOTE: This requires your module to use the new `uni-<module>-type` namespacing to declare your types in `scss/partials/_options.scss` file (e.g. `$uni-buttons-types`)*

*   Create a "parent" directory for your modules and name as you like

*   Put the relative path (or absolute path if you prefer) as the value for `modulesDirName` at the top of the `uni-generate-styleguide.js` script. For example:

```bash
var modulesDirName = 'path/to/my/modules';
```

*   Add any Unicorn modules as subdirs (e.g. Buttons, Grids, etc.)

```bash
├── modules
│   ├── buttons
│   ├── grids
│   └── mymodule
```

*   Run `npm install` from styleguide generator root directory

*   Run `./uni-generate-styleguide.js`

*   `open styleguide/index.html`

-------

### JSDoc

Unfortunately (for now) .. comment out first line of uni-generate-styleguide.js:

```javascript
//#!/usr/bin/env node
```

Then run:

```bash
./node_modules/jsdoc/jsdoc ./uni-generate-styleguide.js
open out/index.html
```

//#!/usr/bin/env node

