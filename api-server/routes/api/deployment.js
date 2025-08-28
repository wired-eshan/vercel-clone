const express = require('express');
const router = express.Router();
const { PrismaClient } = require('../../generated/prisma');

const { authMiddleware } = require('../../middlewares/auth');

const prisma = new PrismaClient();
router.use(authMiddleware);

router.get('/', authMiddleware, async (req, res) => {
    const deployments = await prisma.deployment.findMany({
        where: {
            project: {
                userId: req.user.userId
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    res.json({ status: 'success', data: { deployments } });
});

router.get('/:deploymentId', authMiddleware, async (req, res) => {
    const { deploymentId } = req.params;

    //#TODO: fetch logs from clickhouse given deploymentId
});

module.exports = router;
