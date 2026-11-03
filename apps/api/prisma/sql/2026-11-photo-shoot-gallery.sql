-- Client photo shoot (Nov 2026): 26 photos added to the gallery, shown first.
-- Import once in hPanel -> phpMyAdmin -> (your database) -> Import. Safe to run again:
-- photos that are already there are skipped.
-- The image files ship with the website (apps/web/public/photos), so redeploy the website
-- after importing; the redeploy also refreshes the site's cached gallery.

SET NAMES utf8mb4;
START TRANSACTION;

INSERT IGNORE INTO `Media` (`id`, `key`, `url`, `mimeType`, `width`, `height`, `alt`) VALUES
  ('shoot26_groom_chattar_sparklers', 'site/groom-chattar-sparklers.jpg', '/photos/groom-chattar-sparklers.jpg', 'image/jpeg', 1600, 2000, 'Groom on a royal flower chattar with sparklers and confetti'),
  ('shoot26_red_vintage_car_pink_flowers', 'site/red-vintage-car-pink-flowers.jpg', '/photos/red-vintage-car-pink-flowers.jpg', 'image/jpeg', 1600, 2400, 'Red vintage car decorated with pink flowers for the groom'),
  ('shoot26_band_navy_gold_uniform', 'site/band-navy-gold-uniform.jpg', '/photos/band-navy-gold-uniform.jpg', 'image/jpeg', 1600, 2400, 'Taj Band musician in a navy and gold band uniform'),
  ('shoot26_dj_name_board_cold_pyro', 'site/dj-name-board-cold-pyro.jpg', '/photos/dj-name-board-cold-pyro.jpg', 'image/jpeg', 1600, 1600, 'Cold pyro firing at a DJ on wheels with the groom''s name in lights'),
  ('shoot26_floral_baggi_night_orchids', 'site/floral-baggi-night-orchids.jpg', '/photos/floral-baggi-night-orchids.jpg', 'image/jpeg', 1600, 2400, 'Wedding baggi covered in orchids and garlands at a night baraat'),
  ('shoot26_groomsmen_blue_pagdis', 'site/groomsmen-blue-pagdis.jpg', '/photos/groomsmen-blue-pagdis.jpg', 'image/jpeg', 1600, 2400, 'Groomsmen in matching blue pagdis and printed jackets'),
  ('shoot26_white_vintage_car_roses', 'site/white-vintage-car-roses.jpg', '/photos/white-vintage-car-roses.jpg', 'image/jpeg', 1600, 2400, 'White vintage car decorated with pink roses'),
  ('shoot26_band_umbrella_lights_procession', 'site/band-umbrella-lights-procession.jpg', '/photos/band-umbrella-lights-procession.jpg', 'image/jpeg', 1600, 1067, 'Taj Band procession with umbrella lights and the band''s name board'),
  ('shoot26_groom_on_ghodi', 'site/groom-on-ghodi.jpg', '/photos/groom-on-ghodi.jpg', 'image/jpeg', 1600, 2000, 'Groom riding a decorated white ghodi under a royal umbrella'),
  ('shoot26_dj_truck_led_screens', 'site/dj-truck-led-screens.jpg', '/photos/dj-truck-led-screens.jpg', 'image/jpeg', 1600, 2400, 'DJ on wheels with LED screens and a lit truss'),
  ('shoot26_wedding_baggi_yellow_flowers', 'site/wedding-baggi-yellow-flowers.jpg', '/photos/wedding-baggi-yellow-flowers.jpg', 'image/jpeg', 1600, 2400, 'Wedding baggi decorated with yellow and white flowers'),
  ('shoot26_groom_pastel_pagdi_baraat', 'site/groom-pastel-pagdi-baraat.jpg', '/photos/groom-pastel-pagdi-baraat.jpg', 'image/jpeg', 1600, 2400, 'Groom and guests in pastel pagdis at the baraat'),
  ('shoot26_red_vintage_car_umbrellas', 'site/red-vintage-car-umbrellas.jpg', '/photos/red-vintage-car-umbrellas.jpg', 'image/jpeg', 1600, 1067, 'Red vintage car with umbrella lights at a daytime baraat'),
  ('shoot26_band_uniforms_white_red', 'site/band-uniforms-white-red.jpg', '/photos/band-uniforms-white-red.jpg', 'image/jpeg', 1600, 2400, 'Taj Band uniforms in white and royal red'),
  ('shoot26_dj_truck_flower_arch', 'site/dj-truck-flower-arch.jpg', '/photos/dj-truck-flower-arch.jpg', 'image/jpeg', 1600, 2133, 'DJ on wheels with a flower arch and the groom''s name in lights'),
  ('shoot26_lit_floral_baggi_canopy', 'site/lit-floral-baggi-canopy.jpg', '/photos/lit-floral-baggi-canopy.jpg', 'image/jpeg', 1600, 2400, 'Floral baggi with a lit canopy, ready for the groom'),
  ('shoot26_groom_press_interview', 'site/groom-press-interview.jpg', '/photos/groom-press-interview.jpg', 'image/jpeg', 1600, 1067, 'Groom speaking to the press at his baraat'),
  ('shoot26_groom_white_vintage_car', 'site/groom-white-vintage-car.jpg', '/photos/groom-white-vintage-car.jpg', 'image/jpeg', 1600, 2400, 'Groom beside a white vintage car decorated with flowers'),
  ('shoot26_smoke_effects_baraat_dance', 'site/smoke-effects-baraat-dance.jpg', '/photos/smoke-effects-baraat-dance.jpg', 'image/jpeg', 1600, 1067, 'Guests dancing in smoke effects at a baraat'),
  ('shoot26_floral_baggi_gurgaon', 'site/floral-baggi-gurgaon.jpg', '/photos/floral-baggi-gurgaon.jpg', 'image/jpeg', 1600, 1280, 'Flower-decorated baggi at a baraat in Gurgaon'),
  ('shoot26_groom_floral_safa', 'site/groom-floral-safa.jpg', '/photos/groom-floral-safa.jpg', 'image/jpeg', 1600, 2400, 'Groom in a floral printed safa'),
  ('shoot26_dj_stage_family_dance', 'site/dj-stage-family-dance.jpg', '/photos/dj-stage-family-dance.jpg', 'image/jpeg', 1600, 1920, 'Family dancing in front of a DJ stage with the groom''s name in lights'),
  ('shoot26_red_vintage_car_white_flowers', 'site/red-vintage-car-white-flowers.jpg', '/photos/red-vintage-car-white-flowers.jpg', 'image/jpeg', 1600, 1280, 'Red vintage car with white flowers and ribbons'),
  ('shoot26_floral_baggi_orchids_day', 'site/floral-baggi-orchids-day.jpg', '/photos/floral-baggi-orchids-day.jpg', 'image/jpeg', 1600, 1067, 'Baggi decorated with orchids and garlands in daylight'),
  ('shoot26_groom_celebrating_baraat', 'site/groom-celebrating-baraat.jpg', '/photos/groom-celebrating-baraat.jpg', 'image/jpeg', 1600, 2400, 'Groom in a printed sherwani and safa celebrating at his baraat'),
  ('shoot26_floral_baggi_garlands', 'site/floral-baggi-garlands.jpg', '/photos/floral-baggi-garlands.jpg', 'image/jpeg', 1600, 1067, 'Baggi covered in flower garlands');

INSERT INTO `GalleryItem` (`id`, `type`, `category`, `mediaId`, `serviceId`, `order`, `published`, `updatedAt`)
SELECT 'shoot26_g_groom_chattar_sparklers', 'IMAGE', 'CARS_CHATTAR', m.`id`, (SELECT s.`id` FROM `Service` s WHERE s.`slug` = 'flower-chattar'), -26, 1, NOW(3)
FROM `Media` m WHERE m.`key` = 'site/groom-chattar-sparklers.jpg'
  AND NOT EXISTS (SELECT 1 FROM `GalleryItem` g WHERE g.`mediaId` = m.`id`);
INSERT INTO `GalleryItem` (`id`, `type`, `category`, `mediaId`, `serviceId`, `order`, `published`, `updatedAt`)
SELECT 'shoot26_g_red_vintage_car_pink_flowers', 'IMAGE', 'CARS_CHATTAR', m.`id`, (SELECT s.`id` FROM `Service` s WHERE s.`slug` = 'vintage-cars'), -25, 1, NOW(3)
FROM `Media` m WHERE m.`key` = 'site/red-vintage-car-pink-flowers.jpg'
  AND NOT EXISTS (SELECT 1 FROM `GalleryItem` g WHERE g.`mediaId` = m.`id`);
INSERT INTO `GalleryItem` (`id`, `type`, `category`, `mediaId`, `serviceId`, `order`, `published`, `updatedAt`)
SELECT 'shoot26_g_band_navy_gold_uniform', 'IMAGE', 'BAND', m.`id`, (SELECT s.`id` FROM `Service` s WHERE s.`slug` = 'brass-band-baraat'), -24, 1, NOW(3)
FROM `Media` m WHERE m.`key` = 'site/band-navy-gold-uniform.jpg'
  AND NOT EXISTS (SELECT 1 FROM `GalleryItem` g WHERE g.`mediaId` = m.`id`);
INSERT INTO `GalleryItem` (`id`, `type`, `category`, `mediaId`, `serviceId`, `order`, `published`, `updatedAt`)
SELECT 'shoot26_g_dj_name_board_cold_pyro', 'IMAGE', 'LIGHTING', m.`id`, (SELECT s.`id` FROM `Service` s WHERE s.`slug` = 'dj-on-wheels'), -23, 1, NOW(3)
FROM `Media` m WHERE m.`key` = 'site/dj-name-board-cold-pyro.jpg'
  AND NOT EXISTS (SELECT 1 FROM `GalleryItem` g WHERE g.`mediaId` = m.`id`);
INSERT INTO `GalleryItem` (`id`, `type`, `category`, `mediaId`, `serviceId`, `order`, `published`, `updatedAt`)
SELECT 'shoot26_g_floral_baggi_night_orchids', 'IMAGE', 'CARS_CHATTAR', m.`id`, (SELECT s.`id` FROM `Service` s WHERE s.`slug` = 'baggi'), -22, 1, NOW(3)
FROM `Media` m WHERE m.`key` = 'site/floral-baggi-night-orchids.jpg'
  AND NOT EXISTS (SELECT 1 FROM `GalleryItem` g WHERE g.`mediaId` = m.`id`);
INSERT INTO `GalleryItem` (`id`, `type`, `category`, `mediaId`, `serviceId`, `order`, `published`, `updatedAt`)
SELECT 'shoot26_g_groomsmen_blue_pagdis', 'IMAGE', 'BARAAT', m.`id`, (SELECT s.`id` FROM `Service` s WHERE s.`slug` = 'pagdi'), -21, 1, NOW(3)
FROM `Media` m WHERE m.`key` = 'site/groomsmen-blue-pagdis.jpg'
  AND NOT EXISTS (SELECT 1 FROM `GalleryItem` g WHERE g.`mediaId` = m.`id`);
INSERT INTO `GalleryItem` (`id`, `type`, `category`, `mediaId`, `serviceId`, `order`, `published`, `updatedAt`)
SELECT 'shoot26_g_white_vintage_car_roses', 'IMAGE', 'CARS_CHATTAR', m.`id`, (SELECT s.`id` FROM `Service` s WHERE s.`slug` = 'vintage-cars'), -20, 1, NOW(3)
FROM `Media` m WHERE m.`key` = 'site/white-vintage-car-roses.jpg'
  AND NOT EXISTS (SELECT 1 FROM `GalleryItem` g WHERE g.`mediaId` = m.`id`);
INSERT INTO `GalleryItem` (`id`, `type`, `category`, `mediaId`, `serviceId`, `order`, `published`, `updatedAt`)
SELECT 'shoot26_g_band_umbrella_lights_procession', 'IMAGE', 'BAND', m.`id`, (SELECT s.`id` FROM `Service` s WHERE s.`slug` = 'brass-band-baraat'), -19, 1, NOW(3)
FROM `Media` m WHERE m.`key` = 'site/band-umbrella-lights-procession.jpg'
  AND NOT EXISTS (SELECT 1 FROM `GalleryItem` g WHERE g.`mediaId` = m.`id`);
INSERT INTO `GalleryItem` (`id`, `type`, `category`, `mediaId`, `serviceId`, `order`, `published`, `updatedAt`)
SELECT 'shoot26_g_groom_on_ghodi', 'IMAGE', 'CARS_CHATTAR', m.`id`, (SELECT s.`id` FROM `Service` s WHERE s.`slug` = 'ghodi'), -18, 1, NOW(3)
FROM `Media` m WHERE m.`key` = 'site/groom-on-ghodi.jpg'
  AND NOT EXISTS (SELECT 1 FROM `GalleryItem` g WHERE g.`mediaId` = m.`id`);
INSERT INTO `GalleryItem` (`id`, `type`, `category`, `mediaId`, `serviceId`, `order`, `published`, `updatedAt`)
SELECT 'shoot26_g_dj_truck_led_screens', 'IMAGE', 'LIGHTING', m.`id`, (SELECT s.`id` FROM `Service` s WHERE s.`slug` = 'dj-on-wheels'), -17, 1, NOW(3)
FROM `Media` m WHERE m.`key` = 'site/dj-truck-led-screens.jpg'
  AND NOT EXISTS (SELECT 1 FROM `GalleryItem` g WHERE g.`mediaId` = m.`id`);
INSERT INTO `GalleryItem` (`id`, `type`, `category`, `mediaId`, `serviceId`, `order`, `published`, `updatedAt`)
SELECT 'shoot26_g_wedding_baggi_yellow_flowers', 'IMAGE', 'CARS_CHATTAR', m.`id`, (SELECT s.`id` FROM `Service` s WHERE s.`slug` = 'baggi'), -16, 1, NOW(3)
FROM `Media` m WHERE m.`key` = 'site/wedding-baggi-yellow-flowers.jpg'
  AND NOT EXISTS (SELECT 1 FROM `GalleryItem` g WHERE g.`mediaId` = m.`id`);
INSERT INTO `GalleryItem` (`id`, `type`, `category`, `mediaId`, `serviceId`, `order`, `published`, `updatedAt`)
SELECT 'shoot26_g_groom_pastel_pagdi_baraat', 'IMAGE', 'BARAAT', m.`id`, (SELECT s.`id` FROM `Service` s WHERE s.`slug` = 'pagdi'), -15, 1, NOW(3)
FROM `Media` m WHERE m.`key` = 'site/groom-pastel-pagdi-baraat.jpg'
  AND NOT EXISTS (SELECT 1 FROM `GalleryItem` g WHERE g.`mediaId` = m.`id`);
INSERT INTO `GalleryItem` (`id`, `type`, `category`, `mediaId`, `serviceId`, `order`, `published`, `updatedAt`)
SELECT 'shoot26_g_red_vintage_car_umbrellas', 'IMAGE', 'CARS_CHATTAR', m.`id`, (SELECT s.`id` FROM `Service` s WHERE s.`slug` = 'vintage-cars'), -14, 1, NOW(3)
FROM `Media` m WHERE m.`key` = 'site/red-vintage-car-umbrellas.jpg'
  AND NOT EXISTS (SELECT 1 FROM `GalleryItem` g WHERE g.`mediaId` = m.`id`);
INSERT INTO `GalleryItem` (`id`, `type`, `category`, `mediaId`, `serviceId`, `order`, `published`, `updatedAt`)
SELECT 'shoot26_g_band_uniforms_white_red', 'IMAGE', 'BAND', m.`id`, (SELECT s.`id` FROM `Service` s WHERE s.`slug` = 'brass-band-baraat'), -13, 1, NOW(3)
FROM `Media` m WHERE m.`key` = 'site/band-uniforms-white-red.jpg'
  AND NOT EXISTS (SELECT 1 FROM `GalleryItem` g WHERE g.`mediaId` = m.`id`);
INSERT INTO `GalleryItem` (`id`, `type`, `category`, `mediaId`, `serviceId`, `order`, `published`, `updatedAt`)
SELECT 'shoot26_g_dj_truck_flower_arch', 'IMAGE', 'LIGHTING', m.`id`, (SELECT s.`id` FROM `Service` s WHERE s.`slug` = 'dj-on-wheels'), -12, 1, NOW(3)
FROM `Media` m WHERE m.`key` = 'site/dj-truck-flower-arch.jpg'
  AND NOT EXISTS (SELECT 1 FROM `GalleryItem` g WHERE g.`mediaId` = m.`id`);
INSERT INTO `GalleryItem` (`id`, `type`, `category`, `mediaId`, `serviceId`, `order`, `published`, `updatedAt`)
SELECT 'shoot26_g_lit_floral_baggi_canopy', 'IMAGE', 'CARS_CHATTAR', m.`id`, (SELECT s.`id` FROM `Service` s WHERE s.`slug` = 'baggi'), -11, 1, NOW(3)
FROM `Media` m WHERE m.`key` = 'site/lit-floral-baggi-canopy.jpg'
  AND NOT EXISTS (SELECT 1 FROM `GalleryItem` g WHERE g.`mediaId` = m.`id`);
INSERT INTO `GalleryItem` (`id`, `type`, `category`, `mediaId`, `serviceId`, `order`, `published`, `updatedAt`)
SELECT 'shoot26_g_groom_press_interview', 'IMAGE', 'BARAAT', m.`id`, (SELECT s.`id` FROM `Service` s WHERE s.`slug` = 'custom-baraat'), -10, 1, NOW(3)
FROM `Media` m WHERE m.`key` = 'site/groom-press-interview.jpg'
  AND NOT EXISTS (SELECT 1 FROM `GalleryItem` g WHERE g.`mediaId` = m.`id`);
INSERT INTO `GalleryItem` (`id`, `type`, `category`, `mediaId`, `serviceId`, `order`, `published`, `updatedAt`)
SELECT 'shoot26_g_groom_white_vintage_car', 'IMAGE', 'CARS_CHATTAR', m.`id`, (SELECT s.`id` FROM `Service` s WHERE s.`slug` = 'vintage-cars'), -9, 1, NOW(3)
FROM `Media` m WHERE m.`key` = 'site/groom-white-vintage-car.jpg'
  AND NOT EXISTS (SELECT 1 FROM `GalleryItem` g WHERE g.`mediaId` = m.`id`);
INSERT INTO `GalleryItem` (`id`, `type`, `category`, `mediaId`, `serviceId`, `order`, `published`, `updatedAt`)
SELECT 'shoot26_g_smoke_effects_baraat_dance', 'IMAGE', 'LIGHTING', m.`id`, (SELECT s.`id` FROM `Service` s WHERE s.`slug` = 'sfx-effects'), -8, 1, NOW(3)
FROM `Media` m WHERE m.`key` = 'site/smoke-effects-baraat-dance.jpg'
  AND NOT EXISTS (SELECT 1 FROM `GalleryItem` g WHERE g.`mediaId` = m.`id`);
INSERT INTO `GalleryItem` (`id`, `type`, `category`, `mediaId`, `serviceId`, `order`, `published`, `updatedAt`)
SELECT 'shoot26_g_floral_baggi_gurgaon', 'IMAGE', 'CARS_CHATTAR', m.`id`, (SELECT s.`id` FROM `Service` s WHERE s.`slug` = 'baggi'), -7, 1, NOW(3)
FROM `Media` m WHERE m.`key` = 'site/floral-baggi-gurgaon.jpg'
  AND NOT EXISTS (SELECT 1 FROM `GalleryItem` g WHERE g.`mediaId` = m.`id`);
INSERT INTO `GalleryItem` (`id`, `type`, `category`, `mediaId`, `serviceId`, `order`, `published`, `updatedAt`)
SELECT 'shoot26_g_groom_floral_safa', 'IMAGE', 'BARAAT', m.`id`, (SELECT s.`id` FROM `Service` s WHERE s.`slug` = 'pagdi'), -6, 1, NOW(3)
FROM `Media` m WHERE m.`key` = 'site/groom-floral-safa.jpg'
  AND NOT EXISTS (SELECT 1 FROM `GalleryItem` g WHERE g.`mediaId` = m.`id`);
INSERT INTO `GalleryItem` (`id`, `type`, `category`, `mediaId`, `serviceId`, `order`, `published`, `updatedAt`)
SELECT 'shoot26_g_dj_stage_family_dance', 'IMAGE', 'LIGHTING', m.`id`, (SELECT s.`id` FROM `Service` s WHERE s.`slug` = 'dj-on-wheels'), -5, 1, NOW(3)
FROM `Media` m WHERE m.`key` = 'site/dj-stage-family-dance.jpg'
  AND NOT EXISTS (SELECT 1 FROM `GalleryItem` g WHERE g.`mediaId` = m.`id`);
INSERT INTO `GalleryItem` (`id`, `type`, `category`, `mediaId`, `serviceId`, `order`, `published`, `updatedAt`)
SELECT 'shoot26_g_red_vintage_car_white_flowers', 'IMAGE', 'CARS_CHATTAR', m.`id`, (SELECT s.`id` FROM `Service` s WHERE s.`slug` = 'vintage-cars'), -4, 1, NOW(3)
FROM `Media` m WHERE m.`key` = 'site/red-vintage-car-white-flowers.jpg'
  AND NOT EXISTS (SELECT 1 FROM `GalleryItem` g WHERE g.`mediaId` = m.`id`);
INSERT INTO `GalleryItem` (`id`, `type`, `category`, `mediaId`, `serviceId`, `order`, `published`, `updatedAt`)
SELECT 'shoot26_g_floral_baggi_orchids_day', 'IMAGE', 'CARS_CHATTAR', m.`id`, (SELECT s.`id` FROM `Service` s WHERE s.`slug` = 'baggi'), -3, 1, NOW(3)
FROM `Media` m WHERE m.`key` = 'site/floral-baggi-orchids-day.jpg'
  AND NOT EXISTS (SELECT 1 FROM `GalleryItem` g WHERE g.`mediaId` = m.`id`);
INSERT INTO `GalleryItem` (`id`, `type`, `category`, `mediaId`, `serviceId`, `order`, `published`, `updatedAt`)
SELECT 'shoot26_g_groom_celebrating_baraat', 'IMAGE', 'BARAAT', m.`id`, (SELECT s.`id` FROM `Service` s WHERE s.`slug` = 'custom-baraat'), -2, 1, NOW(3)
FROM `Media` m WHERE m.`key` = 'site/groom-celebrating-baraat.jpg'
  AND NOT EXISTS (SELECT 1 FROM `GalleryItem` g WHERE g.`mediaId` = m.`id`);
INSERT INTO `GalleryItem` (`id`, `type`, `category`, `mediaId`, `serviceId`, `order`, `published`, `updatedAt`)
SELECT 'shoot26_g_floral_baggi_garlands', 'IMAGE', 'CARS_CHATTAR', m.`id`, (SELECT s.`id` FROM `Service` s WHERE s.`slug` = 'baggi'), -1, 1, NOW(3)
FROM `Media` m WHERE m.`key` = 'site/floral-baggi-garlands.jpg'
  AND NOT EXISTS (SELECT 1 FROM `GalleryItem` g WHERE g.`mediaId` = m.`id`);

COMMIT;
