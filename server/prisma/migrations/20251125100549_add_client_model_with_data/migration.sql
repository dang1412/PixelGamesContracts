-- CreateTable
CREATE TABLE "clients" (
    "id" BIGSERIAL NOT NULL,
    "wsname" TEXT NOT NULL,
    "wallet_addr" TEXT NOT NULL,
    "browser_info" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_wsname_key" ON "clients"("wsname");

-- CreateIndex
CREATE INDEX "idx_clients_wallet" ON "clients"("wallet_addr");

-- Populate clients table with existing data from game_clients
INSERT INTO "clients" ("wsname", "wallet_addr", "created_at", "updated_at")
SELECT DISTINCT 
    gc."client" as "wsname",
    '' as "wallet_addr",  -- placeholder, will need to be updated later
    COALESCE(MIN(gc."first_connect_at"), CURRENT_TIMESTAMP) as "created_at",
    COALESCE(MAX(gc."last_connect_at"), CURRENT_TIMESTAMP) as "updated_at"
FROM "game_clients" gc
WHERE gc."client" IS NOT NULL
GROUP BY gc."client"
ON CONFLICT ("wsname") DO NOTHING;

-- AddForeignKey
ALTER TABLE "game_clients" ADD CONSTRAINT "game_clients_client_fkey" FOREIGN KEY ("client") REFERENCES "clients"("wsname") ON DELETE RESTRICT ON UPDATE CASCADE;
