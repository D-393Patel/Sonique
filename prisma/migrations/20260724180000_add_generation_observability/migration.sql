ALTER TABLE "Generation"
ADD COLUMN "promptLength" INTEGER,
ADD COLUMN "provider" TEXT,
ADD COLUMN "modelVersion" TEXT,
ADD COLUMN "latencyMs" INTEGER,
ADD COLUMN "audioDurationSec" DOUBLE PRECISION,
ADD COLUMN "audioSizeBytes" INTEGER,
ADD COLUMN "estimatedCostCents" DOUBLE PRECISION;
