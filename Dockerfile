FROM node:20

WORKDIR /app

# Copy package info + prisma schema (for postinstall to work)
COPY package*.json ./
COPY prisma ./prisma


# Install deps (includes prisma generate via postinstall)
RUN npm install

# Copy entire monorepo (apps, libs, packages)
COPY . .

# Optional: re-run prisma generate explicitly if needed
# RUN npx prisma generate --schema=./prisma/schema.prisma

CMD ["npm", "run", "start"]
