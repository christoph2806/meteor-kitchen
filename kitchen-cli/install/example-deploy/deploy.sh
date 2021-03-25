#!/bin/sh

set -e
set -u

USER=root
HOST=88.198.199.62
ARCHITECTURE=os.linux.x86_64
APP_NAME=$1

BUILD_DIR="./.build/"
SOURCE_TARBALL="${PWD##*/}.tar.gz"
DEST_TARBALL="$APP_NAME.tar.gz"
DEST_DIR="/opt/$APP_NAME/"

meteor build $BUILD_DIR --architecture $ARCHITECTURE --server-only

ssh -p 22 $USER@$HOST "mkdir -p $DEST_DIR"
scp -P 22 "$BUILD_DIR$SOURCE_TARBALL" "$USER@$HOST:$DEST_DIR$DEST_TARBALL"
ssh -p 22 $USER@$HOST "bash -s" < "./deploy_remote.sh" $DEST_DIR $DEST_TARBALL $APP_NAME
