#!/bin/bash
echo "Generating docs..."
awk '{if (NR!=1) {print}}' ./uni-generate-styleguide.js > ./tmp.js 
./node_modules/jsdoc/jsdoc -c jsdoc_config.json  ./tmp.js
rm ./tmp.js
open ./docs/index.html