FROM gitpod/workspace-full:latest

RUN bash -c ". .nvm/nvm.sh && nvm install 12.4 && nvm use 12.4 && nvm alias default 14.08"
RUN echo "nvm use default &>/dev/null" >> ~/.bashrc.d/51-nvm-fix
RUN npm i -g firebase-tools