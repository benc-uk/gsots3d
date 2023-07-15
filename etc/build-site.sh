#!/bin/bash

npm run docs

rm -rf ./site
mkdir -p ./site
cp -r ./etc/site/* ./site
showdown makehtml -i readme.md -o site/index.html --flavor github --append
echo "</article></body></html>" >> site/index.html

cp -r ./docs ./site
cp -r ./examples ./site
cp -r ./dist-bundle ./site