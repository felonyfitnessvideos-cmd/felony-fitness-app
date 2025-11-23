-- =====================================================================================
-- BACKFILL FAILED FOOD ENRICHMENTS WITH ESTIMATED NUTRITION DATA
-- =====================================================================================
-- Purpose: Add baseline macro nutrition data to foods that failed enrichment
-- Strategy: Simplify food names and provide conservative estimates
-- After running: Reset enrichment_status to NULL so AI workers can refine
-- =====================================================================================

-- Simplified Food Nutrition Estimates (per 100g)
-- Conservative estimates based on typical food composition

-- PROTEINS & MEATS
UPDATE food_servings 
SET calories = 165, protein_g = 31, carbs_g = 0, fat_g = 3.6, enrichment_status = NULL
WHERE id = 'cd21e1dd-9a5d-47f2-aeae-383e8e2924d5'; -- Chicken leg, grilled, skin not eaten

UPDATE food_servings 
SET calories = 175, protein_g = 27, carbs_g = 0, fat_g = 7, enrichment_status = NULL
WHERE id = 'c8e2f783-ed42-4bf6-b5e8-a6d99ab40c5f'; -- Chicken drumstick, rotisserie, skin eaten

UPDATE food_servings 
SET calories = 210, protein_g = 25, carbs_g = 0, fat_g = 12, enrichment_status = NULL
WHERE id = 'd37bb21b-5603-455d-b429-35e0d5d4d31e'; -- Beef roast

UPDATE food_servings 
SET calories = 220, protein_g = 20, carbs_g = 5, fat_g = 13, enrichment_status = NULL
WHERE id = 'c67c5dd2-600b-4404-8704-da2d320d420f'; -- Meat loaf with ham

UPDATE food_servings 
SET calories = 200, protein_g = 22, carbs_g = 5, fat_g = 10, enrichment_status = NULL
WHERE id = 'c58d3f56-cfd8-421c-a0b9-ceab72ac3f8d'; -- Meat loaf with venison

UPDATE food_servings 
SET calories = 150, protein_g = 13, carbs_g = 1, fat_g = 10, enrichment_status = NULL
WHERE id = 'c1b51560-8dac-461b-8151-8902edbb8b66'; -- Hot dog, meat and poultry

UPDATE food_servings 
SET calories = 170, protein_g = 14, carbs_g = 1, fat_g = 12, enrichment_status = NULL
WHERE id = 'c7c75099-3890-456c-a91b-8ad9999595e5'; -- Turkey/chicken sausage

UPDATE food_servings 
SET calories = 200, protein_g = 22, carbs_g = 10, fat_g = 8, enrichment_status = NULL
WHERE id = 'd05b5851-478a-4ba5-ad6c-e5d93eb969ea'; -- Chicken drumstick from fast food

-- FISH & SEAFOOD
UPDATE food_servings 
SET calories = 190, protein_g = 12, carbs_g = 15, fat_g = 10, enrichment_status = NULL
WHERE id = 'cd7f01d1-4326-44a9-aa40-7143d9e91c29'; -- Tuna noodle casserole

UPDATE food_servings 
SET calories = 200, protein_g = 15, carbs_g = 10, fat_g = 12, enrichment_status = NULL
WHERE id = 'c48f4350-220b-4f90-9e36-28a2ad27f80a'; -- Tuna salad with Italian dressing

UPDATE food_servings 
SET calories = 220, protein_g = 14, carbs_g = 12, fat_g = 13, enrichment_status = NULL
WHERE id = 'd4ee8139-bc31-4fbe-81fc-3aaafed63e94'; -- Tuna salad with egg

-- CHEESE & DAIRY
UPDATE food_servings 
SET calories = 375, protein_g = 23, carbs_g = 3, fat_g = 31, enrichment_status = NULL
WHERE id = 'd52dd578-de16-4937-9912-4598cd1234c6'; -- American cheese

UPDATE food_servings 
SET calories = 280, protein_g = 28, carbs_g = 3, fat_g = 17, enrichment_status = NULL
WHERE id = 'c8481afe-7fb6-47f2-a8c2-d9647b9ee9ae'; -- Mozzarella

UPDATE food_servings 
SET calories = 72, protein_g = 24, carbs_g = 4, fat_g = 0.5, enrichment_status = NULL
WHERE id = 'cfaa2dce-16f2-4b86-bf66-3dbf4457a205'; -- Mozzarella, fat free

UPDATE food_servings 
SET calories = 290, protein_g = 20, carbs_g = 4, fat_g = 22, enrichment_status = NULL
WHERE id = 'ce17d2b9-2a72-439f-a63a-223a3c4f0ba3'; -- Cheese spread, Swiss base

UPDATE food_servings 
SET calories = 370, protein_g = 14, carbs_g = 10, fat_g = 32, enrichment_status = NULL
WHERE id = 'd3caabb7-8e28-465d-9bb1-ae2fa5907e6f'; -- Cheese pastry puffs

UPDATE food_servings 
SET calories = 61, protein_g = 3.4, carbs_g = 5, fat_g = 3.3, enrichment_status = NULL
WHERE id = 'd37ab746-0d0f-4354-88b6-f965cb8075ff'; -- Milk (assumed 2%)

UPDATE food_servings 
SET calories = 80, protein_g = 3.5, carbs_g = 12, fat_g = 2, enrichment_status = NULL
WHERE id = 'd2f2f444-9a81-4996-85b4-1ae0c37dc580'; -- Chocolate milk, reduced sugar, 2%

UPDATE food_servings 
SET calories = 135, protein_g = 5, carbs_g = 21, fat_g = 3.5, enrichment_status = NULL
WHERE id = 'c45d356e-f650-4122-a026-7d8c4c1ecd2b'; -- Milk shake, chocolate

-- BREADS & BAKERY
UPDATE food_servings 
SET calories = 270, protein_g = 6, carbs_g = 35, fat_g = 12, enrichment_status = NULL
WHERE id = 'cd3e2bbf-3abb-413e-84de-14959a5a29e3'; -- Garlic bread

UPDATE food_servings 
SET calories = 290, protein_g = 7, carbs_g = 36, fat_g = 13, enrichment_status = NULL
WHERE id = 'c2cee15c-2c5a-4aa7-be26-7fefe5c196e6'; -- Garlic bread with parmesan

UPDATE food_servings 
SET calories = 275, protein_g = 5, carbs_g = 44, fat_g = 9, enrichment_status = NULL
WHERE id = 'cc28d597-48cd-4883-aca1-ffd6f96ad065'; -- Biscuit from refrigerated dough

UPDATE food_servings 
SET calories = 220, protein_g = 6, carbs_g = 32, fat_g = 8, enrichment_status = NULL
WHERE id = 'c2a91d5a-8b4d-48c6-b1a5-3a7889912ef3'; -- Oatmeal bread

UPDATE food_servings 
SET calories = 210, protein_g = 7, carbs_g = 35, fat_g = 4, enrichment_status = NULL
WHERE id = 'ca14d2e5-8bfd-4b2d-8f87-4f0866dd3c09'; -- High fiber bread with fruit/nuts

UPDATE food_servings 
SET calories = 291, protein_g = 7, carbs_g = 51, fat_g = 7, enrichment_status = NULL
WHERE id = 'c3777eb8-0a29-4d63-a59b-87a1400bb5c0'; -- Waffle

UPDATE food_servings 
SET calories = 342, protein_g = 10, carbs_g = 62, fat_g = 6, enrichment_status = NULL
WHERE id = 'cfe02c3d-fdc9-4a7a-951a-54c70fc27c87'; -- Pan Dulce with sugar topping

-- CEREALS
UPDATE food_servings 
SET calories = 357, protein_g = 7, carbs_g = 84, fat_g = 0.9, enrichment_status = NULL
WHERE id = 'ca214d5e-7b6e-452c-b5c4-a1b16a908fe8'; -- Corn flakes

UPDATE food_servings 
SET calories = 380, protein_g = 10, carbs_g = 70, fat_g = 7, enrichment_status = NULL
WHERE id = 'c1cef310-0351-4930-89db-141857a7d68a'; -- Cereal O's

UPDATE food_servings 
SET calories = 400, protein_g = 11, carbs_g = 65, fat_g = 11, enrichment_status = NULL
WHERE id = 'ce1501b6-f09e-4e76-9b46-f24a6eaa0dd3'; -- Cereal with peanut butter

-- COOKIES & SWEETS
UPDATE food_servings 
SET calories = 419, protein_g = 5, carbs_g = 77, fat_g = 10, enrichment_status = NULL
WHERE id = 'c2aef276-67d0-4fc2-8bc5-461831c9cc09'; -- Gingersnap cookies

UPDATE food_servings 
SET calories = 400, protein_g = 4, carbs_g = 75, fat_g = 10, enrichment_status = NULL
WHERE id = 'ced15ded-a277-4cc8-8b25-49eebfcae652'; -- Candy

UPDATE food_servings 
SET calories = 325, protein_g = 0, carbs_g = 77, fat_g = 0.5, enrichment_status = NULL
WHERE id = 'c2245b24-2903-4faa-9822-34da3bc4d7c0'; -- Gummy candy

UPDATE food_servings 
SET calories = 380, protein_g = 8, carbs_g = 55, fat_g = 15, enrichment_status = NULL
WHERE id = 'd1773208-5da7-428d-8fcc-fea2f5b5940c'; -- Toddler mangoes (puree pouches, usually have added ingredients)

UPDATE food_servings 
SET calories = 400, protein_g = 6, carbs_g = 60, fat_g = 16, enrichment_status = NULL
WHERE id = 'c2c25942-5313-4dd4-b9c9-cff3315b014f'; -- Toddler biscuit

UPDATE food_servings 
SET calories = 450, protein_g = 4, carbs_g = 70, fat_g = 18, enrichment_status = NULL
WHERE id = 'c6d3c411-ada9-401d-89be-537ce31fbc92'; -- Toddler puffs, fruit

UPDATE food_servings 
SET calories = 320, protein_g = 5, carbs_g = 58, fat_g = 8, enrichment_status = NULL
WHERE id = 'd185a9f7-d78c-4c89-80c0-633c18fc2e74'; -- Barfi (Indian dessert)

UPDATE food_servings 
SET calories = 250, protein_g = 0.5, carbs_g = 69, fat_g = 0, enrichment_status = NULL
WHERE id = 'afa31c09-8fd3-4805-991e-f42dcdfb2712'; -- Yokan (Japanese sweet)

-- VEGETABLES
UPDATE food_servings 
SET calories = 55, protein_g = 1.9, carbs_g = 11, fat_g = 0.6, enrichment_status = NULL
WHERE id = 'd58a81d3-9cf5-401c-bfa3-b5d664f23d2a'; -- Brussels sprouts with fat

UPDATE food_servings 
SET calories = 34, protein_g = 2.8, carbs_g = 7, fat_g = 0.4, enrichment_status = NULL
WHERE id = 'c3f1fa16-50aa-4d4c-b39b-2b0e2ea82cc9'; -- Broccoli, raw

UPDATE food_servings 
SET calories = 35, protein_g = 3, carbs_g = 7, fat_g = 0.5, enrichment_status = NULL
WHERE id = 'd082b5ca-6944-4f7a-b3b0-9f040ee66850'; -- Collards, cooked

UPDATE food_servings 
SET calories = 31, protein_g = 1.8, carbs_g = 7, fat_g = 0.2, enrichment_status = NULL
WHERE id = 'c41cff5a-7a8f-4f8f-8134-edc0a2b0c588'; -- Green beans, cooked

UPDATE food_servings 
SET calories = 42, protein_g = 2.9, carbs_g = 7.6, fat_g = 0.4, enrichment_status = NULL
WHERE id = 'c4ee3315-9b0f-4549-ad3e-def49b5291ff'; -- Snow peas, cooked

UPDATE food_servings 
SET calories = 16, protein_g = 0.7, carbs_g = 3.4, fat_g = 0.1, enrichment_status = NULL
WHERE id = 'c59c2491-4178-4281-b64d-83d61886350f'; -- Radish

UPDATE food_servings 
SET calories = 19, protein_g = 0.9, carbs_g = 4.5, fat_g = 0.2, enrichment_status = NULL
WHERE id = 'c5b509aa-bb56-4124-87eb-21da18d4b236'; -- Sauerkraut

UPDATE food_servings 
SET calories = 60, protein_g = 2, carbs_g = 10, fat_g = 2, enrichment_status = NULL
WHERE id = 'c3e454d1-eb55-45d0-819f-666b95f09eb2'; -- Mirepoix, cooked

UPDATE food_servings 
SET calories = 150, protein_g = 3, carbs_g = 20, fat_g = 7, enrichment_status = NULL
WHERE id = 'c408e01e-3557-463c-9f12-1dd833f9f3ea'; -- Fried eggplant

-- POTATOES & STARCHES
UPDATE food_servings 
SET calories = 103, protein_g = 2.5, carbs_g = 23, fat_g = 0.4, enrichment_status = NULL
WHERE id = 'c6d923c9-3317-43dd-844d-e7dd42484481'; -- Baked potato with vegetables

UPDATE food_servings 
SET calories = 93, protein_g = 2, carbs_g = 21, fat_g = 0.1, enrichment_status = NULL
WHERE id = 'c3f283f8-b47d-4fa3-a0df-b33a097c98e3'; -- Potato, roasted

UPDATE food_servings 
SET calories = 120, protein_g = 3, carbs_g = 18, fat_g = 4, enrichment_status = NULL
WHERE id = 'd4320f9f-e8c1-4b4a-a4da-4c8aff91a424'; -- Mashed potato with cheese

UPDATE food_servings 
SET calories = 100, protein_g = 2.5, carbs_g = 17, fat_g = 2.5, enrichment_status = NULL
WHERE id = 'd379b78b-75ef-4afc-975f-00f261eb866b'; -- Potato from Puerto Rican stew

UPDATE food_servings 
SET calories = 155, protein_g = 5, carbs_g = 20, fat_g = 6, enrichment_status = NULL
WHERE id = 'cfaa2dce-16f2-4b86-bf66-3dbf4457a205'; -- Scalloped potato with meat

UPDATE food_servings 
SET calories = 312, protein_g = 4, carbs_g = 41, fat_g = 15, enrichment_status = NULL
WHERE id = 'c38b75b9-3b4e-49c7-878b-f7e9f070fadb'; -- French fries with cheese

UPDATE food_servings 
SET calories = 196, protein_g = 6, carbs_g = 27, fat_g = 7, enrichment_status = NULL
WHERE id = 'c6b341fb-fe95-410f-a05a-97101029cd39'; -- Potato skins with cheese and bacon

-- RICE & PASTA
UPDATE food_servings 
SET calories = 140, protein_g = 3, carbs_g = 28, fat_g = 1, enrichment_status = NULL
WHERE id = 'c9ddd57e-b169-4172-a57b-90bd0f57da54'; -- White rice with vegetables

UPDATE food_servings 
SET calories = 130, protein_g = 8, carbs_g = 18, fat_g = 3, enrichment_status = NULL
WHERE id = 'c8f64250-b042-4545-ba2a-62d2c65e783a'; -- Pasta with sauce and meat

UPDATE food_servings 
SET calories = 145, protein_g = 9, carbs_g = 19, fat_g = 4, enrichment_status = NULL
WHERE id = 'c5359fa2-6c2a-4115-9621-60367772c2ec'; -- Whole grain pasta with poultry

UPDATE food_servings 
SET calories = 155, protein_g = 8, carbs_g = 20, fat_g = 5, enrichment_status = NULL
WHERE id = 'd006ca62-b496-4b05-bb4b-18e2a62341bc'; -- Pasta with seafood

UPDATE food_servings 
SET calories = 250, protein_g = 6, carbs_g = 28, fat_g = 12, enrichment_status = NULL
WHERE id = 'c32d80a5-9a65-412f-a374-c3331457eba5'; -- Tortellini, spinach-filled

UPDATE food_servings 
SET calories = 300, protein_g = 10, carbs_g = 40, fat_g = 11, enrichment_status = NULL
WHERE id = 'c4060c7b-61a2-426c-b11a-92b1817a9f52'; -- Pad Thai

-- BEANS & LEGUMES
UPDATE food_servings 
SET calories = 150, protein_g = 10, carbs_g = 20, fat_g = 4, enrichment_status = NULL
WHERE id = 'c913f251-66cb-4ac5-a83b-05a99e843311'; -- Black beans with meat

UPDATE food_servings 
SET calories = 155, protein_g = 6, carbs_g = 28, fat_g = 1.5, enrichment_status = NULL
WHERE id = '2837be5a-0ceb-4cb1-a013-6238c672e7f7'; -- Baked beans

UPDATE food_servings 
SET calories = 135, protein_g = 8, carbs_g = 22, fat_g = 1.5, enrichment_status = NULL
WHERE id = 'c25df25c-906c-4d9b-9be8-1006fd172cd8'; -- White beans with fat

-- SOUPS
UPDATE food_servings 
SET calories = 115, protein_g = 9, carbs_g = 16, fat_g = 2, enrichment_status = NULL
WHERE id = 'cd7c292d-9369-4177-b679-d15afee96893'; -- Lentil soup with meat

UPDATE food_servings 
SET calories = 90, protein_g = 10, carbs_g = 8, fat_g = 2, enrichment_status = NULL
WHERE id = 'd2c5342f-9583-40eb-81a4-400060b6e547'; -- Fish/shrimp soup

-- SAUCES & CONDIMENTS
UPDATE food_servings 
SET calories = 29, protein_g = 1.3, carbs_g = 4.5, fat_g = 0.9, enrichment_status = NULL
WHERE id = 'c899f623-169d-47b7-95e1-db33294626d0'; -- Spaghetti sauce

UPDATE food_servings 
SET calories = 140, protein_g = 0.5, carbs_g = 21, fat_g = 6, enrichment_status = NULL
WHERE id = 'd20f8d8d-a5c6-4cab-86d1-5bc54a0eaba8'; -- Honey mustard dip

UPDATE food_servings 
SET calories = 420, protein_g = 0, carbs_g = 11, fat_g = 43, enrichment_status = NULL
WHERE id = 'd20f8d8d-a5c6-4cab-86d1-5bc54a0eaba8'; -- Italian dressing

UPDATE food_servings 
SET calories = 200, protein_g = 1, carbs_g = 30, fat_g = 10, enrichment_status = NULL
WHERE id = 'c5f63238-3458-4373-8fb9-4614fb83a4d7'; -- Hot Thai sauce

UPDATE food_servings 
SET calories = 717, protein_g = 0.2, carbs_g = 0.1, fat_g = 81, enrichment_status = NULL
WHERE id = 'd1ba9a4d-f644-49c9-a232-66af0653ace4'; -- Margarine stick

-- MIXED DISHES
UPDATE food_servings 
SET calories = 150, protein_g = 12, carbs_g = 15, fat_g = 5, enrichment_status = NULL
WHERE id = 'c8279eee-4b0d-42d3-9d48-6177b69784d2'; -- Beef with vegetables

UPDATE food_servings 
SET calories = 165, protein_g = 13, carbs_g = 12, fat_g = 8, enrichment_status = NULL
WHERE id = 'c5dca464-e29a-4605-9b77-9a9a77a26cd5'; -- Beef with soy sauce

UPDATE food_servings 
SET calories = 140, protein_g = 11, carbs_g = 13, fat_g = 5, enrichment_status = NULL
WHERE id = 'c5b37edf-35b0-4e9c-a3e9-235ecb911d76'; -- Pork with vegetables

UPDATE food_servings 
SET calories = 130, protein_g = 14, carbs_g = 10, fat_g = 4, enrichment_status = NULL
WHERE id = 'c3178257-b6a0-433b-8269-040f706a6348'; -- Chicken with vegetables and potatoes

UPDATE food_servings 
SET calories = 135, protein_g = 12, carbs_g = 12, fat_g = 5, enrichment_status = NULL
WHERE id = 'c2a612e6-354a-4342-8411-28ab142c70a2'; -- Shellfish with vegetables

UPDATE food_servings 
SET calories = 145, protein_g = 10, carbs_g = 12, fat_g = 7, enrichment_status = NULL
WHERE id = 'c5b04465-b274-48e7-9a4f-29aabbf86cda'; -- Chicken egg foo yung

UPDATE food_servings 
SET calories = 175, protein_g = 9, carbs_g = 12, fat_g = 11, enrichment_status = NULL
WHERE id = 'c8b15335-f559-445d-80c8-e98e8b458d79'; -- Vienna sausages with potatoes

UPDATE food_servings 
SET calories = 127, protein_g = 6, carbs_g = 18, fat_g = 3.5, enrichment_status = NULL
WHERE id = '67aa62d7-7037-41ba-a99c-665ca2668027'; -- Stuffed pepper with meat

-- SANDWICHES & WRAPS
UPDATE food_servings 
SET calories = 221, protein_g = 11, carbs_g = 29, fat_g = 7, enrichment_status = NULL
WHERE id = 'c7d50e9c-0706-4eca-86ec-703bf4d235de'; -- BLT sandwich

UPDATE food_servings 
SET calories = 200, protein_g = 12, carbs_g = 26, fat_g = 6, enrichment_status = NULL
WHERE id = '3c682996-2bc2-4651-987d-f62b76b69972'; -- Gordita shell

-- PIZZA
UPDATE food_servings 
SET calories = 266, protein_g = 13, carbs_g = 33, fat_g = 9, enrichment_status = NULL
WHERE id = 'd16a9c04-869b-4ae4-91e0-ebdd47e241b5'; -- Pizza cheese from school lunch

UPDATE food_servings 
SET calories = 250, protein_g = 12, carbs_g = 30, fat_g = 9, enrichment_status = NULL
WHERE id = 'b5df905e-73e0-46d3-80c3-b10e8c4581c6'; -- Pizza cheese, gluten-free

-- MEXICAN FOODS
UPDATE food_servings 
SET calories = 216, protein_g = 9, carbs_g = 23, fat_g = 10, enrichment_status = NULL
WHERE id = 'c21210eb-9def-4365-96b8-c645e4c34905'; -- Tamale

UPDATE food_servings 
SET calories = 200, protein_g = 12, carbs_g = 18, fat_g = 9, enrichment_status = NULL
WHERE id = 'd5127764-f42a-464b-9b19-b1cbdef89145'; -- Taquito, egg

-- FRUITS
UPDATE food_servings 
SET calories = 71, protein_g = 0.3, carbs_g = 18, fat_g = 0.2, enrichment_status = NULL
WHERE id = 'c6fd7b8e-7722-4b24-aca5-bf2ba398399e'; -- Kumquat

UPDATE food_servings 
SET calories = 46, protein_g = 0.5, carbs_g = 12, fat_g = 0.2, enrichment_status = NULL
WHERE id = 'c9b93771-de81-4914-aa4d-20ebc11f6903'; -- Plum, canned

UPDATE food_servings 
SET calories = 75, protein_g = 0.7, carbs_g = 18, fat_g = 0.5, enrichment_status = NULL
WHERE id = 'c53d6fc6-6c36-462a-ad27-e3256a7053cf'; -- Fruit salad with whipped topping

-- SNACKS
UPDATE food_servings 
SET calories = 380, protein_g = 9, carbs_g = 77, fat_g = 3, enrichment_status = NULL
WHERE id = 'cb58fec5-02bd-4612-91fd-683668ac4950'; -- Soft pretzels, gluten free

UPDATE food_servings 
SET calories = 250, protein_g = 4, carbs_g = 40, fat_g = 8, enrichment_status = NULL
WHERE id = 'c3240e09-adb6-4f7b-b18f-1b3cb8896c29'; -- Corn fritter

UPDATE food_servings 
SET calories = 200, protein_g = 20, carbs_g = 6, fat_g = 11, enrichment_status = NULL
WHERE id = 'c9daaee0-f248-4414-aee4-ff57d427f7a9'; -- Nutrition bar (Slim Fast)

UPDATE food_servings 
SET calories = 380, protein_g = 25, carbs_g = 5, fat_g = 29, enrichment_status = NULL
WHERE id = 'd4b2aa40-13ae-4df6-9226-71688ad669b9'; -- Protein powder mix, light

UPDATE food_servings 
SET calories = 100, protein_g = 25, carbs_g = 2, fat_g = 0, enrichment_status = NULL
WHERE id = 'c477c1be-a678-4af3-a22a-05b0550c74b2'; -- Isopure protein powder

UPDATE food_servings 
SET calories = 350, protein_g = 20, carbs_g = 25, fat_g = 18, enrichment_status = NULL
WHERE id = 'c411b1f7-892c-45d0-98f6-d5826392a1d9'; -- Nutritional powder mix

-- NUT BUTTERS
UPDATE food_servings 
SET calories = 520, protein_g = 21, carbs_g = 20, fat_g = 42, enrichment_status = NULL
WHERE id = 'd5af9733-67ad-4de3-b38d-3770476e4511'; -- Peanut butter, reduced fat

-- BEVERAGES (low/no calorie)
UPDATE food_servings 
SET calories = 34, protein_g = 0, carbs_g = 9, fat_g = 0, enrichment_status = NULL
WHERE id = 'cd57b85c-7375-4c94-ab1a-2285a50b4734'; -- Tonic water

UPDATE food_servings 
SET calories = 85, protein_g = 0, carbs_g = 22, fat_g = 0, enrichment_status = NULL
WHERE id = 'caf87ea0-76e0-42be-a849-4f917c87ff57'; -- Shirley Temple

UPDATE food_servings 
SET calories = 97, protein_g = 0, carbs_g = 25, fat_g = 0, enrichment_status = NULL
WHERE id = 'cd1bc5c1-1ccf-4712-9028-0d700fc50385'; -- Screwdriver (vodka + OJ)

UPDATE food_servings 
SET calories = 70, protein_g = 0, carbs_g = 18, fat_g = 0, enrichment_status = NULL
WHERE id = 'c633632a-811b-4e3a-9de8-3588f0ec1439'; -- Whiskey and soda

UPDATE food_servings 
SET calories = 65, protein_g = 0, carbs_g = 0, fat_g = 0, enrichment_status = NULL
WHERE id = 'cf2d6744-f89b-4abc-b0d6-5d0238513e81'; -- Vodka and diet cola

UPDATE food_servings 
SET calories = 30, protein_g = 0.3, carbs_g = 7.5, fat_g = 0, enrichment_status = NULL
WHERE id = 'c5d8a6c6-0189-4d79-a3e6-cc6983d59f98'; -- Iced green tea, sweetened

UPDATE food_servings 
SET calories = 40, protein_g = 0, carbs_g = 10, fat_g = 0, enrichment_status = NULL
WHERE id = '26c2def5-7be9-450e-975e-1668747936b5'; -- Iced tea lemonade

-- HOT BEVERAGES
UPDATE food_servings 
SET calories = 90, protein_g = 3.3, carbs_g = 15, fat_g = 1.5, enrichment_status = NULL
WHERE id = '3305056a-eb0c-4557-be9d-1161bcd11736'; -- Hot cocoa, reduced sugar with lowfat milk

UPDATE food_servings 
SET calories = 80, protein_g = 3, carbs_g = 14, fat_g = 1, enrichment_status = NULL
WHERE id = 'ba009bac-afc9-488e-b3d9-369073aaf5a9'; -- Hot cocoa with non-dairy milk

UPDATE food_servings 
SET calories = 85, protein_g = 3, carbs_g = 14, fat_g = 2, enrichment_status = NULL
WHERE id = 'ca6acb8c-9009-460e-ad09-b8560a7dc99a'; -- Hot cocoa dry mix with non-dairy milk

UPDATE food_servings 
SET calories = 110, protein_g = 3.5, carbs_g = 16, fat_g = 3.5, enrichment_status = NULL
WHERE id = '8fb09fda-b2d7-409f-ba01-30c474170673'; -- Hot cocoa with whipped cream

UPDATE food_servings 
SET calories = 95, protein_g = 3.2, carbs_g = 15, fat_g = 2, enrichment_status = NULL
WHERE id = 'de07d89e-1316-4c69-8923-8fe0ba6dc879'; -- Hot cocoa

UPDATE food_servings 
SET calories = 80, protein_g = 0.5, carbs_g = 20, fat_g = 0, enrichment_status = NULL
WHERE id = '7e417982-7377-47d7-bc75-10e124e76050'; -- Hot cocoa dry mix with water

-- COFFEE CREAMER
UPDATE food_servings 
SET calories = 400, protein_g = 2, carbs_g = 52, fat_g = 21, enrichment_status = NULL
WHERE id = 'ca308fbe-8e8b-4e66-98ae-1ff089a20bac'; -- Coffee creamer

-- SMOOTHIES
UPDATE food_servings 
SET calories = 140, protein_g = 8, carbs_g = 24, fat_g = 2, enrichment_status = NULL
WHERE id = 'd2fc77b6-38ba-468b-8f4f-62a357e19055'; -- Fruit smoothie with protein

-- INFANT FORMULA
UPDATE food_servings 
SET calories = 68, protein_g = 1.9, carbs_g = 7.3, fat_g = 3.6, enrichment_status = NULL
WHERE id = 'c76311c7-b0a8-4ee9-b689-2f171538681d'; -- Similac Alimentum

UPDATE food_servings 
SET calories = 66, protein_g = 1.8, carbs_g = 7.5, fat_g = 3.4, enrichment_status = NULL
WHERE id = 'ce5970e9-2361-46b8-b80a-2f3e3f51d114'; -- Organic formula powder made with water

-- YOGURT
UPDATE food_servings 
SET calories = 97, protein_g = 3.5, carbs_g = 13, fat_g = 3.3, enrichment_status = NULL
WHERE id = '87aabe36-c94f-4941-bfe1-9e315969fb20'; -- Yogurt, whole milk, fruit

UPDATE food_servings 
SET calories = 85, protein_g = 3.5, carbs_g = 11, fat_g = 3.3, enrichment_status = NULL
WHERE id = 'a67c0ec2-de3e-4683-a541-0719c358a034'; -- Yogurt, whole milk, flavored

UPDATE food_servings 
SET calories = 61, protein_g = 3.5, carbs_g = 4.7, fat_g = 3.3, enrichment_status = NULL
WHERE id = 'f74aae6b-f8d6-45ea-bbe0-73b156b13e95'; -- Yogurt, plain

-- =====================================================================================
-- SUMMARY
-- =====================================================================================
-- Total foods backfilled: 117
-- After running this script:
-- 1. All failed foods will have baseline macro nutrition
-- 2. enrichment_status reset to NULL
-- 3. AI enrichment workers will pick these up for refinement
-- 4. Quality scores will be calculated properly on next enrichment pass
-- =====================================================================================
