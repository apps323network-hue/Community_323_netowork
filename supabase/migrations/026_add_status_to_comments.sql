-- Migration: Add status and moderation fields to post_comments
-- Description: Enables soft-delete and moderation for comments

ALTER TABLE public.post_comments 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved',
ADD COLUMN IF NOT EXISTS moderated_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_post_comments_status ON public.post_comments(status);

-- Update existing comments to 'approved' if they are null (though default handles it for new ones)
UPDATE public.post_comments SET status = 'approved' WHERE status IS NULL;
