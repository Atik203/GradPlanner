"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../lib/prisma");
async function main() {
    console.log("Seeding database...");
    // Clean database
    await prisma_1.prisma.post.deleteMany();
    await prisma_1.prisma.user.deleteMany();
    // Create users and posts
    const user1 = await prisma_1.prisma.user.create({
        data: {
            email: "alice@prisma.io",
            name: "Alice",
            posts: {
                create: [
                    {
                        title: "Hello World",
                        content: "Welcome to my first post!",
                        published: true,
                    },
                    {
                        title: "Prisma Postgres is awesome",
                        content: "It scales to zero and setup is very simple.",
                        published: true,
                    },
                ],
            },
        },
    });
    const user2 = await prisma_1.prisma.user.create({
        data: {
            email: "bob@prisma.io",
            name: "Bob",
            posts: {
                create: [
                    {
                        title: "Vibe coding with Antigravity",
                        content: "Setting up frontend, backend and database dynamically.",
                        published: true,
                    },
                ],
            },
        },
    });
    console.log(`Seeding finished. Created users: ${user1.name}, ${user2.name}`);
}
main()
    .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
})
    .finally(async () => {
    await prisma_1.prisma.$disconnect();
});
