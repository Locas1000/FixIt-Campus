FROM node:20-alpine

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the React code
COPY . .

# Expose Vite's default development port
EXPOSE 5173

# Start the Vite development server and expose it to the Docker network
CMD ["npm", "run", "dev", "--", "--host"]


