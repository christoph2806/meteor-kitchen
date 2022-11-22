#!/bin/sh

# Install script for "Meteor Kitchen" - Meteor application code generator
# Copyright (c) 2016 Petar Korponaić <petar.korponaic@gmail.com>
#
# Are you looking at this in your web browser, and would like to install meteor-kitchen?
# If you are using Mac or Linux, just open up your terminal and type:
#
#     curl https://github.com/christoph2806/meteor-kitchen/raw/master/kitchen-cli/install/install.sh | /bin/sh
#
# If you are using Windows, visit www.meteorkitchen.com for installation instructions.

echo "Installing \"Meteor Kitchen\" - Meteor application code generator"

set -u

# HOME_URL="https://www.meteorkitchen.com"
HOME_URL="https://github.com/christoph2806/meteor-kitchen/raw/master/kitchen-cli"
UNAME=$(uname)
BUNDLE_FILENAME=""
TMP_DIR="/tmp"
DEST_DIR="$HOME/.meteor-kitchen"
LAUNCH_DIR="/usr/local"

echo "Detecting OS..."
if [ "$UNAME" != "Linux" ] ; then # -a "$UNAME" != "Darwin" ] ; then
	echo "Sorry, this OS is not supported yet."
	exit 1
fi

echo "Detected OS: $UNAME"

if [ "$UNAME" = "Darwin" ] ; then
	BUNDLE_FILENAME="install_mac.tar.gz"
else
	BUNDLE_FILENAME="install_linux.tar.gz"
fi
# https://github.com/christoph2806/meteor-kitchen/raw/master/kitchen-cli/install/install_linux.tar.gz
echo "Downloading distribution..."
curl --progress-bar --fail -L -o "$TMP_DIR/$BUNDLE_FILENAME" "$HOME_URL/install/$BUNDLE_FILENAME" || exit $?

if [ ! -d "$DEST_DIR" ] ; then
	echo "Creating destination directory..."
	mkdir "$DEST_DIR" || exit $?
fi

echo "Unpacking..."
tar -xzf "$TMP_DIR/$BUNDLE_FILENAME" -C "$DEST_DIR" -o || exit $?

echo "Cleaning up..."
rm "$TMP_DIR/$BUNDLE_FILENAME"

echo "Done."
echo
echo "\"Meteor kitchen\" is now installed in \"$DEST_DIR\"."
echo
echo "Creating symlink: ln -s $DEST_DIR/bin/meteor-kitchen $LAUNCH_DIR/bin/meteor-kitchen"

if [ ! -d "$LAUNCH_DIR" ] ; then
	mkdir -m 755 "$LAUNCH_DIR" 2> /dev/null || sudo mkdir -m 755 "$LAUNCH_DIR" || exit $?
fi

if [ ! -d "$LAUNCH_DIR/bin" ] ; then
	mkdir -m 755 "$LAUNCH_DIR/bin" 2> /dev/null || sudo mkdir -m 755 "$LAUNCH_DIR/bin" || exit $?
fi

ln -s -f "$DEST_DIR/bin/meteor-kitchen" "$LAUNCH_DIR/bin/meteor-kitchen" 2> /dev/null || sudo ln -s -f "$DEST_DIR/bin/meteor-kitchen" "$LAUNCH_DIR/bin/meteor-kitchen" || exit $?

echo "Done."
echo
echo "Now you can launch generator by typing:"
echo
echo "    meteor-kitchen"
echo
echo "For more info visit: www.meteorkitchen.com"
echo "Enjoy!"
