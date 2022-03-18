#FROM openjdk:8-jdk-alpine as production-stage
FROM openjdk:17-jdk-slim-buster as production-stage
#RUN addgroup -S explorer && adduser -S explorer -G explorer
#USER explorer:explorer
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} app.jar
ENTRYPOINT ["java","-jar","/app.jar"]
