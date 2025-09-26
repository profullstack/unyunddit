// Tests for guestbook server-side logic
// Testing form handling, validation, and database operations

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { load, actions } from '../../../src/routes/guestbook/+page.server.js';

// Mock the Supabase client
const mockSupabase = {
	from: vi.fn(() => ({
		select: vi.fn().mockReturnThis(),
		order: vi.fn().mockReturnThis(),
		limit: vi.fn().mockResolvedValue({ data: [], error: null }),
		insert: vi.fn().mockResolvedValue({ error: null })
	}))
};

vi.mock('../../../src/lib/supabase.js', () => ({
	supabase: mockSupabase
}));

describe('Guestbook Server Logic', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('load function', () => {
		it('should load guestbook entries successfully', async () => {
			const mockEntries = [
				{
					id: 1,
					name: 'Test User',
					message: 'Test message',
					created_at: '2024-01-01T00:00:00Z'
				}
			];

			mockSupabase.from().limit.mockResolvedValue({
				data: mockEntries,
				error: null
			});

			const result = await load();

			expect(result).toEqual({
				entries: mockEntries,
				error: null
			});

			expect(mockSupabase.from).toHaveBeenCalledWith('guestbook');
		});

		it('should handle database errors gracefully', async () => {
			mockSupabase.from().limit.mockResolvedValue({
				data: null,
				error: { message: 'Database error' }
			});

			const result = await load();

			expect(result).toEqual({
				entries: [],
				error: 'Failed to load guestbook entries'
			});
		});

		it('should handle unexpected errors', async () => {
			mockSupabase.from().limit.mockRejectedValue(new Error('Network error'));

			const result = await load();

			expect(result).toEqual({
				entries: [],
				error: 'An unexpected error occurred'
			});
		});

		it('should limit entries to 50', async () => {
			await load();

			expect(mockSupabase.from().limit).toHaveBeenCalledWith(50);
		});

		it('should order entries by created_at descending', async () => {
			await load();

			expect(mockSupabase.from().order).toHaveBeenCalledWith('created_at', { ascending: false });
		});
	});

	describe('actions.default (form submission)', () => {
		let mockRequest;
		let mockFormData;

		beforeEach(() => {
			mockFormData = new Map();
			mockRequest = {
				formData: vi.fn().mockResolvedValue({
					get: vi.fn((key) => mockFormData.get(key))
				})
			};
		});

		it('should successfully submit valid form data', async () => {
			mockFormData.set('name', 'John Doe');
			mockFormData.set('message', 'Hello world!');

			mockSupabase.from().insert.mockResolvedValue({ error: null });

			const result = await actions.default({ request: mockRequest });

			expect(result).toEqual({
				success: true,
				message: 'Thank you for your message!'
			});

			expect(mockSupabase.from().insert).toHaveBeenCalledWith([{
				name: 'John Doe',
				message: 'Hello world!'
			}]);
		});

		it('should fail when name is missing', async () => {
			mockFormData.set('name', '');
			mockFormData.set('message', 'Hello world!');

			const result = await actions.default({ request: mockRequest });

			expect(result.status).toBe(400);
			expect(result.data.error).toBe('Name is required');
		});

		it('should fail when message is missing', async () => {
			mockFormData.set('name', 'John Doe');
			mockFormData.set('message', '');

			const result = await actions.default({ request: mockRequest });

			expect(result.status).toBe(400);
			expect(result.data.error).toBe('Message is required');
		});

		it('should fail when name is too long', async () => {
			mockFormData.set('name', 'a'.repeat(101));
			mockFormData.set('message', 'Hello world!');

			const result = await actions.default({ request: mockRequest });

			expect(result.status).toBe(400);
			expect(result.data.error).toBe('Name must be 100 characters or less');
		});

		it('should fail when message is too long', async () => {
			mockFormData.set('name', 'John Doe');
			mockFormData.set('message', 'a'.repeat(1001));

			const result = await actions.default({ request: mockRequest });

			expect(result.status).toBe(400);
			expect(result.data.error).toBe('Message must be 1000 characters or less');
		});

		it('should handle database insertion errors', async () => {
			mockFormData.set('name', 'John Doe');
			mockFormData.set('message', 'Hello world!');

			mockSupabase.from().insert.mockResolvedValue({
				error: { message: 'Database error' }
			});

			const result = await actions.default({ request: mockRequest });

			expect(result.status).toBe(500);
			expect(result.data.error).toBe('Failed to save your message. Please try again.');
		});

		it('should handle unexpected errors', async () => {
			mockFormData.set('name', 'John Doe');
			mockFormData.set('message', 'Hello world!');

			mockRequest.formData.mockRejectedValue(new Error('Network error'));

			const result = await actions.default({ request: mockRequest });

			expect(result.status).toBe(500);
			expect(result.data.error).toBe('An unexpected error occurred. Please try again.');
		});

		it('should trim whitespace from inputs', async () => {
			mockFormData.set('name', '  John Doe  ');
			mockFormData.set('message', '  Hello world!  ');

			mockSupabase.from().insert.mockResolvedValue({ error: null });

			await actions.default({ request: mockRequest });

			expect(mockSupabase.from().insert).toHaveBeenCalledWith([{
				name: 'John Doe',
				message: 'Hello world!'
			}]);
		});

		it('should preserve form data on validation errors', async () => {
			mockFormData.set('name', '');
			mockFormData.set('message', 'Hello world!');

			const result = await actions.default({ request: mockRequest });

			expect(result.data.name).toBe('');
			expect(result.data.message).toBe('Hello world!');
		});
	});

	describe('Input Validation Edge Cases', () => {
		let mockRequest;
		let mockFormData;

		beforeEach(() => {
			mockFormData = new Map();
			mockRequest = {
				formData: vi.fn().mockResolvedValue({
					get: vi.fn((key) => mockFormData.get(key))
				})
			};
		});

		it('should handle null form values', async () => {
			mockFormData.set('name', null);
			mockFormData.set('message', null);

			const result = await actions.default({ request: mockRequest });

			expect(result.status).toBe(400);
			expect(result.data.error).toBe('Name is required');
		});

		it('should handle undefined form values', async () => {
			// Don't set any values in mockFormData

			const result = await actions.default({ request: mockRequest });

			expect(result.status).toBe(400);
			expect(result.data.error).toBe('Name is required');
		});

		it('should handle exactly 100 character name', async () => {
			mockFormData.set('name', 'a'.repeat(100));
			mockFormData.set('message', 'Hello world!');

			mockSupabase.from().insert.mockResolvedValue({ error: null });

			const result = await actions.default({ request: mockRequest });

			expect(result.success).toBe(true);
		});

		it('should handle exactly 1000 character message', async () => {
			mockFormData.set('name', 'John Doe');
			mockFormData.set('message', 'a'.repeat(1000));

			mockSupabase.from().insert.mockResolvedValue({ error: null });

			const result = await actions.default({ request: mockRequest });

			expect(result.success).toBe(true);
		});
	});
});