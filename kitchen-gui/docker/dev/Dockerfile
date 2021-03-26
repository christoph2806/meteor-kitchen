FROM ubuntu:18.04

EXPOSE 3000

RUN apt-get update --fix-missing -y
RUN apt-get install -y curl nano git build-essential sudo

ENV USERNAME=kitchen

RUN useradd --create-home --shell /bin/bash ${USERNAME}
RUN echo "${USERNAME} ALL=(ALL) NOPASSWD: ALL" >> /etc/sudoers

###
# install nodejs
###

ENV NODE_VERSION=12.21.0
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash

ENV NVM_DIR=/root/.nvm
RUN . "$NVM_DIR/nvm.sh" && nvm install ${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm use v${NODE_VERSION}
RUN . "$NVM_DIR/nvm.sh" && nvm alias default v${NODE_VERSION}
ENV PATH="/root/.nvm/versions/node/v${NODE_VERSION}/bin/:${PATH}"
RUN node --version
RUN npm --version


###
# copy app
###

RUN mkdir /home/${USERNAME}/kitchen-gui/

WORKDIR /home/${USERNAME}/kitchen-gui/

COPY ./ ./

RUN chown ${USERNAME} -R ./
RUN chmod +x ./*.sh

RUN ls -l

###
# install meteor
###

USER ${USERNAME}

RUN curl "https://install.meteor.com/?release=1.8" | sh

###
# run app
###

ENTRYPOINT ./docker_dev_entrypoint.sh
