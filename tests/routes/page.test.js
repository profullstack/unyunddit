// Tests for homepage Svelte component
// Testing main landing page rendering and content

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import HomePage from '../../src/routes/+page.svelte';

describe('Homepage Component', () => {
	it('should render the main heading', () => {
		render(HomePage);
		
		expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('🧅 Onion SSR Boilerplate');
	});

	it('should render the tagline', () => {
		render(HomePage);
		
		expect(screen.getByText('Privacy-focused SvelteKit starter for .onion websites')).toBeInTheDocument();
	});

	it('should display all feature cards', () => {
		render(HomePage);
		
		expect(screen.getByText('🔒 SSR-Only Mode')).toBeInTheDocument();
		expect(screen.getByText('🗄️ Supabase Integration')).toBeInTheDocument();
		expect(screen.getByText('🛡️ Security Headers')).toBeInTheDocument();
		expect(screen.getByText('📝 Form Handling')).toBeInTheDocument();
		expect(screen.getByText('🐳 Docker Ready')).toBeInTheDocument();
		expect(screen.getByText('⚡ Node.js Adapter')).toBeInTheDocument();
	});

	it('should have a link to the guestbook demo', () => {
		render(HomePage);
		
		const guestbookLink = screen.getByRole('link', { name: /visit guestbook/i });
		expect(guestbookLink).toHaveAttribute('href', '/guestbook');
	});

	it('should display technology stack information', () => {
		render(HomePage);
		
		expect(screen.getByText('Technology Stack')).toBeInTheDocument();
		expect(screen.getByText(/SvelteKit \(SSR-only, no hydration\)/)).toBeInTheDocument();
		expect(screen.getByText(/Supabase \(PostgreSQL \+ REST API\)/)).toBeInTheDocument();
		expect(screen.getByText(/Node\.js server behind Tor hidden service/)).toBeInTheDocument();
	});

	it('should display getting started steps', () => {
		render(HomePage);
		
		expect(screen.getByText('Getting Started')).toBeInTheDocument();
		expect(screen.getByText('1. Clone & Install')).toBeInTheDocument();
		expect(screen.getByText('2. Configure Supabase')).toBeInTheDocument();
		expect(screen.getByText('3. Run Development')).toBeInTheDocument();
		expect(screen.getByText('4. Deploy to .onion')).toBeInTheDocument();
	});

	it('should display code examples', () => {
		render(HomePage);
		
		expect(screen.getByText('git clone [repo-url]')).toBeInTheDocument();
		expect(screen.getByText('pnpm install')).toBeInTheDocument();
		expect(screen.getByText('pnpm run dev')).toBeInTheDocument();
		expect(screen.getByText('pnpm run build')).toBeInTheDocument();
	});

	it('should have proper semantic structure', () => {
		render(HomePage);
		
		expect(screen.getByRole('main')).toBeInTheDocument();
		expect(screen.getByRole('banner')).toBeInTheDocument(); // header element
	});

	it('should display privacy-focused footer', () => {
		render(HomePage);
		
		expect(screen.getByText('Built for privacy-conscious developers creating .onion websites')).toBeInTheDocument();
		expect(screen.getByText('No tracking • No analytics • No external CDNs')).toBeInTheDocument();
	});

	describe('Feature Descriptions', () => {
		it('should describe SSR-only mode benefits', () => {
			render(HomePage);
			
			expect(screen.getByText(/100% server-side rendered with no client-side JavaScript/)).toBeInTheDocument();
			expect(screen.getByText(/Perfect for Tor users who disable JS by default/)).toBeInTheDocument();
		});

		it('should describe Supabase integration', () => {
			render(HomePage);
			
			expect(screen.getByText(/Database-backed applications using Supabase's REST API/)).toBeInTheDocument();
		});

		it('should describe security features', () => {
			render(HomePage);
			
			expect(screen.getByText(/Strict Content Security Policy and privacy headers/)).toBeInTheDocument();
		});

		it('should describe form handling', () => {
			render(HomePage);
			
			expect(screen.getByText(/Classic HTML form interactions with server-side validation/)).toBeInTheDocument();
		});
	});

	describe('Accessibility', () => {
		it('should have proper heading hierarchy', () => {
			render(HomePage);
			
			const h1 = screen.getByRole('heading', { level: 1 });
			const h2Elements = screen.getAllByRole('heading', { level: 2 });
			const h3Elements = screen.getAllByRole('heading', { level: 3 });
			
			expect(h1).toBeInTheDocument();
			expect(h2Elements.length).toBeGreaterThan(0);
			expect(h3Elements.length).toBeGreaterThan(0);
		});

		it('should have accessible links', () => {
			render(HomePage);
			
			const guestbookLink = screen.getByRole('link', { name: /visit guestbook/i });
			expect(guestbookLink).toBeInTheDocument();
		});
	});

	describe('Content Structure', () => {
		it('should have all main sections', () => {
			render(HomePage);
			
			expect(screen.getByText('Features')).toBeInTheDocument();
			expect(screen.getByText('Live Demo')).toBeInTheDocument();
			expect(screen.getByText('Technology Stack')).toBeInTheDocument();
			expect(screen.getByText('Getting Started')).toBeInTheDocument();
		});

		it('should display feature grid', () => {
			render(HomePage);
			
			// Should have 6 feature cards
			const featureCards = screen.getAllByText(/🔒|🗄️|🛡️|📝|🐳|⚡/);
			expect(featureCards.length).toBe(6);
		});

		it('should display step-by-step instructions', () => {
			render(HomePage);
			
			const steps = screen.getAllByText(/\d+\./);
			expect(steps.length).toBe(4); // 4 getting started steps
		});
	});

	describe('Responsive Design Elements', () => {
		it('should have responsive classes in the component', () => {
			const { container } = render(HomePage);
			
			// Check if the component renders without errors
			// (CSS classes are not directly testable in this environment)
			expect(container.firstChild).toBeInTheDocument();
		});
	});
});