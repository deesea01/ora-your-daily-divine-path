INSERT INTO storage.buckets (id, name, public)
VALUES ('saint-audio', 'saint-audio', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can read saint audio"
ON storage.objects FOR SELECT
USING (bucket_id = 'saint-audio');