FROM ubuntu:18.04

RUN apt-get update --fix-missing -y
RUN apt-get install -y curl nano git build-essential libgit2-dev cmake sudo

RUN mkdir /root/meteor-kitchen/
RUN mkdir /root/meteor-kitchen/cppweb/
RUN mkdir /root/meteor-kitchen/kitchen-cli/

WORKDIR /root/meteor-kitchen/

COPY ./libgit2/ /root/meteor-kitchen/libgit2/
COPY ./cppweb/ /root/meteor-kitchen/cppweb/
COPY ./kitchen-cli/ /root/meteor-kitchen/kitchen-cli/
COPY ./kitchen-docs/ /root/meteor-kitchen/kitchen-docs/


#WORKDIR /root/meteor-kitchen/libgit2/
#RUN /root/meteor-kitchen/libgit2/build.sh


WORKDIR /root/meteor-kitchen/kitchen-cli/
RUN make -f linux.mk clean
RUN make -f linux.mk


WORKDIR /root/meteor-kitchen/kitchen-docs/
RUN make -f linux.mk clean
RUN make -f linux.mk


ENTRYPOINT ["tail"]
CMD ["-f","/dev/null"]
