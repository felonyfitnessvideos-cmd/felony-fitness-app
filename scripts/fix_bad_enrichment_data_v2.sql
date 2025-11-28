-- SQL to fix bad enrichment data (v2 - corrected)
-- Generated: 2025-11-28
-- Total records to fix: 119

BEGIN;

-- Batch update all 119 records with bad data
UPDATE food_servings 
SET 
  calories = CASE id
    WHEN '2b9d88b7-2f4e-4b53-9358-ed8ad6fee35a' THEN 600  -- Walnuts
    WHEN '2515fb4e-786f-4126-a4e4-3f3985416d15' THEN 350  -- Mozzarella Cheese, Part Skim
    WHEN '225da55c-aa72-4ebb-baa0-487e2ae7ee57' THEN 250  -- Tortilla, Corn
    WHEN 'eaf33fa2-ac8a-4489-8a24-e52b2d3e15f9' THEN 250  -- Apricots, Dried
    WHEN 'c23ff658-de07-488f-9c72-a83222dc7452' THEN 600  -- Peanut Butter
    WHEN '8e7dfefa-6ea7-4fa3-81c4-a978ca18fa4d' THEN 370  -- Cheerios
    WHEN '1582e25e-841b-47cc-a7e1-f4755f6f0a85' THEN 250  -- Whole Wheat Bread
    WHEN 'c877e503-a2ef-4c14-805d-3d7c46db233a' THEN 400  -- Pea Protein
    WHEN '3a8c2ea6-6cc4-41ce-aad3-1e02fd3ba7f2' THEN 0    -- Folate
    WHEN '9a84e7b6-4f0e-4067-8cfe-ff012728969e' THEN 100  -- Chondroitin
    WHEN '463d8251-1301-4b1d-bbde-92b39738e6aa' THEN 250  -- Caviar, Black
    WHEN '23b7b672-f3af-4dbe-9952-a83935e2733e' THEN 0    -- Silica
    WHEN '41dd254d-7cac-48c2-beb8-a775c842cb62' THEN 0    -- Alpha-Lipoic Acid
    WHEN '150edd0f-5ee2-43a9-801b-fac0759b3d36' THEN 350  -- Swiss Cheese
    WHEN '7a7a9d43-abce-49d2-8ed4-9c0a4a463414' THEN 350  -- String Cheese, Mozzarella
    WHEN '97f1afc9-9153-44ca-a62e-8e899a75ed7a' THEN 350  -- Whipped Cream
    WHEN 'dceedbf8-6d42-45b6-a722-a714dfbe89fd' THEN 350  -- Sour Cream
    WHEN '764cb135-ee12-47c6-9edb-a5f05eb2f46d' THEN 350  -- Romano Cheese, Grated
    WHEN 'c01b24ff-45bf-49d6-901d-1548b00849f2' THEN 350  -- Queso Fresco
    WHEN '47160e13-5371-4d20-80df-18131a8e6fea' THEN 350  -- Provolone Cheese
    WHEN '5ab77b78-3342-4abb-abbb-481102ee28c5' THEN 350  -- Pepper Jack Cheese
    WHEN '15e72985-1b13-452b-9eaa-967c29419e81' THEN 350  -- Neufchatel Cheese
    WHEN '8d10ba12-118d-4802-9a68-a2eb820f014a' THEN 350  -- Muenster Cheese
    WHEN '10c3bd96-fb1e-4eb6-940d-64acceb95d4e' THEN 350  -- Parmesan Cheese, Grated
    WHEN 'f77e09c7-0bc4-45df-a0e2-5db440263851' THEN 350  -- Paneer Cheese
    WHEN 'df0f55f8-03c0-41bd-8d35-f33a7691bd29' THEN 350  -- Mozzarella Cheese
    WHEN '5dbaf681-7f86-476b-ad31-a5742e879723' THEN 350  -- Mascarpone Cheese
    WHEN 'ba0f598c-f4ff-45a2-80f1-7751ee88eee8' THEN 350  -- Monterey Jack Cheese
    WHEN '6261a87b-9fa2-49f1-a5ef-71c04b33c7b4' THEN 350  -- Limburger Cheese
    WHEN '06616514-1327-4398-a80b-cb1e5564c474' THEN 350  -- Heavy Cream
    WHEN '6b9e83fa-1791-40d3-948b-51528bc0f110' THEN 100  -- Labneh
    WHEN 'cf287a82-c6ac-4196-b92d-243e6983340c' THEN 350  -- Havarti Cheese
    WHEN '8ee70127-3bcc-428a-98a4-ec96c86541cf' THEN 350  -- Goat Cheese, Soft
    WHEN 'dee45de1-3c2d-4d77-acc5-b69254e763e1' THEN 350  -- Gouda Cheese
    WHEN '52c5e187-44fc-4ff5-9e9e-42c9602af632' THEN 350  -- Feta Cheese
    WHEN 'a1370164-6b95-43f6-b820-c158232b0d10' THEN 350  -- Cream Cheese, Low Fat
    WHEN 'd144ea49-3554-4ef4-97d0-53aa68acf822' THEN 350  -- Cream Cheese
    WHEN 'bb686afb-8fa3-4666-a54c-359e62582423' THEN 350  -- Cheddar Cheese, Sharp
    WHEN '7c3d0e06-c0cc-436e-ba88-797b3ff7ad9f' THEN 900  -- Butter, Unsalted
    WHEN '63b2f2bf-c8ae-4754-a20d-0e4a1d18e013' THEN 350  -- Blue Cheese
    WHEN '71d2a3e9-6ba8-4276-bc7f-0daf6596e01b' THEN 350  -- Asiago Cheese
    WHEN 'b25037bf-2964-4f0f-ba22-5e77c1f39e24' THEN 350  -- Burrata Cheese
    WHEN '1b1011f7-f634-4e8f-82b6-6873814db86b' THEN 350  -- Brie Cheese
    WHEN 'efcb11df-8d17-4e01-913f-0b8955167638' THEN 360  -- Flour, Coconut
    WHEN '5b105bf8-a8de-4096-abd2-0775d3d7db9c' THEN 350  -- American Cheese, Processed
    WHEN '2c2041c2-d9ca-4ea9-ab62-7796fabe378d' THEN 250  -- Waffle Mix, Whole Grain
    WHEN '3dc54415-d63e-48ee-9c8a-a31c3c3b28f1' THEN 250  -- Tortilla, Flour
    WHEN '6a5b33fc-b2b1-4d23-be2b-8d007757ce6d' THEN 380  -- Rice Cakes, Brown Rice
    WHEN 'a16f1222-61b8-48e6-9e1f-90d7a048347e' THEN 250  -- Pancake Mix, Whole Grain
    WHEN '7eb00b21-26f5-4584-923e-75107983dd17' THEN 370  -- Cereal, Bran Flakes
    WHEN 'bd3ee104-50cf-4b38-a4d7-d0a537b211ff' THEN 250  -- Bread, White Sliced
    WHEN '7f2bd982-f7db-4e40-8091-650fa67465d7' THEN 250  -- Bread, Sourdough
    WHEN 'f9d80e20-607d-4e70-ba51-d494f933a680' THEN 250  -- Bread, Whole Wheat
    WHEN 'af22e4ec-841a-4454-a8ab-6bc7a2271d6a' THEN 250  -- Bread, Rye
    WHEN '4c53c5a7-2c46-4d4f-9b04-56e4da46933f' THEN 250  -- Bread, Pumpernickel
    WHEN '2b0f191e-42ae-4ddb-aad1-eb47fe5fd575' THEN 360  -- Flour, Almond
    WHEN '4129ea60-fa66-4274-b717-b805ff9dacab' THEN 400  -- NAC
    WHEN '01550b14-4e28-4b39-ad6f-8687cd8b95a2' THEN 900  -- Omega-3
    WHEN '4722a24b-b53f-425f-af19-aab7a9e35257' THEN 250  -- Anchovies
    WHEN '0d0fc77f-375a-4943-bbaa-1a704a4587f6' THEN 400  -- Protein Powder, Plant
    WHEN '6172e3d9-dbed-461f-b8f4-faaa0f33e4f6' THEN 0    -- Copper
    WHEN '2550ee87-b138-44bf-ac49-a1e89fd897f2' THEN 400  -- Crackers, Whole Wheat
    WHEN 'dec5baec-a7bc-41b9-9f87-6c0d4efcd2d9' THEN 100  -- Glucosamine
    WHEN '97892048-ce34-4d46-8469-f3d22bba14c1' THEN 0    -- Arginine
    WHEN 'f79d8a01-bcc2-47ae-8801-4dca903be041' THEN 0    -- Hyaluronic Acid
    WHEN 'b338f557-df57-4084-bfb6-415c8bb7120f' THEN 400  -- Citrulline Malate
    WHEN '56f5e392-55f6-40d8-85e1-fe45bd32f32c' THEN 400  -- Glutamine Powder
    WHEN 'a74255f6-cb50-40d2-ba7a-8ca0417123b9' THEN 0    -- Calcium
    WHEN 'd08edb5f-f5ea-4cca-b5d8-c1d32543bf82' THEN 0    -- Caffeine Pills
    WHEN 'aa477991-bf2d-4d8a-a1da-5e0e402e9bac' THEN 100  -- Ashwagandha
    WHEN '1b4928b1-87c6-42de-89e2-e7c859c06d6c' THEN 400  -- BCAA Powder
    WHEN '3b54bb4b-f27c-4f0a-8b31-0ec4c78b5c8d' THEN 250  -- Raisins, Golden
    WHEN 'c6bd393d-32b4-4331-b43b-64c2a425b911' THEN 100  -- Passion Fruit
    WHEN '95d2dac3-a720-49da-a8f3-dfc74e31b890' THEN 100  -- Poblano Peppers
    WHEN '4f5fb4d1-5629-425d-9753-a64eda2c73b8' THEN 0    -- Vitamin K2
    WHEN '367dd389-4299-40f4-9092-6d9c88d42fd8' THEN 0    -- Melatonin
    WHEN '30d73414-f66b-4b1d-b599-919f3e747731' THEN 250  -- Salmon Roe
    WHEN '855e7567-6e71-4e45-9503-0229e45c0bee' THEN 0    -- Zinc
    WHEN 'c2763497-57a4-42a9-873a-f0b94d0ce1c8' THEN 0    -- Vitamin B12
    WHEN '65fafe5f-a428-438f-ac1b-da3a56725c94' THEN 100  -- Probiotics
    WHEN '80eadcd2-7053-4ba1-ba12-80fe9caba9c3' THEN 0    -- Rhodiola Rosea
    WHEN '7fab6922-13ba-4640-aa07-6bd5938fc90f' THEN 0    -- Vitamin D3
    WHEN '21b7c492-2ec4-44f9-950e-d5db3c5fb9a4' THEN 0    -- Vitamin E
    WHEN '34da900d-9be7-4d36-90b5-fefaf378e7ea' THEN 100  -- Chlorella
    WHEN 'd0e6a4c9-d9f0-46bc-9813-42827be7e629' THEN 400  -- Collagen Powder
    WHEN 'bc662c38-5ca5-4448-be44-b722198e1ec9' THEN 100  -- Serrano Peppers
    WHEN 'd060dcae-42f2-457c-863b-ab39a01da3b2' THEN 100  -- Shallots, Fresh
    WHEN '7a9b3664-fddb-4fb5-8462-041022326469' THEN 250  -- Ezekiel Bread
    WHEN '189f58b4-24a0-411c-8caa-70b24fbe99a5' THEN 250  -- Prunes, Dried
    WHEN 'bccc4d2f-30dd-42ca-9388-223a9329fe9d' THEN 370  -- Instant Oats, Dry
    WHEN '1bd220bf-075f-412f-92d0-f91e26612600' THEN 370  -- Cereal, Granola
    WHEN '2bb93c69-a0fb-4d82-936c-3526cdaaef24' THEN 100  -- Spinach, Fresh
    WHEN 'e9c1231e-2c8e-44f7-9027-6444345681ae' THEN 250  -- Low Carb Tortilla
    WHEN 'df8e6424-8dae-4c77-a17b-3d261f5277ac' THEN 250  -- Whole Wheat Tortilla, 8 inch
    WHEN '427a212e-67e0-43b7-aa53-688c69fbb522' THEN 100  -- Collard Greens
    WHEN 'defe860f-8751-4083-ab39-6a325929f608' THEN 250  -- Pita Bread, Whole Wheat
    WHEN '3cf062b9-05a2-4dd8-a1ec-fb0a6f3fb530' THEN 250  -- English Muffin, Whole Wheat
    WHEN '42e569ff-8a63-434b-9a6e-9e0cb7ff9376' THEN 100  -- Crab Cakes, Frozen
    WHEN '5a4e3048-b65d-4187-888b-8846bc5205ee' THEN 200  -- Ice Cream, Vanilla
    WHEN '8367fcb5-7cfd-46c8-9421-9e01d355427b' THEN 100  -- Lemon, Fresh
    WHEN '289d9221-7253-483a-8903-33a2483c416a' THEN 250  -- Bagel, Plain
    WHEN 'bfe81970-eb43-465f-a420-2fc0ad0abe13' THEN 100  -- Fig, Fresh
    WHEN 'f39f05cf-c207-4e48-b1db-868147e1f36c' THEN 100  -- Swiss Chard
    WHEN '43ab5aa4-47cf-44e0-a262-37f7430757a9' THEN 380  -- Popcorn cake
    WHEN '0a3d88b0-4daa-4083-81ab-b52a550f41ab' THEN 100  -- Star Fruit
    WHEN '644bda4f-5c89-472a-bcd0-78da4a41921e' THEN 100  -- Curcumin
    WHEN '84345d54-b92b-45ac-8dd0-e892d0a05151' THEN 0    -- Vitamin C
    WHEN 'b3b4d00d-b01c-4386-908a-ae5edc469bf5' THEN 0    -- Multivitamin
    WHEN '239bffea-4606-4f2e-9869-da1aa013a72c' THEN 100  -- Resveratrol
    WHEN 'e6dd3780-e523-4616-8a3b-c0fbd5b57b58' THEN 100  -- Quercetin
    WHEN '235c9c31-c632-4845-9083-719790cf91ff' THEN 100  -- Manganese
    WHEN '5fc78945-ea31-4983-a4df-4cfd3953432f' THEN 100  -- Spirulina
    WHEN '6ac7f40f-fab4-4bcb-856b-246e8cbabc04' THEN 0    -- Iron
    WHEN '9004053c-a5cc-43ba-ab8e-1233c0145023' THEN 100  -- Magnesium
    WHEN 'd53992e2-1fa7-40d2-93ab-177487872d36' THEN 100  -- Ginseng
    WHEN '13323bf7-ff0e-4606-ba50-5af960a54a0d' THEN 100  -- Biotin
    WHEN '9066cb43-5b6c-4b3e-a2d7-7c43aa568d79' THEN 100  -- Turmeric
    WHEN 'e024f9f6-3a2f-433d-a870-1c2fa3c4091b' THEN 100  -- Chromium
    WHEN 'db6e6e22-44cd-471c-8d42-dbef780c090e' THEN 100  -- Ginger, Fresh
  END,
  protein_g = NULL,
  carbs_g = NULL,
  fat_g = NULL,
  fiber_g = NULL,
  sugar_g = NULL,
  enrichment_status = NULL,
  quality_score = NULL,
  needs_review = true,
  review_flags = ARRAY['bad_enrichment_data']
WHERE id IN (
  '2b9d88b7-2f4e-4b53-9358-ed8ad6fee35a','2515fb4e-786f-4126-a4e4-3f3985416d15','225da55c-aa72-4ebb-baa0-487e2ae7ee57',
  'eaf33fa2-ac8a-4489-8a24-e52b2d3e15f9','c23ff658-de07-488f-9c72-a83222dc7452','8e7dfefa-6ea7-4fa3-81c4-a978ca18fa4d',
  '1582e25e-841b-47cc-a7e1-f4755f6f0a85','c877e503-a2ef-4c14-805d-3d7c46db233a','3a8c2ea6-6cc4-41ce-aad3-1e02fd3ba7f2',
  '9a84e7b6-4f0e-4067-8cfe-ff012728969e','463d8251-1301-4b1d-bbde-92b39738e6aa','23b7b672-f3af-4dbe-9952-a83935e2733e',
  '41dd254d-7cac-48c2-beb8-a775c842cb62','150edd0f-5ee2-43a9-801b-fac0759b3d36','7a7a9d43-abce-49d2-8ed4-9c0a4a463414',
  '97f1afc9-9153-44ca-a62e-8e899a75ed7a','dceedbf8-6d42-45b6-a722-a714dfbe89fd','764cb135-ee12-47c6-9edb-a5f05eb2f46d',
  'c01b24ff-45bf-49d6-901d-1548b00849f2','47160e13-5371-4d20-80df-18131a8e6fea','5ab77b78-3342-4abb-abbb-481102ee28c5',
  '15e72985-1b13-452b-9eaa-967c29419e81','8d10ba12-118d-4802-9a68-a2eb820f014a','10c3bd96-fb1e-4eb6-940d-64acceb95d4e',
  'f77e09c7-0bc4-45df-a0e2-5db440263851','df0f55f8-03c0-41bd-8d35-f33a7691bd29','5dbaf681-7f86-476b-ad31-a5742e879723',
  'ba0f598c-f4ff-45a2-80f1-7751ee88eee8','6261a87b-9fa2-49f1-a5ef-71c04b33c7b4','06616514-1327-4398-a80b-cb1e5564c474',
  '6b9e83fa-1791-40d3-948b-51528bc0f110','cf287a82-c6ac-4196-b92d-243e6983340c','8ee70127-3bcc-428a-98a4-ec96c86541cf',
  'dee45de1-3c2d-4d77-acc5-b69254e763e1','52c5e187-44fc-4ff5-9e9e-42c9602af632','a1370164-6b95-43f6-b820-c158232b0d10',
  'd144ea49-3554-4ef4-97d0-53aa68acf822','bb686afb-8fa3-4666-a54c-359e62582423','7c3d0e06-c0cc-436e-ba88-797b3ff7ad9f',
  '63b2f2bf-c8ae-4754-a20d-0e4a1d18e013','71d2a3e9-6ba8-4276-bc7f-0daf6596e01b','b25037bf-2964-4f0f-ba22-5e77c1f39e24',
  '1b1011f7-f634-4e8f-82b6-6873814db86b','efcb11df-8d17-4e01-913f-0b8955167638','5b105bf8-a8de-4096-abd2-0775d3d7db9c',
  '2c2041c2-d9ca-4ea9-ab62-7796fabe378d','3dc54415-d63e-48ee-9c8a-a31c3c3b28f1','6a5b33fc-b2b1-4d23-be2b-8d007757ce6d',
  'a16f1222-61b8-48e6-9e1f-90d7a048347e','7eb00b21-26f5-4584-923e-75107983dd17','bd3ee104-50cf-4b38-a4d7-d0a537b211ff',
  '7f2bd982-f7db-4e40-8091-650fa67465d7','f9d80e20-607d-4e70-ba51-d494f933a680','af22e4ec-841a-4454-a8ab-6bc7a2271d6a',
  '4c53c5a7-2c46-4d4f-9b04-56e4da46933f','2b0f191e-42ae-4ddb-aad1-eb47fe5fd575','4129ea60-fa66-4274-b717-b805ff9dacab',
  '01550b14-4e28-4b39-ad6f-8687cd8b95a2','4722a24b-b53f-425f-af19-aab7a9e35257','0d0fc77f-375a-4943-bbaa-1a704a4587f6',
  '6172e3d9-dbed-461f-b8f4-faaa0f33e4f6','2550ee87-b138-44bf-ac49-a1e89fd897f2','dec5baec-a7bc-41b9-9f87-6c0d4efcd2d9',
  '97892048-ce34-4d46-8469-f3d22bba14c1','f79d8a01-bcc2-47ae-8801-4dca903be041','b338f557-df57-4084-bfb6-415c8bb7120f',
  '56f5e392-55f6-40d8-85e1-fe45bd32f32c','a74255f6-cb50-40d2-ba7a-8ca0417123b9','d08edb5f-f5ea-4cca-b5d8-c1d32543bf82',
  'aa477991-bf2d-4d8a-a1da-5e0e402e9bac','1b4928b1-87c6-42de-89e2-e7c859c06d6c','3b54bb4b-f27c-4f0a-8b31-0ec4c78b5c8d',
  'c6bd393d-32b4-4331-b43b-64c2a425b911','95d2dac3-a720-49da-a8f3-dfc74e31b890','4f5fb4d1-5629-425d-9753-a64eda2c73b8',
  '367dd389-4299-40f4-9092-6d9c88d42fd8','30d73414-f66b-4b1d-b599-919f3e747731','855e7567-6e71-4e45-9503-0229e45c0bee',
  'c2763497-57a4-42a9-873a-f0b94d0ce1c8','65fafe5f-a428-438f-ac1b-da3a56725c94','80eadcd2-7053-4ba1-ba12-80fe9caba9c3',
  '7fab6922-13ba-4640-aa07-6bd5938fc90f','21b7c492-2ec4-44f9-950e-d5db3c5fb9a4','34da900d-9be7-4d36-90b5-fefaf378e7ea',
  'd0e6a4c9-d9f0-46bc-9813-42827be7e629','bc662c38-5ca5-4448-be44-b722198e1ec9','d060dcae-42f2-457c-863b-ab39a01da3b2',
  '7a9b3664-fddb-4fb5-8462-041022326469','189f58b4-24a0-411c-8caa-70b24fbe99a5','bccc4d2f-30dd-42ca-9388-223a9329fe9d',
  '1bd220bf-075f-412f-92d0-f91e26612600','2bb93c69-a0fb-4d82-936c-3526cdaaef24','e9c1231e-2c8e-44f7-9027-6444345681ae',
  'df8e6424-8dae-4c77-a17b-3d261f5277ac','427a212e-67e0-43b7-aa53-688c69fbb522','defe860f-8751-4083-ab39-6a325929f608',
  '3cf062b9-05a2-4dd8-a1ec-fb0a6f3fb530','42e569ff-8a63-434b-9a6e-9e0cb7ff9376','5a4e3048-b65d-4187-888b-8846bc5205ee',
  '8367fcb5-7cfd-46c8-9421-9e01d355427b','289d9221-7253-483a-8903-33a2483c416a','bfe81970-eb43-465f-a420-2fc0ad0abe13',
  'f39f05cf-c207-4e48-b1db-868147e1f36c','43ab5aa4-47cf-44e0-a262-37f7430757a9','0a3d88b0-4daa-4083-81ab-b52a550f41ab',
  '644bda4f-5c89-472a-bcd0-78da4a41921e','84345d54-b92b-45ac-8dd0-e892d0a05151','b3b4d00d-b01c-4386-908a-ae5edc469bf5',
  '239bffea-4606-4f2e-9869-da1aa013a72c','e6dd3780-e523-4616-8a3b-c0fbd5b57b58','235c9c31-c632-4845-9083-719790cf91ff',
  '5fc78945-ea31-4983-a4df-4cfd3953432f','6ac7f40f-fab4-4bcb-856b-246e8cbabc04','9004053c-a5cc-43ba-ab8e-1233c0145023',
  'd53992e2-1fa7-40d2-93ab-177487872d36','13323bf7-ff0e-4606-ba50-5af960a54a0d','9066cb43-5b6c-4b3e-a2d7-7c43aa568d79',
  'e024f9f6-3a2f-433d-a870-1c2fa3c4091b','db6e6e22-44cd-471c-8d42-dbef780c090e'
);

COMMIT;

-- Expected result: UPDATE 119
-- This will fix all bad enrichment data and flag them for re-enrichment
