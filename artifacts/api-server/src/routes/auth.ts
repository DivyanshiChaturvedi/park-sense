import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";

const router: IRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || "parksense-secret-key-2024";

router.post("/login", async (req, res) => {
  const { email, password, name } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "bad_request", message: "Email and password are required" });
    return;
  }

  let [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);

  if (!user) {
    const hash = await bcrypt.hash(password, 10);
    const [created] = await db.insert(usersTable).values({
      email,
      name: name || email.split("@")[0],
      passwordHash: hash,
      role: email === "admin@parksense.com" ? "admin" : "user",
    }).returning();
    user = created;
  } else {
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "unauthorized", message: "Invalid credentials" });
      return;
    }
  }

  const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    },
    token,
  });
});

router.get("/me", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "unauthorized", message: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(auth.slice(7), JWT_SECRET) as { userId: number };
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, decoded.userId)).limit(1);

    if (!user) {
      res.status(401).json({ error: "unauthorized", message: "User not found" });
      return;
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch {
    res.status(401).json({ error: "unauthorized", message: "Invalid token" });
  }
});

export default router;
