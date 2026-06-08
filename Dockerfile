FROM node:20-alpine

WORKDIR /app

# Install system dependencies required by Prisma
RUN apk add --no-cache openssl libc6-compat

# Install npm dependencies
COPY package*.json ./
RUN npm install

# Copy remaining project files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose application port
EXPOSE 8000

# Start application
CMD ["sh", "-c", "npx prisma migrate deploy && npm run dev"]
