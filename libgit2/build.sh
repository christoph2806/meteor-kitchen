#!/bin/sh

set -e

rm -rf ./build || true
mkdir ./build
cd build
cmake .. -DBUILD_SHARED_LIBS=OFF -DBUILD_CLAR=OFF -DTHREADSAFE=ON -DUSE_SSH=OFF -DCMAKE_INSTALL_PREFIX=../output
cmake --build . --target install

