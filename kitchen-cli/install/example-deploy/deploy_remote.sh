#!/bin/sh

set -e
set -u

DEST_DIR=$1
DEST_TARBALL=$2
APP_NAME=$3

cd "$DEST_DIR"
tar -zxf "$DEST_TARBALL"
cd "./bundle/programs/server/"
node -v
npm -v
npm install
service $APP_NAME restart

