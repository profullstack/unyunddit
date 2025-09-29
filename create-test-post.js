import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables
config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function createTestPost() {
  try {
    // First, get a category ID (Technology)
    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select('id')
      .eq('name', 'Technology')
      .single();

    if (catError) {
      console.error('Error fetching category:', catError);
      return;
    }

    // Create a test post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        title: 'Test Post for Voting',
        content: 'This is a test post to verify that upvote and downvote functionality works correctly.',
        category_id: categories.id,
        upvotes: 0,
        downvotes: 0,
        comment_count: 0
      })
      .select()
      .single();

    if (postError) {
      console.error('Error creating post:', postError);
      return;
    }

    console.log('Test post created successfully:', post);
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

createTestPost();