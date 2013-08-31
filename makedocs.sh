#!/bin/bash
echo "Generating docs..."
awk '{if (NR!=1) {print}}' ./uni-generate-styleguide.js > ./uni-generate-styleguide-tmp.js
./node_modules/jsdoc/jsdoc -c jsdoc_config.json  ./uni-generate-styleguide-tmp.js
rm ./uni-generate-styleguide-tmp.js
open ./docs/index.html