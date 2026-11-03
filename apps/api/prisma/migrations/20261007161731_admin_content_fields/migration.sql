-- AlterEnum
ALTER TYPE "GalleryCategory" ADD VALUE 'SHEHNAI';

-- AlterTable
ALTER TABLE "AddOn" ADD COLUMN     "serviceId" TEXT;

-- AlterTable
ALTER TABLE "GalleryItem" ADD COLUMN     "serviceId" TEXT;

-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "imageId" TEXT,
ADD COLUMN     "meta" TEXT;

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "heroImageId" TEXT,
ADD COLUMN     "netflixBlurb" TEXT,
ADD COLUMN     "ticker" TEXT[] DEFAULT ARRAY['Brass Band', 'Dhol', 'Shehnai', 'Vintage Cars', 'Royal Chattar', 'Baraat Lighting']::TEXT[];

-- CreateTable
CREATE TABLE "PackageComparisonRow" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "values" TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PackageComparisonRow_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AddOn" ADD CONSTRAINT "AddOn_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GalleryItem" ADD CONSTRAINT "GalleryItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_imageId_fkey" FOREIGN KEY ("imageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiteSettings" ADD CONSTRAINT "SiteSettings_heroImageId_fkey" FOREIGN KEY ("heroImageId") REFERENCES "Media"("id") ON DELETE SET NULL ON UPDATE CASCADE;
