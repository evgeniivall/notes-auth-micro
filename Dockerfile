# Step 1: Use an official Node.js runtime as the base image
FROM node:18

# Step 2: Set the working directory in the container
WORKDIR /usr/src/app

# Step 3: Copy package.json and package-lock.json to install dependencies
COPY package*.json ./

# Step 4: Install dependencies
RUN npm install --production

# Step 5: Copy the rest of the application source code
COPY . .

# Step 6: Expose the port the service will run on
EXPOSE 3000

# Step 7: Start the service
CMD [ "npm", "start" ]
