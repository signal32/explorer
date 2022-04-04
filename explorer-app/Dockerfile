FROM node:latest as build-stage
WORKDIR /app
COPY package*.json ./
COPY .env.production ./
#RUN npm install
COPY ./ .
#COPY ./node_modules ./node_modules
#RUN npm run build --prod
RUN npm run build


FROM nginx as production-stage
RUN mkdir /app
COPY --from=build-stage /app/dist /app
COPY nginx.conf /etc/nginx/nginx.conf
