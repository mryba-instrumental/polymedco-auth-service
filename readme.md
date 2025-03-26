# Email Authorization Endpoint - Requirements Document

## 1. Requirements of the App

This application is designed to provide an authorization mechanism based on email list membership in HubSpot. The key requirements are:

- **API Endpoint**: 
  - Accepts a POST request with an email address in the request body
  - Integrates with the HubSpot API to verify if the email exists in a specified contact list
  - Returns a JSON response with an authorization status:
    - `{ "status": "authorized" }` if the email is in the list
    - `{ "status": "unauthorized" }` if the email is not in the list
  - Deployed on Cloudflare Workers for serverless execution

- **Frontend**:
  - A sample `index.html` file demonstrating integration with the endpoint
  - Contains a form with a single email input field
  - Submits the email to the endpoint via fetch request
  - Sets a cookie with the authorization status
  - Continuously polls the endpoint (e.g., every 30 seconds) to verify authorization
  - Hides or reveals page content based on the authorization status

- **Security**:
  - Secure handling of HubSpot API keys (stored as environment variables in Cloudflare)
  - Basic input validation for email format
  - Rate limiting to prevent abuse

- **Performance**:
  - Response time under 2 seconds for 95% of requests
  - Handles at least 100 requests per minute

## 2. The Tech Stack

- **Backend**:
  - **Cloudflare Workers**: Serverless platform for hosting the endpoint
  - **JavaScript (ES6+)**: Primary language for the Worker script
  - **HubSpot API**: For checking contact list membership (via HTTP requests)

- **Frontend**:
  - **HTML5**: Structure for the sample `index.html`
  - **CSS**: Basic styling for the form and content visibility
  - **JavaScript**: Client-side logic for form submission, cookie management, and polling

- **Tools**:
  - **Wrangler**: CLI for deploying to Cloudflare Workers
  - **npm**: Package management for dependencies
  - **Git**: Version control

## 3. Milestones

1. **Project Setup and Initial Configuration**
   - Set up Cloudflare Workers project with Wrangler
   - Configure HubSpot API access and store API key securely
   - Create basic endpoint structure accepting email input
   - Deploy initial "hello world" Worker to Cloudflare

2. **HubSpot Integration**
   - Implement HubSpot API call to check list membership
   - Add logic to return "authorized" or "unauthorized" based on response
   - Test with sample emails and a test HubSpot list
   - Handle errors (e.g., invalid emails, API downtime)

3. **Frontend Development**
   - Create `index.html` with email form and sample content
   - Implement fetch request to the endpoint
   - Add cookie-setting logic based on response
   - Style the form and content for basic usability

4. **Polling and Content Control**
   - Add JavaScript polling mechanism (every 30 seconds)
   - Implement content visibility toggle based on authorization status
   - Test continuous authorization enforcement
   - Optimize for performance (e.g., debounce polling if needed)

5. **Testing and Deployment**
   - Conduct end-to-end testing with multiple email scenarios
   - Add rate limiting and input validation
   - Finalize documentation (e.g., README with setup instructions)
   - Deploy to production Cloudflare environment

This structure ensures a focused development process, delivering a functional authorization system integrated with HubSpot and Cloudflare, alongside a usable frontend demo.