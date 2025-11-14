import { ActionType, PrismaClient } from '@prisma/client'
import { WebSocket } from 'ws'

import { broadcastSingle } from '../broadcaster'
import { BombGameCreatePayload, BombGameMsg } from './bombTypes'

const prisma = new PrismaClient()

async function handleBombGameCreate(payload: BombGameCreatePayload) {
  const { host, originalGameId } = payload
  const game = await prisma.game.create({
    data: {
      host,
      originalGameId,
    },
  })
  return game.id
}

export async function handleBombGameMsg(ws: WebSocket, msg: BombGameMsg) {
  console.log('Received bomb game msg:', msg)
  if (msg.type === 'create_game') {
    const gameId = await handleBombGameCreate(msg.payload)
    broadcastSingle(ws, 'bomb-game', { type: 'game_created', gameId })

    return gameId
  }

  if (msg.type === 'connect') {
    const { client, gameId } = msg.payload

    // update or create a game client
    const gameClient = await prisma.gameClient.upsert({
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
    })

    return gameClient
  }

  if (msg.type === 'join') {
    const { client, gameId, playerId } = msg.payload

    // link the game client to the player
    const gameClient = await prisma.gameClient.updateMany({
      where: {
        gameId,
        client,
      },
      data: {
        playerId,
        joinedAt: new Date(),
      },
    })

    return gameClient
  }

  if (msg.type === 'place_bomb') {
    const { gameId, round, playerId, pos, bombType } = msg.payload

    const placeBomb = await prisma.gameAction.create({
      data: {
        gameId,
        round,
        playerId,
        actionType: ActionType.PLACE_BOMB,
        payload: {
          pos, bombType,
        },
      },
    })

    return placeBomb
  }

  if (msg.type === 'defuse_bomb') {
    const { gameId, round, playerId, pos } = msg.payload

    const defuseBomb = await prisma.gameAction.create({
      data: {
        gameId,
        round,
        playerId,
        actionType: ActionType.DEFUSE_BOMB,
        payload: {
          pos,
        },
      },
    })

    return defuseBomb
  }

  if (msg.type === 'buy_bomb') {
    const { gameId, playerId, bombType } = msg.payload

    const buyBomb = await prisma.gameAction.create({
      data: {
        gameId,
        round: 0, // round is not applicable for buy_bomb
        playerId,
        actionType: ActionType.BUY_BOMB,
        payload: {
          bombType,
        },
      },
    })

    return buyBomb
  }

  if (msg.type === 'scores') {
    const { gameId, round, players } = msg.payload

    const scoreRecords = await Promise.all(players.map(({ playerId, score }) =>
      prisma.gameScore.create({
        data: {
          gameId,
          round,
          playerId,
          score
        },
      })
    ))

    return scoreRecords
  }

  return null
}