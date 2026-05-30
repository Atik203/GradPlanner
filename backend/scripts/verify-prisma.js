"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_js_1 = require("../lib/prisma.js");
async function verify() {
    try {
        await prisma_js_1.prisma.user.findFirst();
        console.log("✅ Connected");
    }
    catch (error) {
        console.error("❌ Connection failed!");
        console.error(error);
        process.exit(1);
    }
    finally {
        await prisma_js_1.prisma.$disconnect();
    }
}
verify();
