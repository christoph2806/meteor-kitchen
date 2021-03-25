#!/bin/sh

set -e
set -u

DEST_DIR=$1
DEST_TARBALL=$2
APP_NAME=$3

cd "$DEST_DIR"
tar -zxf "$DEST_TARBALL"
cd "./bundle/programs/server/"
npm install
systemctl restart meteor-kitchen
