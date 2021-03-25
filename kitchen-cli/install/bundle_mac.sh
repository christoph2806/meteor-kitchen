#!/bin/sh
rm install_mac.tar.gz
tar -cvzf install_mac.tar.gz -C ../ bin/meteor-kitchen examples node_modules plugins templates
