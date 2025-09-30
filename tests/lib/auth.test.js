import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { register, login, logout, getCurrentUser, isAuthenticated } from '../../src/lib/auth.js';

describe('Authentication utilities', () => {
	let mockCookies;
	let mockSupabase;

	beforeEach(() => {
		// Mock cookies
		mockCookies = {
			set: vi.fn(),
			get: vi.fn(),
			delete: vi.fn()
		};

		// Mock Supabase client
		mockSupabase = {
			rpc: vi.fn()
		};
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('register', () => {
		it('should register a new user successfully', async () => {
			const mockUserId = 'user-123';
			mockSupabase.rpc.mockResolvedValue({
				data: mockUserId,
				error: null
			});

			const result = await register('testuser', 'password123', mockSupabase, mockCookies);

			expect(mockSupabase.rpc).toHaveBeenCalledWith('create_user', {
				p_username: 'testuser',
				p_password: 'password123'
			});
			expect(mockCookies.set).toHaveBeenCalledWith('user_session', mockUserId, {
				path: '/',
				maxAge: 60 * 60 * 24 * 30, // 30 days
				httpOnly: true,
				secure: true,
				sameSite: 'strict'
			});
			expect(result).toEqual({ success: true, userId: mockUserId });
		});

		it('should handle registration errors', async () => {
			mockSupabase.rpc.mockResolvedValue({
				data: null,
				error: { message: 'Username already exists' }
			});

			const result = await register('testuser', 'password123', mockSupabase, mockCookies);

			expect(result).toEqual({
				success: false,
				error: 'Username already exists'
			});
			expect(mockCookies.set).not.toHaveBeenCalled();
		});

		it('should validate username length', async () => {
			const result = await register('ab', 'password123', mockSupabase, mockCookies);

			expect(result).toEqual({
				success: false,
				error: 'Username must be between 3 and 50 characters'
			});
			expect(mockSupabase.rpc).not.toHaveBeenCalled();
		});

		it('should validate password length', async () => {
			const result = await register('testuser', '12345', mockSupabase, mockCookies);

			expect(result).toEqual({
				success: false,
				error: 'Password must be at least 6 characters'
			});
			expect(mockSupabase.rpc).not.toHaveBeenCalled();
		});
	});

	describe('login', () => {
		it('should login user successfully', async () => {
			const mockUserId = 'user-123';
			mockSupabase.rpc.mockResolvedValue({
				data: mockUserId,
				error: null
			});

			const result = await login('testuser', 'password123', mockSupabase, mockCookies);

			expect(mockSupabase.rpc).toHaveBeenCalledWith('verify_user', {
				p_username: 'testuser',
				p_password: 'password123'
			});
			expect(mockCookies.set).toHaveBeenCalledWith('user_session', mockUserId, {
				path: '/',
				maxAge: 60 * 60 * 24 * 30, // 30 days
				httpOnly: true,
				secure: true,
				sameSite: 'strict'
			});
			expect(result).toEqual({ success: true, userId: mockUserId });
		});

		it('should handle invalid credentials', async () => {
			mockSupabase.rpc.mockResolvedValue({
				data: null,
				error: null
			});

			const result = await login('testuser', 'wrongpassword', mockSupabase, mockCookies);

			expect(result).toEqual({
				success: false,
				error: 'Invalid username or password'
			});
			expect(mockCookies.set).not.toHaveBeenCalled();
		});

		it('should handle database errors', async () => {
			mockSupabase.rpc.mockResolvedValue({
				data: null,
				error: { message: 'Database connection failed' }
			});

			const result = await login('testuser', 'password123', mockSupabase, mockCookies);

			expect(result).toEqual({
				success: false,
				error: 'Database connection failed'
			});
		});
	});

	describe('logout', () => {
		it('should logout user successfully', () => {
			logout(mockCookies);

			expect(mockCookies.delete).toHaveBeenCalledWith('user_session', { path: '/' });
		});
	});

	describe('getCurrentUser', () => {
		it('should return user ID from session cookie', () => {
			mockCookies.get.mockReturnValue('user-123');

			const userId = getCurrentUser(mockCookies);

			expect(mockCookies.get).toHaveBeenCalledWith('user_session');
			expect(userId).toBe('user-123');
		});

		it('should return null if no session cookie', () => {
			mockCookies.get.mockReturnValue(undefined);

			const userId = getCurrentUser(mockCookies);

			expect(userId).toBeNull();
		});
	});

	describe('isAuthenticated', () => {
		it('should return true if user is authenticated', () => {
			mockCookies.get.mockReturnValue('user-123');

			const authenticated = isAuthenticated(mockCookies);

			expect(authenticated).toBe(true);
		});

		it('should return false if user is not authenticated', () => {
			mockCookies.get.mockReturnValue(undefined);

			const authenticated = isAuthenticated(mockCookies);

			expect(authenticated).toBe(false);
		});
	});
});