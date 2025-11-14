-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('place_bomb', 'defuse_bomb', 'buy_bomb');

-- CreateTable
CREATE TABLE "games" (
    "id" SERIAL NOT NULL,
    "host" TEXT NOT NULL,
    "original_game_id" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_clients" (
    "id" BIGSERIAL NOT NULL,
    "game_id" INTEGER NOT NULL,
    "client" TEXT NOT NULL,
    "player_id" INTEGER,
    "name" TEXT,
    "first_connect_at" TIMESTAMPTZ,
    "last_connect_at" TIMESTAMPTZ,
    "joined_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_actions" (
    "id" BIGSERIAL NOT NULL,
    "game_id" INTEGER NOT NULL,
    "round" INTEGER NOT NULL,
    "player_id" INTEGER,
    "action_type" "ActionType" NOT NULL,
    "payload" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_actions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_scores" (
    "id" BIGSERIAL NOT NULL,
    "game_id" INTEGER NOT NULL,
    "round" INTEGER NOT NULL,
    "player_id" INTEGER NOT NULL,
    "score" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "game_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_game_clients_game_client" ON "game_clients"("game_id", "client");

-- CreateIndex
CREATE UNIQUE INDEX "game_clients_game_id_client_key" ON "game_clients"("game_id", "client");

-- CreateIndex
CREATE INDEX "idx_game_actions_game_round" ON "game_actions"("game_id", "round");

-- CreateIndex
CREATE INDEX "idx_game_actions_game_player" ON "game_actions"("game_id", "player_id");

-- CreateIndex
CREATE INDEX "idx_game_actions_game_actiontype" ON "game_actions"("game_id", "action_type");

-- CreateIndex
CREATE INDEX "idx_game_scores_game_round" ON "game_scores"("game_id", "round");

-- CreateIndex
CREATE INDEX "idx_game_scores_game_player" ON "game_scores"("game_id", "player_id");

-- CreateIndex
CREATE UNIQUE INDEX "game_scores_game_id_round_player_id_key" ON "game_scores"("game_id", "round", "player_id");

-- AddForeignKey
ALTER TABLE "games" ADD CONSTRAINT "games_original_game_id_fkey" FOREIGN KEY ("original_game_id") REFERENCES "games"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_clients" ADD CONSTRAINT "game_clients_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_actions" ADD CONSTRAINT "game_actions_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_scores" ADD CONSTRAINT "game_scores_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE CASCADE;
