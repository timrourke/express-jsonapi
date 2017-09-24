FROM node:boron

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
COPY Gulpfile.js /usr/src/app/
COPY tsconfig.json /usr/src/app/
COPY typings.json /usr/src/app/
COPY . /usr/src/app/
RUN yarn
RUN node_modules/.bin/typings install
RUN node_modules/.bin/gulp

# Prepare MySQL config
COPY src/config/database.json /usr/src/app/dist/config/database.json
COPY wait-for-it/wait-for-it.sh /usr/src/app/

# Expose the web port
EXPOSE 3000
