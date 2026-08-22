# ==============================
# Stage 1: Build
# ==============================
FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copy Maven configuration first
COPY pom.xml .

# Download dependencies
RUN mvn dependency:go-offline -B

# Copy source code
COPY src ./src

# Build Spring Boot application
RUN mvn clean package -DskipTests


# ==============================
# Stage 2: Run
# ==============================
FROM eclipse-temurin:17-jre

WORKDIR /app

# Copy the generated JAR from build stage
COPY --from=build /app/target/online-shopping-cart-1.0.0.jar app.jar

# Render provides PORT dynamically
EXPOSE 8080

# Start Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]