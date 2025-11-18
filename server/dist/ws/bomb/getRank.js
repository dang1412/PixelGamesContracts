"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTopRanks = getTopRanks;
exports.getPlayerRoundHighScore = getPlayerRoundHighScore;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
async function getTopRanks(round) {
    const topPlayers = await prisma.gameScore.findMany({
        where: {
            round,
        },
        orderBy: {
            score: 'desc',
        },
        take: 5,
    });
    return topPlayers.map(p => ({
        gameId: p.gameId,
        playerId: p.playerId,
        score: p.score,
    }));
}
async function getPlayerRoundHighScore(client, round) {
    const highScore = await prisma.gameScore.findFirst({
        where: {
            round,
            game: {
                clients: {
                    some: {
                        client,
                    },
                },
            },
        },
        orderBy: {
            score: 'desc',
        },
        select: {
            gameId: true,
            score: true,
            updatedAt: true,
        },
    });
    if (!highScore) {
        return null;
    }
    return {
        gameId: highScore.gameId,
        score: highScore.score,
        ts: highScore.updatedAt.getTime(),
    };
}
