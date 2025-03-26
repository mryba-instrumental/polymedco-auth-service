/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.jsonc`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { isEmailInContactList } from './hubspot';
import { isValidEmail, RateLimiter } from './utils';

// Create rate limiter instance
const rateLimiter = new RateLimiter(100, 60000); // 100 requests per minute

// Define our environment interface
export interface Env {
	HUBSPOT_API_KEY: string;
	HUBSPOT_LIST_ID: string;
	ASSETS: { fetch: typeof fetch };
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		// Clean up expired rate limit entries
		rateLimiter.cleanup();
		
		// CORS headers to allow cross-origin requests
		const corsHeaders = {
			'Access-Control-Allow-Origin': '*',
			'Access-Control-Allow-Methods': 'POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type',
		};
		
		// Handle preflight OPTIONS request
		if (request.method === 'OPTIONS') {
			return new Response(null, {
				headers: corsHeaders,
				status: 204,
			});
		}

		const url = new URL(request.url);
		
		// Serve static assets for frontend demo
		if (url.pathname === '/' || url.pathname.startsWith('/assets/')) {
			return env.ASSETS.fetch(request);
		}
		
		// Handle authorization endpoint request
		if (url.pathname === '/authorize' && request.method === 'POST') {
			// Get client IP for rate limiting
			const clientIp = request.headers.get('CF-Connecting-IP') || 'unknown';
			
			// Check if rate limited
			if (rateLimiter.shouldLimit(clientIp)) {
				return new Response(JSON.stringify({ 
					status: 'error', 
					message: 'Rate limit exceeded. Please try again later.' 
				}), {
					status: 429,
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders,
					},
				});
			}
			
			try {
				// Parse request body
				const requestData = await request.json() as { email?: string };
				const email = requestData.email?.trim();
				
				// Validate email
				if (!email || !isValidEmail(email)) {
					return new Response(JSON.stringify({ 
						status: 'error', 
						message: 'Invalid email format' 
					}), {
						status: 400,
						headers: {
							'Content-Type': 'application/json',
							...corsHeaders,
						},
					});
				}
				
				// Check if email is in the HubSpot contact list
				const isAuthorized = await isEmailInContactList(email, env);
				
				// Return authorization status
				return new Response(JSON.stringify({ 
					status: isAuthorized ? 'authorized' : 'unauthorized' 
				}), {
					status: 200,
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders,
					},
				});
			} catch (error) {
				console.error('Error processing authorization request:', error);
				
				// Return error response
				return new Response(JSON.stringify({ 
					status: 'error', 
					message: 'Internal server error' 
				}), {
					status: 500,
					headers: {
						'Content-Type': 'application/json',
						...corsHeaders,
					},
				});
			}
		}
		
		// Return 404 for unknown routes
		return new Response(JSON.stringify({ 
			status: 'error', 
			message: 'Not found' 
		}), {
			status: 404,
			headers: {
				'Content-Type': 'application/json',
				...corsHeaders,
			},
		});
	},
} satisfies ExportedHandler<Env>;
