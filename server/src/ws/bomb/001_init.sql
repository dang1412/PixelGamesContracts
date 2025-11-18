-- Games
CREATE TABLE IF NOT EXISTS games (
  id SERIAL PRIMARY KEY,
  host TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Players (per game)
-- CREATE TABLE IF NOT EXISTS players (
--   id BIGSERIAL PRIMARY KEY,
--   game_id INT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
--   player_id INT NOT NULL, -- numeric ID used in messages
--   client TEXT NOT NULL,   -- client address or wallet
--   joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
--   UNIQUE (game_id, player_id)
-- );

CREATE TABLE IF NOT EXISTS game_clients (
  id BIGSERIAL PRIMARY KEY,
  game_id INT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  client TEXT NOT NULL,              -- wallet address / client id / socket id
  player_id INT,            -- game numeric playerId from messages
  name TEXT,                         -- optional display name
  first_connect_at TIMESTAMPTZ,      -- first time we saw this client
  last_connect_at TIMESTAMPTZ,       -- most recent connect
  joined_at TIMESTAMPTZ,             -- when 'join' was received
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (game_id, client)
);

CREATE INDEX IF NOT EXISTS idx_game_clients_game_client ON game_clients (game_id, client);

-- Actions performed during a game (place/defuse/buy bombs)
CREATE TABLE IF NOT EXISTS game_actions (
  id BIGSERIAL PRIMARY KEY,
  game_id INT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  round INT NOT NULL,
  player_id INT,                    -- numeric player id from messages
  action_type TEXT NOT NULL,        -- 'place_bomb' | 'defuse_bomb' | 'buy_bomb'
  payload JSONB,                    -- full original payload for extensibility
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_game_actions_game_round ON game_actions (game_id, round);
CREATE INDEX IF NOT EXISTS idx_game_actions_game_player ON game_actions (game_id, player_id);
CREATE INDEX IF NOT EXISTS idx_game_actions_game_actiontype ON game_actions (game_id, action_type);

-- Game scores (per player per round)
CREATE TABLE IF NOT EXISTS game_scores (
  id BIGSERIAL PRIMARY KEY,
  game_id INT NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  round INT NOT NULL,
  player_id INT NOT NULL,
  score INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (game_id, round, player_id)
);

CREATE INDEX IF NOT EXISTS idx_game_scores_game_round ON game_scores (game_id, round);
CREATE INDEX IF NOT EXISTS idx_game_scores_game_player ON game_scores (game_id, player_id);
