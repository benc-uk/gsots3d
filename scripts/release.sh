#!/bin/bash

set -e

TYPE=${1:-minor}

# Check if there are any uncommitted changes
if [[ $(git status -s) ]]; then
  echo "### 🚨 Please commit all changes before releasing a new version"
  exit 1
fi

echo "### 🎈 Releasing new $TYPE version"
echo "### 🔨 Building browser ESM bundle"

npm run build-bundle
git add dist-bundle
git commit -m "📦 Build browser ESM bundle for release"

npm version "$TYPE"
tag=$(git tag --points-at HEAD)

echo "### 🚀 Released version is ${tag}"
git push origin "$tag"