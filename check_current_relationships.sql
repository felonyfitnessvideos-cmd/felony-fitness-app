-- Check current trainer_clients relationships
SELECT 
    tc.*,
    trainer.email as trainer_email,
    client.email as client_email,
    trainer.first_name as trainer_first_name,
    trainer.last_name as trainer_last_name,
    client.first_name as client_first_name,
    client.last_name as client_last_name
FROM trainer_clients tc
LEFT JOIN user_profiles trainer ON trainer.id = tc.trainer_id
LEFT JOIN user_profiles client ON client.id = tc.client_id
ORDER BY tc.created_at DESC;