# PolymedCo Email Authorization Service

This service provides an API endpoint that verifies if an email address is in a specified HubSpot contact list, returning an authorization status. It includes a frontend demo that shows how to integrate with the service.

## Features

- **Authorization Endpoint**:
  - Accepts email addresses via POST request
  - Verifies against HubSpot contact lists
  - Returns authorization status (authorized/unauthorized)

- **Security**:
  - Email validation
  - Rate limiting
  - Environment variables for API keys

- **Frontend Demo**:
  - Email form for testing
  - Automatic polling to maintain authorization
  - Protected content visibility based on status

## Getting Started

### Prerequisites

- Node.js 16.13.0 or later
- Wrangler CLI (Cloudflare Workers)
- HubSpot API key with contacts and lists read permissions
- A HubSpot contact list ID

### Local Development

1. Clone this repository:
   ```
   git clone https://github.com/your-username/polymedco-auth-service.git
   cd polymedco-auth-service
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.dev.vars` file in the project root with your HubSpot credentials:
   ```
   HUBSPOT_API_KEY=your_hubspot_api_key
   HUBSPOT_LIST_ID=your_hubspot_list_id
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Visit `http://localhost:8787` in your browser to see the demo.

### Deployment

1. Log in to your Cloudflare account with Wrangler:
   ```
   npx wrangler login
   ```

2. Add your secrets to Cloudflare:
   ```
   npx wrangler secret put HUBSPOT_API_KEY
   npx wrangler secret put HUBSPOT_LIST_ID
   ```

3. Deploy to Cloudflare Workers:
   ```
   npm run deploy
   ```

## API Documentation

### POST /authorize

Checks if an email address is authorized by verifying its presence in a HubSpot contact list.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Successful Response (200 OK):**
```json
{
  "status": "authorized"
}
```
or
```json
{
  "status": "unauthorized"
}
```

**Error Responses:**

- **400 Bad Request**: Invalid email format
- **429 Too Many Requests**: Rate limit exceeded
- **500 Internal Server Error**: Server error processing the request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with Cloudflare Workers
- Uses HubSpot API for contact verification 