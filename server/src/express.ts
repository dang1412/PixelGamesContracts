import express, { Request, Response } from "express";
import cors from "cors";

import { generateSignature, validateTurnstile } from "./turnstile";

const app = express();
const port = 8080;

// Middleware to parse JSON
app.use(express.json());

// Allow frontend (localhost:3000) to access backend
app.use(cors({
  origin: "http://localhost:3000", // or "*" for all
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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
