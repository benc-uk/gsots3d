#!/bin/bash
set -e

npm run docs

rm -rf ./site
mkdir -p ./site

cp -r ./docs ./site
cp -r ./examples ./site
cp -r ./dist-single ./site

cp -r ./etc/site/* ./site
showdown makehtml -i readme.md -o site/index.html --flavor github --append
echo "</article></body></html>" >> site/index.html
