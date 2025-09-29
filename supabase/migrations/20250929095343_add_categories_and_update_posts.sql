-- Add categories table and update posts table to include category support
-- This migration adds 100 default categories and links posts to categories

-- Create categories table
CREATE TABLE IF NOT EXISTS public.categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE CHECK (char_length(name) >= 1 AND char_length(name) <= 50),
    slug TEXT NOT NULL UNIQUE CHECK (char_length(slug) >= 1 AND char_length(slug) <= 50),
    description TEXT CHECK (char_length(description) <= 200),
    post_count INTEGER DEFAULT 0 NOT NULL CHECK (post_count >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add category_id to posts table
ALTER TABLE public.posts 
ADD COLUMN category_id BIGINT REFERENCES public.categories(id) ON DELETE SET NULL;

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_categories_slug ON public.categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_name ON public.categories(name);
CREATE INDEX IF NOT EXISTS idx_posts_category_id ON public.posts(category_id);
CREATE INDEX IF NOT EXISTS idx_posts_category_created ON public.posts(category_id, created_at DESC);

-- Enable RLS for categories
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- Create policies for categories
CREATE POLICY "Anyone can read categories" ON public.categories
    FOR SELECT USING (true);

-- Grant permissions for categories
GRANT SELECT ON public.categories TO anon;
GRANT SELECT ON public.categories TO authenticated;
GRANT USAGE ON SEQUENCE public.categories_id_seq TO anon;
GRANT USAGE ON SEQUENCE public.categories_id_seq TO authenticated;

-- Insert 100 default categories
INSERT INTO public.categories (name, slug, description) VALUES
('Technology', 'technology', 'Latest tech news, gadgets, and innovations'),
('Programming', 'programming', 'Code, development, and software engineering'),
('Science', 'science', 'Scientific discoveries and research'),
('Gaming', 'gaming', 'Video games, reviews, and gaming culture'),
('Movies', 'movies', 'Film discussions, reviews, and cinema'),
('Music', 'music', 'All genres of music and artists'),
('Books', 'books', 'Literature, reading recommendations, and reviews'),
('Sports', 'sports', 'Athletic competitions and sports news'),
('Politics', 'politics', 'Political discussions and current events'),
('News', 'news', 'Breaking news and current affairs'),
('Health', 'health', 'Wellness, fitness, and medical topics'),
('Food', 'food', 'Recipes, restaurants, and culinary discussions'),
('Travel', 'travel', 'Destinations, tips, and travel experiences'),
('Photography', 'photography', 'Photo sharing and photography techniques'),
('Art', 'art', 'Visual arts, paintings, and creative works'),
('History', 'history', 'Historical events and discussions'),
('Philosophy', 'philosophy', 'Philosophical thoughts and debates'),
('Education', 'education', 'Learning, teaching, and academic topics'),
('Business', 'business', 'Entrepreneurship and business discussions'),
('Finance', 'finance', 'Money, investing, and financial advice'),
('Cryptocurrency', 'cryptocurrency', 'Digital currencies and blockchain'),
('Space', 'space', 'Astronomy, space exploration, and cosmos'),
('Environment', 'environment', 'Climate, nature, and environmental issues'),
('Psychology', 'psychology', 'Mental health and psychological topics'),
('Relationships', 'relationships', 'Dating, marriage, and social connections'),
('Parenting', 'parenting', 'Child-rearing and family topics'),
('Pets', 'pets', 'Animal companions and pet care'),
('DIY', 'diy', 'Do-it-yourself projects and crafts'),
('Fashion', 'fashion', 'Style, clothing, and fashion trends'),
('Beauty', 'beauty', 'Skincare, makeup, and beauty tips'),
('Fitness', 'fitness', 'Exercise, workouts, and physical health'),
('Cooking', 'cooking', 'Recipes and cooking techniques'),
('Gardening', 'gardening', 'Plants, growing, and garden care'),
('Cars', 'cars', 'Automobiles, reviews, and automotive topics'),
('Motorcycles', 'motorcycles', 'Bikes, riding, and motorcycle culture'),
('Architecture', 'architecture', 'Building design and architectural marvels'),
('Design', 'design', 'Graphic design, UI/UX, and creative design'),
('Writing', 'writing', 'Creative writing and storytelling'),
('Comedy', 'comedy', 'Humor, jokes, and funny content'),
('Memes', 'memes', 'Internet memes and viral content'),
('Anime', 'anime', 'Japanese animation and manga'),
('Comics', 'comics', 'Comic books and graphic novels'),
('Podcasts', 'podcasts', 'Audio shows and podcast discussions'),
('YouTube', 'youtube', 'Video content and creators'),
('Social Media', 'social-media', 'Platforms and social networking'),
('Internet Culture', 'internet-culture', 'Online trends and digital culture'),
('Startups', 'startups', 'New businesses and entrepreneurship'),
('Career', 'career', 'Job advice and professional development'),
('Freelancing', 'freelancing', 'Independent work and gig economy'),
('Remote Work', 'remote-work', 'Working from home and distributed teams'),
('Productivity', 'productivity', 'Efficiency tips and time management'),
('Minimalism', 'minimalism', 'Simple living and decluttering'),
('Sustainability', 'sustainability', 'Eco-friendly living and green practices'),
('Meditation', 'meditation', 'Mindfulness and mental wellness'),
('Spirituality', 'spirituality', 'Religious and spiritual discussions'),
('Languages', 'languages', 'Learning and practicing languages'),
('Culture', 'culture', 'Cultural topics and traditions'),
('Economics', 'economics', 'Economic theory and market discussions'),
('Law', 'law', 'Legal topics and justice system'),
('Medicine', 'medicine', 'Medical science and healthcare'),
('Engineering', 'engineering', 'Technical engineering topics'),
('Mathematics', 'mathematics', 'Math problems and mathematical concepts'),
('Physics', 'physics', 'Physical sciences and theories'),
('Chemistry', 'chemistry', 'Chemical science and experiments'),
('Biology', 'biology', 'Life sciences and biological topics'),
('Geology', 'geology', 'Earth sciences and geological phenomena'),
('Weather', 'weather', 'Climate and meteorological discussions'),
('Outdoors', 'outdoors', 'Hiking, camping, and outdoor activities'),
('Fishing', 'fishing', 'Angling and fishing techniques'),
('Hunting', 'hunting', 'Hunting sports and wildlife management'),
('Sailing', 'sailing', 'Boating and maritime activities'),
('Aviation', 'aviation', 'Aircraft and flying'),
('Military', 'military', 'Armed forces and defense topics'),
('Vintage', 'vintage', 'Retro items and nostalgia'),
('Collectibles', 'collectibles', 'Collecting hobbies and rare items'),
('Antiques', 'antiques', 'Historical artifacts and old items'),
('Woodworking', 'woodworking', 'Carpentry and wood crafts'),
('Metalworking', 'metalworking', 'Metal crafts and fabrication'),
('Electronics', 'electronics', 'Electronic devices and circuits'),
('Robotics', 'robotics', 'Robots and automation'),
('AI', 'ai', 'Artificial intelligence and machine learning'),
('Data Science', 'data-science', 'Data analysis and statistics'),
('Cybersecurity', 'cybersecurity', 'Information security and privacy'),
('Networking', 'networking', 'Computer networks and connectivity'),
('Linux', 'linux', 'Linux operating system and open source'),
('Apple', 'apple', 'Apple products and ecosystem'),
('Android', 'android', 'Android devices and apps'),
('Web Development', 'web-development', 'Building websites and web apps'),
('Mobile Development', 'mobile-development', 'Creating mobile applications'),
('Game Development', 'game-development', 'Making video games'),
('3D Modeling', '3d-modeling', '3D graphics and modeling'),
('Animation', 'animation', 'Animated content and techniques'),
('Video Editing', 'video-editing', 'Video production and editing'),
('Streaming', 'streaming', 'Live streaming and content creation'),
('Esports', 'esports', 'Competitive gaming and tournaments'),
('Board Games', 'board-games', 'Tabletop games and strategy'),
('Puzzles', 'puzzles', 'Brain teasers and puzzle solving'),
('Magic', 'magic', 'Magic tricks and illusions'),
('Astronomy', 'astronomy', 'Stars, planets, and celestial objects'),
('Rocks and Minerals', 'rocks-minerals', 'Rocks, minerals, and earth formation'),
('Paleontology', 'paleontology', 'Fossils and prehistoric life'),
('Archaeology', 'archaeology', 'Ancient civilizations and artifacts'),
('Anthropology', 'anthropology', 'Human culture and society'),
('Sociology', 'sociology', 'Social behavior and institutions'),
('Urban Planning', 'urban-planning', 'City design and development'),
('Real Estate', 'real-estate', 'Property and housing markets'),
('Insurance', 'insurance', 'Risk management and coverage'),
('Taxes', 'taxes', 'Tax planning and regulations'),
('Retirement', 'retirement', 'Retirement planning and senior topics');

-- Function to update category post count when posts are added/removed
CREATE OR REPLACE FUNCTION update_category_post_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.category_id IS NOT NULL THEN
            UPDATE public.categories 
            SET post_count = post_count + 1 
            WHERE id = NEW.category_id;
        END IF;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        IF OLD.category_id IS NOT NULL THEN
            UPDATE public.categories 
            SET post_count = GREATEST(0, post_count - 1) 
            WHERE id = OLD.category_id;
        END IF;
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        -- Handle category change
        IF OLD.category_id IS DISTINCT FROM NEW.category_id THEN
            -- Decrease count for old category
            IF OLD.category_id IS NOT NULL THEN
                UPDATE public.categories 
                SET post_count = GREATEST(0, post_count - 1) 
                WHERE id = OLD.category_id;
            END IF;
            -- Increase count for new category
            IF NEW.category_id IS NOT NULL THEN
                UPDATE public.categories 
                SET post_count = post_count + 1 
                WHERE id = NEW.category_id;
            END IF;
        END IF;
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update category post counts
CREATE TRIGGER trigger_update_category_post_count
    AFTER INSERT OR UPDATE OR DELETE ON public.posts
    FOR EACH ROW EXECUTE FUNCTION update_category_post_count();