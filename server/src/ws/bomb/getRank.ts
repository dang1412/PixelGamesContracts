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

  return topPlayers
}