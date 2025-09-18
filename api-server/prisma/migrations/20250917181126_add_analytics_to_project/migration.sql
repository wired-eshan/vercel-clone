-- AlterTable
ALTER TABLE "public"."Project" ALTER COLUMN "user_id" DROP DEFAULT;

-- CreateTable
CREATE TABLE "public"."Analytic" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "lat" TEXT,
    "lon" TEXT,
    "country" TEXT,
    "city" TEXT,
    "projectId" TEXT NOT NULL,

    CONSTRAINT "Analytic_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Analytic" ADD CONSTRAINT "Analytic_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "public"."Project"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
