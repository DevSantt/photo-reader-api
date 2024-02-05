FROM node:latest

WORKDIR /app

COPY . .

RUN npm install

CMD ["npm", "start" ]

EXPOSE 3001