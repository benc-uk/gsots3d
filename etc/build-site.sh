#!/bin/bash
set -e

npm run docs

rm -rf ./site
mkdir -p ./site

cp -r ./docs ./site
cp -r ./examples ./site
cp -r ./dist-bundle ./site

cp -r ./etc/site/* ./site
showdown makehtml -i readme.md -o site/index.html --flavor github --append
echo "</article></body></html>" >> site/index.html

# replace 'etc/site/icon.png' with 'icon.png'
sed -i -e 's/etc\/site\/icon.png/icon.png/g' site/index.html
