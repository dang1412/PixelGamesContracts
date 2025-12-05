"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const turnstile_1 = require("./turnstile");
const generateS3UploadURL_1 = require("./socials/generateS3UploadURL");
const bomb_1 = require("./socials/bomb");
const app = (0, express_1.default)();
const port = 8080;
// Middleware to parse JSON
app.use(express_1.default.json());
// Allow frontend (localhost:3000) to access backend
app.use((0, cors_1.default)({
    origin: ['https://pixelonbase.com', 'http://localhost:3000'], // or "*" for all
    methods: ["GET", "POST"], // allowed methods
    //   credentials: true                // if you need cookies/auth headers
}));
// Simple route
app.get("/", (req, res) => {
    res.send("Hello from Express + TypeScript!");
});
// Example POST route
app.post("/verifyHuman", async (req, res) => {
    //   res.json({ youSent: req.body });
    const { address, token } = req.body; // read the string sent by client
    console.log("Received string:", address);
    const validate = await (0, turnstile_1.validateTurnstile)(token, req.ip);
    if (validate.success) {
        const signData = await (0, turnstile_1.generateSignature)(address);
        res.json({ success: true, signData });
    }
    else {
        res.json({ success: false, error: 'Human validation failed', signData: null });
    }
});
// Generate S3 Upload URL route
app.post("/generateUploadURL", async (req, res) => {
    const { fileName, fileType } = req.body;
    try {
        const uploadURL = await (0, generateS3UploadURL_1.generateS3UploadURL)(fileName, fileType);
        console.log("Generated upload URL for:", fileName, fileType, uploadURL);
        res.json({ success: true, uploadURL });
    }
    catch (error) {
        res.status(500).json({ success: false, error: 'Could not generate upload URL' });
    }
});
// Social share route
app.get("/bombshare/:gameId", async (req, res) => {
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
    const shareHtml = await (0, bomb_1.shareBombResult)(gameIdNum, roundNum, playerIdNum, img);
    res.send(shareHtml);
});
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
