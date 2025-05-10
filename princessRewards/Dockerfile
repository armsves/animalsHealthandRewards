# Use the official Node.js image
FROM node:slim

# Set the working directory inside the container
WORKDIR /princessRewards

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Set the environment variable for production
ENV NODE_ENV=production

# Command to run the script
CMD ["npx", "tsx", "script.ts"]