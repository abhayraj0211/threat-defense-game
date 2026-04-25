-- Forum posts table
CREATE TABLE public.forum_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author_name TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  language TEXT NOT NULL DEFAULT 'en',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read posts"
ON public.forum_posts FOR SELECT
USING (true);

CREATE POLICY "Anyone can create posts"
ON public.forum_posts FOR INSERT
WITH CHECK (true);

-- Forum comments table
CREATE TABLE public.forum_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES public.forum_posts(id) ON DELETE CASCADE,
  author_name TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read comments"
ON public.forum_comments FOR SELECT
USING (true);

CREATE POLICY "Anyone can create comments"
ON public.forum_comments FOR INSERT
WITH CHECK (true);

CREATE INDEX idx_forum_comments_post_id ON public.forum_comments(post_id);
CREATE INDEX idx_forum_posts_created_at ON public.forum_posts(created_at DESC);