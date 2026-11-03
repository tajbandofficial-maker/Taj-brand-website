-- AlterTable
ALTER TABLE "Service" ADD COLUMN     "ogImageId" TEXT;

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "ogImageId" TEXT,
ADD COLUMN     "seoDescription" TEXT,
ADD COLUMN     "seoSiteTitle" TEXT NOT NULL DEFAULT 'Taj Band — Wedding Band & Baraat, Delhi';

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_ogImageId_fkey" FOREIGN KEY ("ogImageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSettings" ADD CONSTRAINT "SiteSettings_ogImageId_fkey" FOREIGN KEY ("ogImageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

