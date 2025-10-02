const express = require("express");
const router = express.Router();
const { PrismaClient } = require("../../generated/prisma");
const { z, email } = require("zod");
const bcrypt = require("bcryptjs");
const { authMiddleware } = require("../../middlewares/auth");

const prisma = new PrismaClient();

router.post("/signup", async (req, res) => {
  console.log("Signup request received", req.body);
  const schema = z.object({
    email: z.email(),
    password: z.string().min(6),
  });

  const validation = schema.safeParse(req.body);
  if (!validation.success) {
    console.log("Validation failed:", validation);
    return res.status(400).json({ error: validation.error.message });
  }

  const { email, password } = validation.data;

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ error: "Email already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  console.log("Hashed password:", hashedPassword);
  console.log("Creating user with email:", email);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  res
    .status(201)
    .json({ status: "success", data: { userId: user.id, email: user.email } });
});

router.delete("/:userId", authMiddleware, async (req, res) => {
  const { userId } = req.params;

  try {
    const response = await prisma.user.delete({
      where: {
        id: userId,
      },
    });
    res.json(response);
  } catch (error) {
    console.log("Error deleting user profile: ", error);
    res.status(500).json(error);
  }
});

module.exports = router;
