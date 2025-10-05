/**
 * Sanitizes text to ASCII-only characters
 * Removes emojis, Unicode characters, and other non-ASCII content
 * Preserves basic ASCII characters (0-127), including letters, numbers, punctuation, and whitespace
 *
 * @param {string|null|undefined} text - The text to sanitize
 * @returns {string} - ASCII-only text
 */
export function sanitizeToAscii(text) {
	// Handle null, undefined, or non-string inputs
	if (!text || typeof text !== 'string') {
		return '';
	}

	// Remove zero-width characters first
	let sanitized = text.replace(/[\u200B-\u200D\uFEFF]/g, '');

	// Keep only ASCII characters (0-127)
	// This includes:
	// - Control characters (0-31) like \n, \r, \t
	// - Printable ASCII (32-126) including letters, numbers, punctuation
	// - DEL character (127)
	sanitized = sanitized.replace(/[^\x00-\x7F]/g, '');

	return sanitized;
}

/**
 * Checks if text contains only ASCII characters
 *
 * @param {string|null|undefined} text - The text to check
 * @returns {boolean} - True if text is ASCII-only, false otherwise
 */
export function isAsciiOnly(text) {
	// Handle null, undefined, or non-string inputs
	if (!text || typeof text !== 'string') {
		return true; // Empty/null is considered ASCII-only
	}

	// Check if all characters are in ASCII range (0-127)
	return /^[\x00-\x7F]*$/.test(text);
}