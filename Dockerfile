FROM node:20.18.0-alpine

WORKDIR /var/www/skhillz-user-service

COPY package.json /

RUN rm -rf node_modules \
  && rm -rf package-lock.json \
  && npm install -g nodemon

COPY . .

EXPOSE 8801 4401

CMD ["npm", "start"]