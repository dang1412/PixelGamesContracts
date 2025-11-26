"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createClientIfNotExists = createClientIfNotExists;
exports.updateClientWalletAddress = updateClientWalletAddress;
const prisma_1 = require("../../lib/prisma");
async function createClientIfNotExists(wsName, referer) {
    // Check if client already exists
    const existingClient = await prisma_1.prisma.client.findUnique({
        where: { wsname: wsName }
    });
    if (existingClient) {
        console.log(`Client already exists: ${wsName}`);
        return existingClient;
    }
    // Find referrer client by wsname if provided
    let referrerId;
    if (referer) {
        const referrerClient = await prisma_1.prisma.client.findUnique({
            where: { wsname: referer }
        });
        if (referrerClient) {
            referrerId = referrerClient.id;
        }
    }
    // Create new client
    const newClient = await prisma_1.prisma.client.create({
        data: {
            wsname: wsName,
            walletAddr: '',
            referencedBy: referrerId
        }
    });
    console.log(`Created new client: ${wsName}${referrerId ? ` (referred by: ${referer})` : ''}`);
    return newClient;
}
function updateClientWalletAddress(wsName, walletAddr) {
    // only update wallet address if no wallet address yet
    return prisma_1.prisma.client.updateMany({
        where: { wsname: wsName, walletAddr: '' },
        data: { walletAddr }
    });
}
