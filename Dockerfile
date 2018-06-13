FROM node:9.10-alpine
WORKDIR /workspace
RUN apk update --no-cache \
    && apk add git curl bash
COPY package.json package-lock.json /workspace/
RUN npm install
COPY . /workspace
RUN npm run build
CMD npm start
