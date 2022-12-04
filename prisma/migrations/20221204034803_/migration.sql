/*
  Warnings:

  - The values [APPROVED_APPLICATION] on the enum `ADOPTION_STATUS` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ADOPTION_STATUS_new" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'APPROVED_INTERVIEW');
ALTER TABLE "adoptions" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "adoptions" ALTER COLUMN "status" TYPE "ADOPTION_STATUS_new" USING ("status"::text::"ADOPTION_STATUS_new");
ALTER TYPE "ADOPTION_STATUS" RENAME TO "ADOPTION_STATUS_old";
ALTER TYPE "ADOPTION_STATUS_new" RENAME TO "ADOPTION_STATUS";
DROP TYPE "ADOPTION_STATUS_old";
ALTER TABLE "adoptions" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;

-- AlterTable
ALTER TABLE "pets" ADD COLUMN     "animal_history" TEXT,
ADD COLUMN     "medical_history" TEXT,
ALTER COLUMN "condition" DROP NOT NULL;
