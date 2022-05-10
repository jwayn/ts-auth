/*
  Warnings:

  - A unique constraint covering the columns `[token]` on the table `Reset` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Reset_token_key" ON "Reset"("token");
