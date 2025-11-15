-- CreateIndex
CREATE INDEX "idx_game_scores_round_score" ON "game_scores"("round", "score" DESC);
