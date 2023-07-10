#!/bin/bash
set -e

VERSION_TYPE=${1:-patch}

# Prompt user for confirmation
read -p "### 🚀 Releasing new version. Are you sure? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  exit 1
fi

# Check if the current branch is master
if [[ $(git branch --show-current) != "main" ]]; then
  echo "### 🚨 Please checkout the main branch before releasing a new version"
  exit 1
fi

# Check if there are any uncommitted changes
if [[ $(git status -s) ]]; then
  echo "### 🚨 Please commit all changes before releasing a new version"
  exit 1
fi

# We do things this way so dist-bundle is in the repo, BEFORE we create a new tag

TAG=$(npm version "$VERSION_TYPE" --no-git-tag-version)

echo "### 🎈 Releasing new version ${TAG}"
echo "### 🔨 Building browser ESM bundle"

npm run build-bundle
git add dist-bundle package.json package-lock.json
git commit -m "📦 Build browser ESM bundle for release"

git tag "$TAG"
git push origin "$TAG"