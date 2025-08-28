const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('../../generated/prisma');
const { z } = require('zod');
const { authMiddleware } = require('../../middlewares/auth');
const JWT_SECRET = process.env.JWT_SECRET || 'some-secret-key';

const prisma = new PrismaClient();

router.post('/login', async (req, res) => {
    console.log('Login request received', req.body);
    
    const schema = z.object({
        email: z.email(),
        password: z.string().min(6)
    });

    const validation = schema.safeParse(req.body);
    if (!validation.success) {
        return res.status(400).json({ error: validation.error });
    }

    const { email, password } = validation.data;

    const user = await prisma.user.findUnique({ where: { email } });

    console.log('User found:', user);
    console.log('bcrypt verification:', await bcrypt.compare(password, user.password));

    const passwordMatch = user && await bcrypt.compare(password, user.password);
    console.log('Password match:', passwordMatch);

    if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload = { 
        userId: user.id,
        email: user.email
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
    console.log('Generated token:', token);
    res.cookie('token', token);
    res.status(200).json({ status: 'success', data: { userId: user.id, email: user.email } });
});

router.post('/signup', async (req, res) => {
    console.log('Signup request received', req.body);
    const schema = z.object({
        email: z.email(),
        password: z.string().min(6)
    });

    const validation = schema.safeParse(req.body);
    if (!validation.success) {
        console.log('Validation failed:', validation);
        return res.status(400).json({ error: validation.error.message });
    }

    const { email, password } = validation.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed password:', hashedPassword);
    console.log('Creating user with email:', email);

    const user = await prisma.user.create({
        data: {
            email,
            password: hashedPassword
        }
    });

    res.status(201).json({ status: 'success', data: { userId: user.id, email: user.email } });
});

router.post('/logout', (req, res) => {
    console.log('Logout request received');
    res.clearCookie('token');
    res.status(200).json({ status: 'success', message: 'Logged out successfully ' });
});

router.get('/authenticate', authMiddleware, (req, res) => {
    console.log('Authentication successful for user:', req.user);
    res.status(200).json({ authenticated: true, user : req.user });
});

module.exports = router;
