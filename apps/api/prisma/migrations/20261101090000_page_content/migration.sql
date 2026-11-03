-- CreateTable
CREATE TABLE "PageContent" (
    "key" TEXT NOT NULL,
    "fields" JSONB NOT NULL DEFAULT '{}',
    "heroImageId" TEXT,
    "youtubeId" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "ogImageId" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PageContent_pkey" PRIMARY KEY ("key")
);

-- AddForeignKey
ALTER TABLE "PageContent" ADD CONSTRAINT "PageContent_heroImageId_fkey" FOREIGN KEY ("heroImageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PageContent" ADD CONSTRAINT "PageContent_ogImageId_fkey" FOREIGN KEY ("ogImageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Move page content out of SiteSettings: home hero photo → home, story → about.
INSERT INTO "PageContent" ("key", "heroImageId", "updatedAt")
SELECT 'home', "heroImageId", CURRENT_TIMESTAMP FROM "SiteSettings"
WHERE "id" = 1 AND "heroImageId" IS NOT NULL;

INSERT INTO "PageContent" ("key", "fields", "updatedAt")
SELECT 'about', jsonb_build_object('story', "aboutStory"), CURRENT_TIMESTAMP FROM "SiteSettings"
WHERE "id" = 1 AND "aboutStory" IS NOT NULL;

-- DropForeignKey
ALTER TABLE "SiteSettings" DROP CONSTRAINT "SiteSettings_heroImageId_fkey";

-- AlterTable
ALTER TABLE "SiteSettings" DROP COLUMN "aboutStory",
DROP COLUMN "heroImageId";
