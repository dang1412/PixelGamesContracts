import express, { Request, Response } from "express";
import cors from "cors";

import { generateSignature, validateTurnstile } from "./turnstile";
import { generateS3UploadURL } from "./socials/generateS3UploadURL";
import { shareBombResult } from "./socials/bomb";

const app = express();
const port = 8080;

// Middleware to parse JSON
app.use(express.json());

// Allow frontend (localhost:3000) to access backend
app.use(cors({
  origin: ['https://pixelonbase.com', 'http://localhost:3000'], // or "*" for all
  methods: ["GET", "POST"],        // allowed methods
//   credentials: true                // if you need cookies/auth headers
}));

// Simple route
app.get("/", (req: Request, res: Response) => {
  res.send("Hello from Express + TypeScript!");
});

// Example POST route
app.post("/verifyHuman", async (req: Request, res: Response) => {
//   res.json({ youSent: req.body });
  const { address, token } = req.body; // read the string sent by client
  console.log("Received string:", address);

  const validate = await validateTurnstile(token, req.ip);
  if (validate.success) {
    const signData = await generateSignature(address);
    res.json({ success: true, signData });
  } else {
    res.json({ success: false, error: 'Human validation failed', signData: null });
  }
});

// Generate S3 Upload URL route
app.post("/generateUploadURL", async (req: Request, res: Response) => {
  const { fileName, fileType } = req.body;
  try {
    const uploadURL = await generateS3UploadURL(fileName, fileType);
    console.log("Generated upload URL for:", fileName, fileType);
    res.json({ success: true, uploadURL });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Could not generate upload URL' });
  }
});

// Social share route
app.get("/bombshare/:gameId", async (req: Request, res: Response) => {
  const { gameId } = req.params;
  const { img, round, playerId } = req.query;

  if (typeof img !== 'string' || !img) {
    res.status(400).send('Missing or invalid img query parameter');
    return;
  }

  const gameIdNum = parseInt(gameId);
  const roundNum = typeof round === 'string' ? parseInt(round) : 0;
  const playerIdNum = typeof playerId === 'string' ? parseInt(playerId) : 0;

  // Generate the share HTML
  const shareHtml = await shareBombResult(gameIdNum, roundNum, playerIdNum, img);
  res.send(shareHtml);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
