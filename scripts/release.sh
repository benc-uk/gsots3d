#!/bin/bash

set -e

TYPE=${1:-minor}

echo "Releasing new $TYPE version"

npm version "$TYPE"
tag=$(git tag --points-at HEAD)
git push origin "$tag"