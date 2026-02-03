FROM node:alpine
WORKDIR /
EXPOSE 3000
COPY ./build ./dist
COPY ./package.json ./package-lock.json ./
RUN npm i --omit=dev
CMD ["npm", "start"]