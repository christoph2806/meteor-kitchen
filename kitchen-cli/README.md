# Meteor Kitchen CLI

## Compile

### Ubuntu linux

Prerequisites:

```
apt-get install -y build-essential libgit2-dev cmake
```

Compile:

```
make -f linux.mk clean
make -f linux.mk
```

You will find binary in `/bin/` directory.


**Having troubles?**

If you are having troubles with compiling on your local machine, then you can compile using docker:

Navigate to parent of this directory (directory which contains `cppweb`, `kitchen-cli` and `kitchen-docs` subdirectories) and from there invoke:

```
docker build -t kitchen-cli-build -f ./kitchen-cli/docker/linux/Dockerfile .
```

That will create container with compiled binaries.

Run the container:

```
docker run -d --name kitchen-cli-build kitchen-cli-build
```

And attach to it:

```
docker exec -it kitchen-cli-build /bin/bash
```

You will find binaries inside container in `/root/meteor-kitchen/kitchen-cli/bin/` and `/root/meteor-kitchen/kitchen-docs/Release/`


### Mac OSX

To be written...


### Windows

To be writtem...

