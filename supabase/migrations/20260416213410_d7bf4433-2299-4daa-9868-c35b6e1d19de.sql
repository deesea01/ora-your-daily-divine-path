DROP POLICY IF EXISTS "Public can read saint audio" ON storage.objects;

CREATE POLICY "Public can download saint audio by name"
ON storage.objects FOR SELECT
USING (bucket_id = 'saint-audio' AND name IS NOT NULL AND length(name) > 0);