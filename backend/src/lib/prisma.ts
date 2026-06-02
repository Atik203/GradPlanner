import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

function createPrismaClient() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,                          // maximum connection pool size
    idleTimeoutMillis: 30000,         // close idle clients after 30 seconds
    connectionTimeoutMillis: 5000,    // wait up to 5 seconds before timing out when connecting
    keepAlive: true,                  // enable TCP keepalive to prevent proxies from dropping idle sockets
  });

  // Handle unexpected errors on idle pool clients to prevent Node process crash
  pool.on("error", (err) => {
    console.error("Unexpected idle client error in PostgreSQL Pool:", err);
  });

  const adapter = new PrismaPg(pool);
  const client = new PrismaClient({ adapter });

  // Wrap query operations in a retry handler to recover from remote database disconnects gracefully
  return client.$extends({
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          let retries = 3;
          let delay = 500;
          while (true) {
            try {
              return await query(args);
            } catch (error: any) {
              retries--;

              // Detect connection-related errors
              const isConnectionError =
                error?.code === "P1017" ||
                error?.message?.includes("ConnectionClosed") ||
                error?.message?.includes("Connection terminated unexpectedly") ||
                error?.message?.includes("ECONNRESET") ||
                error?.message?.includes("closed") ||
                error?.message?.includes("socket") ||
                error?.message?.includes("connect") ||
                error?.code === "P2024";

              if (isConnectionError && retries > 0) {
                console.warn(
                  `Prisma connection error (${error?.code || "NoCode"}) on model ${model} during ${operation}. Retrying in ${delay}ms... (${retries} attempts left)`
                );
                await new Promise((resolve) => setTimeout(resolve, delay));
                delay *= 2; // exponential backoff
              } else {
                throw error;
              }
            }
          }
        },
      },
    },
  });
}

type ExtendedPrismaClient = ReturnType<typeof createPrismaClient>;

const globalForPrisma = globalThis as unknown as {
  prisma: ExtendedPrismaClient | undefined;
};

let prisma: ExtendedPrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = createPrismaClient();
} else {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  prisma = globalForPrisma.prisma;
}

export { prisma };
