import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getTopRanks(round: number) {
  const topPlayers = await prisma.gameScore.findMany({
    where: {
      round,
    },
    orderBy: {
      score: 'desc',
    },
    take: 5,
  })
  

  return topPlayers.map(p => ({
    gameId: p.gameId,
    playerId: p.playerId,
    score: p.score,
  }))
}

export async function getPlayerRoundHighScore(client: string, round: number) {
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
  })

  if (!highScore) {
    return null
  }

  return {
    gameId: highScore.gameId,
    score: highScore.score,
    ts: highScore.updatedAt.getTime(),
  }
}