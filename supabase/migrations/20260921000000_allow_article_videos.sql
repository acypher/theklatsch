-- Retain existing access policies and MIME types while permitting article videos.
-- NULL MIME restrictions already allow all types; preserve that setting.
UPDATE storage.buckets
SET allowed_mime_types = CASE
      WHEN allowed_mime_types IS NULL THEN NULL
      ELSE ARRAY(
        SELECT DISTINCT mime_type
        FROM unnest(allowed_mime_types || ARRAY[
          'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'
        ]::text[]) AS mime_type
      )
    END,
    file_size_limit = CASE
      WHEN file_size_limit IS NULL THEN NULL
      ELSE GREATEST(file_size_limit, 52428800)
    END
WHERE id = 'article-images';
