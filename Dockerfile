FROM node:20

WORKDIR /app

# Copy package info + prisma schema (for postinstall to work)
COPY package*.json ./
COPY prisma ./prisma


# Install deps (includes prisma generate via postinstall)
RUN npm install

# Copy entire monorepo (apps, libs, packages)
COPY . .

CMD ["npm", "run", "start"]
