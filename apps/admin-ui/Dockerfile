FROM node:22-alpine

WORKDIR /app

# Copy package info + lock file
COPY package*.json ./

# Copy prisma schema separately first to allow caching
COPY prisma ./prisma

# Install dependencies (postinstall will run prisma generate if defined)
RUN npm install

# Copy rest of the application
COPY . .

# Ensure Prisma client is generated
RUN npx prisma generate

# Optional: Expose port if needed (e.g., 3000)
EXPOSE 3000 3001 302 4000 4001 4002 4003 4004 4005 4006 4007 4008 4009 4010

CMD ["npm", "run", "start"]