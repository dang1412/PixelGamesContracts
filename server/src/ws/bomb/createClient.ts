import { prisma } from '../../lib/prisma'

export async function createClientIfNotExists(wsName: string, referer: string) {
  // Check if client already exists
  const existingClient = await prisma.client.findUnique({
    where: { wsname: wsName }
  })

  if (existingClient) {
    console.log(`Client already exists: ${wsName}`)
    return existingClient
  }

  // Find referrer client by wsname if provided
  let referrerId: bigint | undefined
  if (referer) {
    const referrerClient = await prisma.client.findUnique({
      where: { wsname: referer }
    })
    if (referrerClient) {
      referrerId = referrerClient.id
    }
  }

  // Create new client
  const newClient = await prisma.client.create({
    data: {
      wsname: wsName,
      walletAddr: '',
      referencedBy: referrerId
    }
  })

  console.log(`Created new client: ${wsName}${referrerId ? ` (referred by: ${referer})` : ''}`)
  return newClient
}

export function updateClientWalletAddress(wsName: string, walletAddr: string) {
  // only update wallet address if no wallet address yet
  return prisma.client.updateMany({
    where: { wsname: wsName, walletAddr: '' },
    data: { walletAddr }
  })
}
