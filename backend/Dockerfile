FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the backend code
COPY . .

# Expose the API port
EXPOSE 5000

# Start the server using nodemon for hot-reloading
CMD ["npx", "nodemon", "index.js"]
