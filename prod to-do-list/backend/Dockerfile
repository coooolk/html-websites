# In backend/Dockerfile

# Use an official Node.js runtime as a parent image
FROM node:alpine

# Declaring env
ENV NODE_ENV development

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY . .

# Install dependencies
RUN npm install

# Start the application
CMD ["node", "app.js"]

# Expose port 3000 (or the port your Express app uses)
EXPOSE 3000
