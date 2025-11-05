-- Plans table already exists, no need to create it
-- Just ensure it has the basic structure we expect

-- Insert default plans (only if they don't exist)
-- Note: Since plans table already exists, we'll only insert missing plans
INSERT INTO plans (plan_name) 
SELECT 'Sponsored' WHERE NOT EXISTS (SELECT 1 FROM plans WHERE plan_name = 'Sponsored');

INSERT INTO plans (plan_name) 
SELECT 'Monthly' WHERE NOT EXISTS (SELECT 1 FROM plans WHERE plan_name = 'Monthly');

INSERT INTO plans (plan_name) 
SELECT '90 Day Trial' WHERE NOT EXISTS (SELECT 1 FROM plans WHERE plan_name = '90 Day Trial');

INSERT INTO plans (plan_name) 
SELECT 'Income Based' WHERE NOT EXISTS (SELECT 1 FROM plans WHERE plan_name = 'Income Based');

INSERT INTO plans (plan_name) 
SELECT 'Lifetime' WHERE NOT EXISTS (SELECT 1 FROM plans WHERE plan_name = 'Lifetime');

-- No additional setup needed - plans table already exists and working