#!/bin/sh

set -e

cd ../../

cd kitchen-cli
make -f mac.mk clean
make -f mac.mk

cd ..

cd kitchen-docs
make -f mac.mk clean
make -f mac.mk

cd ..

cd kitchen-cli/install
./bundle_mac.sh

cd ../../../
./meteor-kitchen/kitchen-cli/install/create-examples.sh
