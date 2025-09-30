#!/usr/bin/env node

/**
 * Test script to demonstrate IP detection with simulated proxy headers
 * Run this to test your SvelteKit app's IP detection functionality
 */

import { execSync } from 'child_process';

const BASE_URL = 'http://localhost:3000';

console.log('🧪 Testing IP Detection with Various Proxy Headers\n');

// Test cases with different proxy headers
const testCases = [
	{
		name: 'Direct connection (no headers)',
		headers: {},
		expected: '127.0.0.1'
	},
	{
		name: 'Cloudflare cf-connecting-ip',
		headers: { 'cf-connecting-ip': '203.0.113.100' },
		expected: '203.0.113.100'
	},
	{
		name: 'x-real-ip header',
		headers: { 'x-real-ip': '203.0.113.200' },
		expected: '203.0.113.200'
	},
	{
		name: 'x-forwarded-for with multiple IPs',
		headers: { 'x-forwarded-for': '203.0.113.300, 10.0.0.1, 192.168.1.1' },
		expected: '203.0.113.300'
	},
	{
		name: 'Fly.io fly-client-ip',
		headers: { 'fly-client-ip': '203.0.113.400' },
		expected: '203.0.113.400'
	},
	{
		name: 'Priority test: x-real-ip should win over cf-connecting-ip',
		headers: { 
			'x-real-ip': '203.0.113.500',
			'cf-connecting-ip': '203.0.113.600'
		},
		expected: '203.0.113.500'
	}
];

function runCurlTest(testCase) {
	console.log(`📡 Testing: ${testCase.name}`);
	
	// Build curl command with headers
	let curlCmd = `curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}"`;
	
	for (const [header, value] of Object.entries(testCase.headers)) {
		curlCmd += ` -H "${header}: ${value}"`;
	}
	
	try {
		const statusCode = execSync(curlCmd, { encoding: 'utf8' }).trim();
		console.log(`   Status: ${statusCode}`);
		console.log(`   Expected IP: ${testCase.expected}`);
		console.log(`   Check your server logs for IP detection debug info\n`);
	} catch (error) {
		console.log(`   ❌ Error: ${error.message}\n`);
	}
}

// Run all test cases
testCases.forEach(runCurlTest);

console.log('✅ Test completed! Check your SvelteKit server logs to see the IP detection debug output.');
console.log('\n💡 Tips:');
console.log('   - In development, you\'ll see 127.0.0.1 for direct connections');
console.log('   - In production with a proxy/CDN, you\'ll see the real client IPs');
console.log('   - The debug logs show exactly which header was used');