-- Replace broad public SELECT with one that prevents listing the bucket
DROP POLICY IF EXISTS "Avatars are publicly viewable" ON storage.objects;

-- Allow direct file reads (by full path) but block listing/searching the bucket
CREATE POLICY "Avatars readable by direct path"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'avatars'
  AND name = (current_setting('request.headers', true)::json ->> 'x-object-name')
);

-- Since the bucket is public, the storage API serves files directly via /object/public/...
-- without hitting RLS, so direct image URLs still work in <img> tags.
-- The above policy only governs SQL/list operations.