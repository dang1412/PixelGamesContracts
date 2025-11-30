"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleBombGameMsg = handleBombGameMsg;
const client_1 = require("@prisma/client");
const prisma_1 = require("../../lib/prisma");
const broadcaster_1 = require("../broadcaster");
const getRank_1 = require("./getRank");
const createClient_1 = require("./createClient");
async function handleBombGameCreate(payload) {
    const { host, originalGameId } = payload;
    const game = await prisma_1.prisma.game.create({
        data: {
            host,
            originalGameId,
        },
    });
    return game.id;
}
async function handleBombGameMsg(ws, msg) {
    console.log('Received bomb game msg:', msg);
    if (msg.type === 'create_game') {
        const gameId = await handleBombGameCreate(msg.payload);
        (0, broadcaster_1.broadcastSingle)(ws, 'bomb-game', { type: 'game_created', gameId });
        return gameId;
    }
    if (msg.type === 'connect') {
        const { client, gameId } = msg.payload;
        // find host from gameId
        const game = await prisma_1.prisma.game.findUnique({
            where: {
                id: gameId,
            },
            select: { host: true },
        });
        if (!game)
            return;
        const referer = game.host !== client ? game.host : '';
        // create new client with referer if not exists
        await (0, createClient_1.createClientIfNotExists)(client, referer);
        // update or create a game client
        const gameClient = await prisma_1.prisma.gameClient.upsert({
            where: {
                gameId_client: {
                    gameId,
                    client,
                },
            },
            update: {
                lastConnectAt: new Date(),
            },
            create: {
                gameId,
                client,
                firstConnectAt: new Date(),
            },
        });
        return gameClient;
    }
    if (msg.type === 'join') {
        const { client, gameId, playerId, name } = msg.payload;
        // link the game client to the player
        const gameClient = await prisma_1.prisma.gameClient.updateMany({
            where: {
                gameId,
                client,
            },
            data: {
                playerId,
                name,
                joinedAt: new Date(),
            },
        });
        return gameClient;
    }
    if (msg.type === 'place_bomb') {
        const { gameId, round, playerId, pos, bombType } = msg.payload;
        const placeBomb = await prisma_1.prisma.gameAction.create({
            data: {
                gameId,
                round,
                playerId,
                actionType: client_1.ActionType.place_bomb,
                payload: {
                    pos, bombType,
                },
            },
        });
        return placeBomb;
    }
    if (msg.type === 'defuse_bomb') {
        const { gameId, round, playerId, pos } = msg.payload;
        const defuseBomb = await prisma_1.prisma.gameAction.create({
            data: {
                gameId,
                round,
                playerId,
                actionType: client_1.ActionType.defuse_bomb,
                payload: {
                    pos,
                },
            },
        });
        return defuseBomb;
    }
    if (msg.type === 'buy_bomb') {
        const { gameId, playerId, bombType, quantity } = msg.payload;
        const buyBomb = await prisma_1.prisma.gameAction.create({
            data: {
                gameId,
                round: 0, // round is not applicable for buy_bomb
                playerId,
                actionType: client_1.ActionType.buy_bomb,
                payload: {
                    bombType,
                    quantity,
                },
            },
        });
        return buyBomb;
    }
    if (msg.type === 'scores') {
        const { gameId, round, players } = msg.payload;
        const scoreRecords = await Promise.all(players.map(({ playerId, score }) => prisma_1.prisma.gameScore.create({
            data: {
                gameId,
                round,
                playerId,
                score
            },
        })));
        return scoreRecords;
    }
    if (msg.type === 'get_top_rank') {
        const { round } = msg.payload;
        const players = await (0, getRank_1.getTopRanks)(round);
        (0, broadcaster_1.broadcastSingle)(ws, 'bomb-game', { type: 'top_rank', players });
    }
    if (msg.type === 'get_high_score') {
        const { client, round } = msg.payload;
        const highScore = await (0, getRank_1.getPlayerRoundHighScore)(client, round);
        if (highScore) {
            (0, broadcaster_1.broadcastSingle)(ws, 'bomb-game', { type: 'high_score', score: highScore });
        }
    }
    if (msg.type === 'add_recorded_game') {
        const { gameId, gameDataCid } = msg.payload;
        // store the recorded game CID to the game record
        const game = await prisma_1.prisma.game.update({
            where: {
                id: gameId,
            },
            data: {
                recordedRounds: {
                    push: gameDataCid,
                },
            },
        });
        return game;
    }
    return null;
}
