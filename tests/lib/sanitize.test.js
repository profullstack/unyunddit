import { describe, it, expect } from 'vitest';
import { sanitizeToAscii } from '../../src/lib/sanitize.js';

describe('sanitizeToAscii', () => {
	it('should preserve plain ASCII text', () => {
		const input = 'Hello World! This is a test.';
		expect(sanitizeToAscii(input)).toBe(input);
	});

	it('should remove emoji characters', () => {
		const input = 'Hello 👋 World 🌍!';
		const expected = 'Hello  World !';
		expect(sanitizeToAscii(input)).toBe(expected);
	});

	it('should remove Unicode characters', () => {
		const input = 'Café résumé naïve';
		const expected = 'Caf rsum nave';
		expect(sanitizeToAscii(input)).toBe(expected);
	});

	it('should preserve newlines and common whitespace', () => {
		const input = 'Line 1\nLine 2\r\nLine 3\tTabbed';
		expect(sanitizeToAscii(input)).toBe(input);
	});

	it('should handle mixed content', () => {
		const input = 'Check out this link: https://example.com 🔗\nGreat stuff! 😊';
		const expected = 'Check out this link: https://example.com \nGreat stuff! ';
		expect(sanitizeToAscii(input)).toBe(expected);
	});

	it('should handle empty string', () => {
		expect(sanitizeToAscii('')).toBe('');
	});

	it('should handle null and undefined', () => {
		expect(sanitizeToAscii(null)).toBe('');
		expect(sanitizeToAscii(undefined)).toBe('');
	});

	it('should preserve common punctuation', () => {
		const input = 'Hello! How are you? I\'m fine. (Really) [Yes] {OK}';
		expect(sanitizeToAscii(input)).toBe(input);
	});

	it('should remove zero-width characters', () => {
		const input = 'Hello\u200BWorld\u200C\u200DTest';
		const expected = 'HelloWorldTest';
		expect(sanitizeToAscii(input)).toBe(expected);
	});

	it('should handle Chinese characters', () => {
		const input = '你好世界 Hello World';
		const expected = ' Hello World';
		expect(sanitizeToAscii(input)).toBe(expected);
	});

	it('should handle Arabic characters', () => {
		const input = 'مرحبا Hello';
		const expected = ' Hello';
		expect(sanitizeToAscii(input)).toBe(expected);
	});

	it('should handle Cyrillic characters', () => {
		const input = 'Привет Hello';
		const expected = ' Hello';
		expect(sanitizeToAscii(input)).toBe(expected);
	});

	it('should preserve numbers and special ASCII characters', () => {
		const input = '123 $100 @user #hashtag 50% & more!';
		expect(sanitizeToAscii(input)).toBe(input);
	});

	it('should handle long text with mixed content', () => {
		const input = 'This is a test 测试 with emoji 🎉 and special chars café!';
		const expected = 'This is a test  with emoji  and special chars caf!';
		expect(sanitizeToAscii(input)).toBe(expected);
	});
});