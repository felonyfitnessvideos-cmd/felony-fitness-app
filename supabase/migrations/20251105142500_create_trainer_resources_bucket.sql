-- Create trainer-resources storage bucket for training materials
-- This bucket stores workout templates, nutrition guides, client handouts, and other training resources
-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('trainer-resources', 'trainer-resources', true) ON CONFLICT (id) DO NOTHING;
-- Allow authenticated users to read files
CREATE POLICY "Authenticated users can view trainer resources" ON storage.objects FOR
SELECT TO authenticated USING (bucket_id = 'trainer-resources');
-- Allow trainers (users with 'trainer' tag) to upload files
CREATE POLICY "Trainers can upload trainer resources" ON storage.objects FOR
INSERT TO authenticated WITH CHECK (
        bucket_id = 'trainer-resources'
        AND EXISTS (
            SELECT 1
            FROM user_tags
                JOIN tags ON tags.id = user_tags.tag_id
            WHERE user_tags.user_id = auth.uid()
                AND tags.name = 'Trainer'
        )
    );
-- Allow trainers to update their uploaded files
CREATE POLICY "Trainers can update trainer resources" ON storage.objects FOR
UPDATE TO authenticated USING (
        bucket_id = 'trainer-resources'
        AND EXISTS (
            SELECT 1
            FROM user_tags
                JOIN tags ON tags.id = user_tags.tag_id
            WHERE user_tags.user_id = auth.uid()
                AND tags.name = 'Trainer'
        )
    );
-- Allow trainers to delete files
CREATE POLICY "Trainers can delete trainer resources" ON storage.objects FOR DELETE TO authenticated USING (
    bucket_id = 'trainer-resources'
    AND EXISTS (
        SELECT 1
        FROM user_tags
            JOIN tags ON tags.id = user_tags.tag_id
        WHERE user_tags.user_id = auth.uid()
            AND tags.name = 'Trainer'
    )
);