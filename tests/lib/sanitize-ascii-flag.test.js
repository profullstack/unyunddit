import { describe, it, expect } from 'vitest';
import { isAsciiOnly } from '../../src/lib/sanitize.js';

describe('isAsciiOnly', () => {
	it('should return true for ASCII-only text', () => {
		expect(isAsciiOnly('Hello World')).toBe(true);
		expect(isAsciiOnly('Test 123')).toBe(true);
		expect(isAsciiOnly('Special chars: !@#$%^&*()')).toBe(true);
		expect(isAsciiOnly('Line\nbreaks\tand\rspaces')).toBe(true);
	});

	it('should return false for text with non-ASCII characters', () => {
		expect(isAsciiOnly('Hello 🌍')).toBe(false);
		expect(isAsciiOnly('Café')).toBe(false);
		expect(isAsciiOnly('日本語')).toBe(false);
		expect(isAsciiOnly('Hello\u200BWorld')).toBe(false); // zero-width space
	});

	it('should return true for empty or null inputs', () => {
		expect(isAsciiOnly('')).toBe(true);
		expect(isAsciiOnly(null)).toBe(true);
		expect(isAsciiOnly(undefined)).toBe(true);
	});

	it('should handle edge cases', () => {
		expect(isAsciiOnly('   ')).toBe(true); // spaces only
		expect(isAsciiOnly('\n\r\t')).toBe(true); // whitespace only
		expect(isAsciiOnly('A')).toBe(true); // single character
	});
});