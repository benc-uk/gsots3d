#!/bin/bash
set -e

#
# Script to release a new version of the package
# This is not the same as the builds done by CI
#

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

# Check if there are any changes in the remote branch
if [[ $(git rev-parse HEAD) != $(git rev-parse origin/main) ]]; then
  echo "### 🚨 Please pull the latest changes before releasing a new version"
  exit 1
fi

# We do things this way so dist-bundle is in the repo, BEFORE we create a new tag

TAG=$(npm version "$VERSION_TYPE" --no-git-tag-version)

echo "### 🎈 Releasing new version ${TAG}"
echo "### 🔨 Building browser ESM bundle"

npm run build-bundle
git add dist-bundle package.json package-lock.json
git commit -m "📦 Releasing new version ${TAG}"

git tag "$TAG" --force
git push origin main --tags