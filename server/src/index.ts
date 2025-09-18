import { WebSocketServer, WebSocket } from "ws"
import { createPublicClient, webSocket, parseAbiItem } from "viem"
import { baseSepolia } from "viem/chains"

import { BoxClaimedArgs, encodeBoxClaimedEvents } from "./utils/encode"
import { IncomingMessage } from "http";

function getClientIp(req: IncomingMessage, ws: WebSocket): string {
  const forwardedFor = req.headers["x-forwarded-for"];
  const ip = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(",")[0].trim();

  return ip || (ws as any)._socket.remoteAddress?.replace(/^::ffff:/, "") || "unknown";
}

// ==== CONFIG ====
// const CONTRACT_ADDRESS = "0x4f25aF152764737E6DDFb8cBEA7be66a553B70F4"
const CONTRACT_ADDRESS = "0x83514843b0A11398e98e99873908c1d6f1C1CaeA" // 2025/09/19

// Event ABI (ví dụ: BoxClaimed)
const EVENT_ABI = [
  parseAbiItem("event BoxClaimed(address user, uint16 position, uint16 token)"),
]

// wss://base-sepolia.g.alchemy.com/v2/SGhknXwY9r_VlRV44vghO0RfBXc1nhcB

// Tạo client kết nối RPC qua WebSocket
const client = createPublicClient({
  chain: baseSepolia,
  transport: webSocket("wss://base-mainnet.g.alchemy.com/v2/SGhknXwY9r_VlRV44vghO0RfBXc1nhcB"),
  // transport: webSocket("wss://go.getblock.io/d0aca3a299984a3ab6561fbb9cba99af"),
  // transport: webSocket("wss://base-sepolia.core.chainstack.com/f261d7b1c99ec08c17270535b5ac79b9"),
  // transport: roundRobinHttp([
  //   // {url: 'https://sepolia.base.org'},
  //   {
  //     url: 'https://base-sepolia.gateway.tatum.io',
  //     config: {
  //       fetchOptions: {
  //         headers: {
  //           'x-api-key': 't-67919a2e57673415a4b4fd77-11e5658d5ecf4a19a3ed8c30',
  //         },
  //       },
  //     }
  //   },
  //   {url: 'https://base-sepolia.g.alchemy.com/v2/SGhknXwY9r_VlRV44vghO0RfBXc1nhcB'},
  // ]),
})

// ==== WEBSOCKET SERVER ====
const wss = new WebSocketServer({ port: 8080 })
let sockets: WebSocket[] = []

wss.on("connection", (ws: WebSocket, req) => {
  sockets.push(ws)
  const ip = getClientIp(req, ws)
  console.log(`Client connected ${ip}, total:`, sockets.length, new Date())

  ws.on("close", () => {
    sockets = sockets.filter((s) => s !== ws)
    console.log(`Client disconnected ${ip}, total:`, sockets.length, new Date())
  })
})

// // ==== LISTEN TO CONTRACT EVENTS ====
const rs = client.watchContractEvent({
  address: CONTRACT_ADDRESS,
  abi: EVENT_ABI,
  eventName: "BoxClaimed",
  onLogs: (logs) => {
    console.log("Events received:", logs.length, new Date())
    for (const log of logs) {
      console.log(`- User: ${log.args.user}, Position: ${log.args.position}, Token: ${log.args.token}`)
    }

    const args: BoxClaimedArgs[] = logs.map(log => ({
      user: '0x', position: log.args?.position || 0, token: log.args?.token || 0
    }))

    const encoded = encodeBoxClaimedEvents(args)

    // const message = JSON.stringify({ type: "BoxClaimed", data: logs })
    sockets.forEach((ws) => {
      if (ws.readyState === ws.OPEN) {
        ws.send(encoded)
      }
    })
  },
  pollingInterval: 4000,
})

console.log("✅ WebSocket server running on ws://localhost:8080")
