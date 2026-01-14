import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "./models/User.js";
import { Progress } from "./models/Progress.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;
const jwtSecret = process.env.JWT_SECRET;

app.use(express.json());
app.use(cookieParser());

if (!jwtSecret) {
  console.error("Missing JWT_SECRET");
  process.exit(1);
}

const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
  console.error("Missing MONGODB_URI");
  process.exit(1);
}

mongoose.connect(mongoUri).then(() => {
  console.log("MongoDB connected");
}).catch((error) => {
  console.error("MongoDB connection error", error);
  process.exit(1);
});

const COOKIE_NAME = "cubingo_session";
const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 1000 * 60 * 60 * 24 * 7
};

function signToken(userId) {
  return jwt.sign({ sub: userId }, jwtSecret, { expiresIn: "7d" });
}

function authMiddleware(req, res, next) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: "unauthorized" });
  }
  try {
    const payload = jwt.verify(token, jwtSecret);
    req.userId = payload.sub;
    return next();
  } catch (error) {
    return res.status(401).json({ error: "unauthorized" });
  }
}

app.post("/auth/register", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password required" });
  }

  const existing = await User.findOne({ email }).lean();
  if (existing) {
    return res.status(409).json({ error: "email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ email, passwordHash });
  const token = signToken(user._id.toString());

  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
  return res.json({ ok: true });
});

app.post("/auth/login", async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "email and password required" });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: "invalid credentials" });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).json({ error: "invalid credentials" });
  }

  const token = signToken(user._id.toString());
  res.cookie(COOKIE_NAME, token, COOKIE_OPTIONS);
  return res.json({ ok: true });
});

app.post("/auth/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, COOKIE_OPTIONS);
  res.json({ ok: true });
});

app.get("/me", authMiddleware, async (req, res) => {
  const user = await User.findById(req.userId).lean();
  if (!user) {
    return res.status(404).json({ error: "user not found" });
  }
  const progress = await Progress.findOne({ userId: user._id }).lean();
  return res.json({
    user: { id: user._id.toString(), email: user.email },
    progress: progress ? progress.data : null
  });
});

app.put("/progress", authMiddleware, async (req, res) => {
  const { data } = req.body || {};
  if (!data || typeof data !== "object") {
    return res.status(400).json({ error: "progress data required" });
  }

  await Progress.findOneAndUpdate(
    { userId: req.userId },
    { data, updatedAt: new Date() },
    { upsert: true }
  );

  return res.json({ ok: true });
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
