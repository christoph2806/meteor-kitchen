#!/bin/sh

set -e

cd ../../

cd kitchen-cli
make -f linux.mk clean
make -f linux.mk

cd ..

cd kitchen-docs
make -f linux.mk clean
make -f linux.mk

cd ..

cd kitchen-cli/install
./bundle_linux.sh

cd ../../../
./meteor-kitchen/kitchen-cli/install/create-examples.sh

