import { prisma } from '../lib/prisma'

const apiUrl = 'https://api.pixelonbase.com'
const imageBaseUrl = 'https://bomb-game-results.s3.ap-southeast-1.amazonaws.com'
const gameUrl = 'https://pixelonbase.com/bomb/'

async function getGameReplayHash(gameId: number): Promise<string> {
  try {
    const game = await prisma.game.findUnique({
      where: { id: gameId },
      select: { recordedRounds: true }
    });
    if (game?.recordedRounds?.length) {
      return game.recordedRounds[game.recordedRounds.length - 1];
    }
  } catch (e) {
    console.error('Error fetching game replay hash:', e);
  }
  return 'QmWqZ7f2TkDhs4s57nHw4dqrkW8zVszeCjBiw2xGkEx7yY'; // default hash
}

async function getGamePlayerInfo(gameId: number, round: number, playerId: number): Promise<{ name: string; score: number } | null>   {
  try {
    const [client, scoreRecord] = await Promise.all([
      prisma.gameClient.findFirst({
        where: { gameId, playerId },
        select: { name: true }
      }),
      prisma.gameScore.findUnique({
        where: {
          gameId_round_playerId: {
            gameId,
            round,
            playerId
          }
        },
        select: { score: true }
      })
    ]);

    if (client) {
      return { name: client.name || `Player ${playerId}`, score: scoreRecord?.score || 0 };
    }
  } catch (e) {
    console.error('Error fetching game player info:', e);
  }
  return null;
}

export async function shareBombResult(
  gameId: number, round: number, playerId: number, img: string
): Promise<string> {
  // use prisma to get the last round recorded hash for the gameId
  const replayHash = await getGameReplayHash(gameId);
  // player info
  const playerInfo = await getGamePlayerInfo(gameId, round, playerId);

  const replayUrl = `${gameUrl}?replayGameId=${replayHash}`;
  const imageUrl = `${imageBaseUrl}/${img}`;

  // Sample bomb game data
  const score = playerInfo?.score || 0;
  const playerName = playerInfo?.name || 'Player';
  const title = `🎮 ${playerName}'s Bomb Results (Round ${round})!`;
  const description = `${playerName} scored ${score} points! Play now and challenge your friends!`;
  const shareUrl = `${apiUrl}/bombshare/${gameId}?img=${img}&round=${round}&playerId=${playerId}`;
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${shareUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${imageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:site_name" content="Pixel Bomb Game">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:url" content="${shareUrl}">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${imageUrl}">
  <meta name="twitter:creator" content="@pixelgame">
  
  <!-- Additional Meta Tags -->
  <meta name="description" content="${description}">
  <meta name="theme-color" content="#FF6B6B">
  
</head>
<body>
  <h1>${title}</h1>
  <p>${description}</p>
  <p>Redirecting to game...</p>
  <a href="${replayUrl}">Click here if you're not redirected automatically</a>
</body>
</html>`;
}