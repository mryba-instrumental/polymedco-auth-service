/**
 * Utility functions for email validation and rate limiting
 */

/**
 * Validates an email address format
 * 
 * @param email - The email address to validate
 * @returns Boolean indicating if the email format is valid
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Simple in-memory rate limiter implementation
 * This would need to be replaced with a more robust solution for production
 */
export class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();
  private readonly limit: number;
  private readonly windowMs: number;

  /**
   * Create a new rate limiter
   * 
   * @param limit - Maximum number of requests allowed in the time window
   * @param windowMs - Time window in milliseconds
   */
  constructor(limit: number = 10, windowMs: number = 60000) {
    this.limit = limit;
    this.windowMs = windowMs;
  }

  /**
   * Check if a request from an IP should be rate-limited
   * 
   * @param ip - IP address of the requester
   * @returns Boolean indicating if the request should be blocked
   */
  shouldLimit(ip: string): boolean {
    const now = Date.now();
    const record = this.requests.get(ip);

    // If no record exists or the time window has expired, create a new record
    if (!record || now > record.resetTime) {
      this.requests.set(ip, {
        count: 1,
        resetTime: now + this.windowMs
      });
      return false;
    }

    // Increment the request count
    record.count += 1;

    // Check if the limit has been exceeded
    return record.count > this.limit;
  }

  /**
   * Clean up expired entries periodically to prevent memory leaks
   * Call this method at regular intervals
   */
  cleanup(): void {
    const now = Date.now();
    for (const [ip, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(ip);
      }
    }
  }
} 