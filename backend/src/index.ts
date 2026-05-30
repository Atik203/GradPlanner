import express, { Request, Response } from "express";
import { prisma } from "./lib/prisma.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get("/api/health", async (req: Request, res: Response) => {
  try {
    await prisma.user.findFirst();
    res.json({ status: "OK", database: "Connected" });
  } catch (error) {
    res.status(500).json({ status: "Error", message: (error as Error).message });
  }
});

// Get Users Endpoint
app.get("/api/users", async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: { posts: true },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ status: "Error", message: (error as Error).message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
