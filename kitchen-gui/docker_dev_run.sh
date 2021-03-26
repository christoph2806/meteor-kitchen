#!/bin/sh

set -e
set -u

docker run -d -p 0.0.0.0:3000:3000 --restart=always --name kitchen-gui-dev kitchen-gui-dev
