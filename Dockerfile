FROM node:boron

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
COPY Gulpfile.js /usr/src/app/
RUN yarn
RUN node_modules/.bin/gulp

# Bundle app source
COPY . /usr/src/app

# Expose the web port
EXPOSE 3000

# Run the app
CMD ["npm", "start"]
