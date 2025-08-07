FROM node:18

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
EXPOSE 3000 3001 4000 4001 4002 4003 4004 4005

CMD ["npm", "run", "start"]