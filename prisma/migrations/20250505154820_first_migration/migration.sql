-- CreateTable
CREATE TABLE "GalpInboundSchema" (
    "id" TEXT NOT NULL,
    "call_uuid" TEXT NOT NULL,
    "call_start" TIMESTAMP(3) NOT NULL,
    "owner_name" TEXT NOT NULL,
    "call_end" TIMESTAMP(3) NOT NULL,
    "talk_time" INTEGER,
    "servicos_assistencia" TEXT,
    "queue_time" INTEGER NOT NULL,
    "wait_time" INTEGER NOT NULL,
    "term_reason" TEXT NOT NULL,
    "call_outcome_group" TEXT NOT NULL,
    "call_outcome_name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GalpInboundSchema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GalpOutboundSchema" (
    "id" TEXT NOT NULL,
    "call_uuid" TEXT NOT NULL,
    "call_outcome_group" TEXT NOT NULL,
    "servicos_assistencia" TEXT,
    "call_start" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GalpOutboundSchema_pkey" PRIMARY KEY ("id")
);
