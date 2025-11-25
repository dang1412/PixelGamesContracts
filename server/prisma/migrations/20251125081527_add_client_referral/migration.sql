-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "referenced_by" BIGINT;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_referenced_by_fkey" FOREIGN KEY ("referenced_by") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
