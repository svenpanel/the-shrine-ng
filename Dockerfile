FROM node:latest
# Create app directory
RUN mkdir -p /app
WORKDIR /app
# Install app dependencies
COPY package.json /app   
COPY yarn.lock /app
# Install dependencies
RUN yarn install
# Copy files & Run build
COPY . /app
RUN yarn build
# Clear the cache
RUN yarn cache clean
# Expose the app port
EXPOSE 3000
# start command when container init
CMD [ "yarn", "start" ]
