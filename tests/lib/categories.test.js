import { expect } from 'chai';
import { describe, it } from 'mocha';
import {
  matchCategoryFromUrl,
  matchCategoryFromTitle,
  suggestCategories,
  getAllCategories,
  getCategoryBySlug
} from '../../src/lib/categories.js';

describe('Category Matching Utilities', () => {
  describe('matchCategoryFromUrl', () => {
    it('should match technology category from tech URLs', () => {
      const techUrls = [
        'https://techcrunch.com/article',
        'https://arstechnica.com/gadgets',
        'https://wired.com/story/ai-breakthrough'
      ];
      
      techUrls.forEach(url => {
        const result = matchCategoryFromUrl(url);
        expect(result).to.include('technology');
      });
    });

    it('should match programming category from code-related URLs', () => {
      const codeUrls = [
        'https://github.com/user/repo',
        'https://stackoverflow.com/questions/123',
        'https://dev.to/article-about-javascript'
      ];
      
      codeUrls.forEach(url => {
        const result = matchCategoryFromUrl(url);
        expect(result).to.include('programming');
      });
    });

    it('should match gaming category from gaming URLs', () => {
      const gamingUrls = [
        'https://ign.com/reviews/game',
        'https://gamespot.com/news',
        'https://polygon.com/gaming'
      ];
      
      gamingUrls.forEach(url => {
        const result = matchCategoryFromUrl(url);
        expect(result).to.include('gaming');
      });
    });

    it('should return empty array for unrecognized URLs', () => {
      const result = matchCategoryFromUrl('https://unknown-site.com/random');
      expect(result).to.be.an('array').that.is.empty;
    });

    it('should handle invalid URLs gracefully', () => {
      const result = matchCategoryFromUrl('not-a-url');
      expect(result).to.be.an('array').that.is.empty;
    });
  });

  describe('matchCategoryFromTitle', () => {
    it('should match programming category from code-related titles', () => {
      const titles = [
        'New JavaScript Framework Released',
        'Python vs Java Performance Comparison',
        'How to Debug React Applications'
      ];
      
      titles.forEach(title => {
        const result = matchCategoryFromTitle(title);
        expect(result).to.include('programming');
      });
    });

    it('should match gaming category from game-related titles', () => {
      const titles = [
        'New Video Game Breaking Records',
        'Gaming Industry Trends 2024',
        'Best RPG Games This Year'
      ];
      
      titles.forEach(title => {
        const result = matchCategoryFromTitle(title);
        expect(result).to.include('gaming');
      });
    });

    it('should match multiple categories for broad titles', () => {
      const result = matchCategoryFromTitle('AI Technology in Gaming Industry');
      expect(result).to.include.members(['ai', 'technology', 'gaming']);
    });

    it('should return empty array for generic titles', () => {
      const result = matchCategoryFromTitle('This is a generic title');
      expect(result).to.be.an('array').that.is.empty;
    });

    it('should be case insensitive', () => {
      const result = matchCategoryFromTitle('JAVASCRIPT programming tutorial');
      expect(result).to.include('programming');
    });
  });

  describe('suggestCategories', () => {
    it('should combine URL and title matching', () => {
      const result = suggestCategories({
        url: 'https://github.com/user/ai-project',
        title: 'Machine Learning Algorithm Implementation'
      });
      
      expect(result).to.include.members(['programming', 'ai']);
    });

    it('should deduplicate categories', () => {
      const result = suggestCategories({
        url: 'https://techcrunch.com/ai-news',
        title: 'AI Technology Breakthrough'
      });
      
      // Should not have duplicates
      const unique = [...new Set(result)];
      expect(result).to.have.lengthOf(unique.length);
    });

    it('should work with only URL', () => {
      const result = suggestCategories({
        url: 'https://stackoverflow.com/questions/123'
      });
      
      expect(result).to.include('programming');
    });

    it('should work with only title', () => {
      const result = suggestCategories({
        title: 'Best Cooking Recipes for Beginners'
      });
      
      expect(result).to.include('cooking');
    });

    it('should return empty array when no matches', () => {
      const result = suggestCategories({
        url: 'https://unknown.com',
        title: 'Random content'
      });
      
      expect(result).to.be.an('array').that.is.empty;
    });
  });

  describe('getAllCategories', () => {
    it('should return array of category objects', async () => {
      const categories = await getAllCategories();
      expect(categories).to.be.an('array');
      
      if (categories.length > 0) {
        expect(categories[0]).to.have.property('id');
        expect(categories[0]).to.have.property('name');
        expect(categories[0]).to.have.property('slug');
      }
    });
  });

  describe('getCategoryBySlug', () => {
    it('should return category object for valid slug', async () => {
      const category = await getCategoryBySlug('technology');
      
      if (category) {
        expect(category).to.have.property('id');
        expect(category).to.have.property('name');
        expect(category).to.have.property('slug', 'technology');
      }
    });

    it('should return null for invalid slug', async () => {
      const category = await getCategoryBySlug('non-existent-category');
      expect(category).to.be.null;
    });
  });
});