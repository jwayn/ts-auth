/*
  Warnings:

  - A unique constraint covering the columns `[id]` on the table `Strike` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[token]` on the table `Verification` will be added. If there are existing duplicate values, this will fail.
  - The required column `id` was added to the `Strike` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- DropIndex
DROP INDEX "Strike_userId_key";

-- AlterTable
ALTER TABLE "Strike" ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Strike_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Strike_id_key" ON "Strike"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Verification_token_key" ON "Verification"("token");
