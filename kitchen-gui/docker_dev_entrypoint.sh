#!/bin/sh

set -e
set -u

echo "meteor $(meteor --version)"
echo "meteor node $(meteor node --version)"

echo "Starting app..."
meteor npm install
meteor
