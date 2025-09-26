// Tests for guestbook Svelte component
// Testing component rendering and functionality

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import GuestbookPage from '../../../src/routes/guestbook/+page.svelte';

describe('Guestbook Page Component', () => {
	const mockData = {
		entries: [
			{
				id: 1,
				name: 'John Doe',
				message: 'Hello world!',
				created_at: '2024-01-01T12:00:00Z'
			},
			{
				id: 2,
				name: 'Jane Smith',
				message: 'Great site!',
				created_at: '2024-01-01T11:00:00Z'
			}
		],
		error: null
	};

	it('should render the page title', () => {
		render(GuestbookPage, { data: mockData });
		
		expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Anonymous Guestbook');
	});

	it('should render the form', () => {
		render(GuestbookPage, { data: mockData });
		
		expect(screen.getByLabelText('Your Name:')).toBeInTheDocument();
		expect(screen.getByLabelText('Your Message:')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Post Message' })).toBeInTheDocument();
	});

	it('should display guestbook entries', () => {
		render(GuestbookPage, { data: mockData });
		
		expect(screen.getByText('John Doe')).toBeInTheDocument();
		expect(screen.getByText('Hello world!')).toBeInTheDocument();
		expect(screen.getByText('Jane Smith')).toBeInTheDocument();
		expect(screen.getByText('Great site!')).toBeInTheDocument();
	});

	it('should display entry count', () => {
		render(GuestbookPage, { data: mockData });
		
		expect(screen.getByText('Recent Messages (2)')).toBeInTheDocument();
	});

	it('should display success message when form is successful', () => {
		const form = { success: true, message: 'Thank you for your message!' };
		render(GuestbookPage, { data: mockData, form });
		
		expect(screen.getByText('✅ Thank you for your message!')).toBeInTheDocument();
	});

	it('should display error message when form has error', () => {
		const form = { error: 'Name is required', name: '', message: 'Test' };
		render(GuestbookPage, { data: mockData, form });
		
		expect(screen.getByText('❌ Name is required')).toBeInTheDocument();
	});

	it('should preserve form values on error', () => {
		const form = { error: 'Name is required', name: 'John', message: 'Test message' };
		render(GuestbookPage, { data: mockData, form });
		
		const nameInput = screen.getByLabelText('Your Name:');
		const messageInput = screen.getByLabelText('Your Message:');
		
		expect(nameInput).toHaveValue('John');
		expect(messageInput).toHaveValue('Test message');
	});

	it('should display no messages text when entries are empty', () => {
		const emptyData = { entries: [], error: null };
		render(GuestbookPage, { data: emptyData });
		
		expect(screen.getByText('No messages yet. Be the first to leave one!')).toBeInTheDocument();
	});

	it('should display data error message', () => {
		const errorData = { entries: [], error: 'Failed to load entries' };
		render(GuestbookPage, { data: errorData });
		
		expect(screen.getByText('❌ Failed to load entries')).toBeInTheDocument();
	});

	it('should have proper form attributes', () => {
		render(GuestbookPage, { data: mockData });
		
		const form = screen.getByRole('form');
		expect(form).toHaveAttribute('method', 'POST');
	});

	it('should have proper input validation attributes', () => {
		render(GuestbookPage, { data: mockData });
		
		const nameInput = screen.getByLabelText('Your Name:');
		const messageInput = screen.getByLabelText('Your Message:');
		
		expect(nameInput).toHaveAttribute('required');
		expect(nameInput).toHaveAttribute('maxlength', '100');
		expect(messageInput).toHaveAttribute('required');
		expect(messageInput).toHaveAttribute('maxlength', '1000');
	});

	it('should format dates correctly', () => {
		render(GuestbookPage, { data: mockData });
		
		// The formatDate function should format the ISO date
		// We can't test the exact output due to timezone differences,
		// but we can verify the date elements are present
		expect(screen.getByText(/January|February|March|April|May|June|July|August|September|October|November|December/)).toBeInTheDocument();
	});

	describe('Accessibility', () => {
		it('should have proper heading hierarchy', () => {
			render(GuestbookPage, { data: mockData });
			
			const h1 = screen.getByRole('heading', { level: 1 });
			const h2Elements = screen.getAllByRole('heading', { level: 2 });
			
			expect(h1).toBeInTheDocument();
			expect(h2Elements.length).toBeGreaterThan(0);
		});

		it('should have proper form labels', () => {
			render(GuestbookPage, { data: mockData });
			
			const nameInput = screen.getByLabelText('Your Name:');
			const messageInput = screen.getByLabelText('Your Message:');
			
			expect(nameInput).toHaveAttribute('id', 'name');
			expect(messageInput).toHaveAttribute('id', 'message');
		});

		it('should have semantic HTML structure', () => {
			render(GuestbookPage, { data: mockData });
			
			expect(screen.getByRole('main')).toBeInTheDocument();
			expect(screen.getByRole('form')).toBeInTheDocument();
		});
	});

	describe('Edge Cases', () => {
		it('should handle missing data gracefully', () => {
			render(GuestbookPage, { data: { entries: null, error: null } });
			
			expect(screen.getByText('Recent Messages (0)')).toBeInTheDocument();
		});

		it('should handle undefined form data', () => {
			render(GuestbookPage, { data: mockData, form: undefined });
			
			// Should render without errors
			expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
		});

		it('should handle entries with missing fields', () => {
			const incompleteData = {
				entries: [
					{ id: 1, name: 'John', message: '', created_at: '2024-01-01T12:00:00Z' },
					{ id: 2, name: '', message: 'Hello', created_at: '2024-01-01T11:00:00Z' }
				],
				error: null
			};
			
			render(GuestbookPage, { data: incompleteData });
			
			expect(screen.getByText('John')).toBeInTheDocument();
			expect(screen.getByText('Hello')).toBeInTheDocument();
		});
	});
});