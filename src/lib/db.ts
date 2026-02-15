// Prisma client - will be available after running: npx prisma generate
// For now, export a mock to prevent errors during development
export const prisma = {
  user: {
    findUnique: async () => null,
    findMany: async () => [],
    create: async () => null,
    update: async () => null,
    delete: async () => null,
  },
  subscription: {
    findUnique: async () => null,
    findMany: async () => [],
    create: async () => null,
    update: async () => null,
    upsert: async () => null,
  },
  organization: {
    findUnique: async () => null,
    findMany: async () => [],
    create: async () => null,
    update: async () => null,
    upsert: async () => null,
  },
  account: {
    findUnique: async () => null,
    create: async () => null,
  },
  session: {
    findUnique: async () => null,
    create: async () => null,
    delete: async () => null,
  },
} as any;
