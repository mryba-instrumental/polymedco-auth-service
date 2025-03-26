/**
 * HubSpot API Client
 * 
 * This module handles interactions with the HubSpot API for email authorization.
 */

interface HubSpotEnv {
  HUBSPOT_API_KEY: string;
  HUBSPOT_LIST_ID: string;
}

interface HubSpotContactSearchResponse {
  results: Array<{ id: string }>;
  total: number;
}

interface HubSpotListMembershipResponse {
  results: Array<{ 
    listId: string;
    added: string; 
    userId: number;
  }>;
  paging?: {
    next?: {
      after: string;
      link: string;
    }
  };
}

/**
 * Check if an email exists in a specific HubSpot contact list
 * 
 * @param email - The email address to check
 * @param env - Environment variables containing HubSpot credentials
 * @returns Boolean indicating if the email is in the list
 */
export async function isEmailInContactList(email: string, env: HubSpotEnv): Promise<boolean> {
  try {
    // First, search for the contact by email
    const contactId = await getContactIdByEmail(email, env);
    
    if (!contactId) {
      return false;
    }
    
    // Then check if the contact is in the specified list
    return await isContactInList(contactId, env);
  } catch (error) {
    console.error('Error checking email in HubSpot list:', error);
    throw new Error('Failed to check email authorization status');
  }
}

/**
 * Get a contact's ID by their email address
 * 
 * @param email - The email address to look up
 * @param env - Environment variables containing HubSpot credentials
 * @returns The contact ID if found, null otherwise
 */
async function getContactIdByEmail(email: string, env: HubSpotEnv): Promise<string | null> {
  const url = `https://api.hubapi.com/crm/v3/objects/contacts/search`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${env.HUBSPOT_API_KEY}`
    },
    body: JSON.stringify({
      filterGroups: [
        {
          filters: [
            {
              propertyName: 'email',
              operator: 'EQ',
              value: email
            }
          ]
        }
      ],
      properties: ['email'],
      limit: 1
    })
  });
  
  if (!response.ok) {
    throw new Error(`HubSpot API error: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json() as HubSpotContactSearchResponse;
  
  if (data.results && data.results.length > 0) {
    return data.results[0].id;
  }
  
  return null;
}

/**
 * Check if a contact is a member of the specified list
 * 
 * @param contactId - The HubSpot contact ID
 * @param env - Environment variables containing HubSpot credentials
 * @returns Boolean indicating if the contact is in the list
 */
async function isContactInList(contactId: string, env: HubSpotEnv): Promise<boolean> {
  const listId = env.HUBSPOT_LIST_ID;
  // Using the v3 List Membership API to check if the contact is in the list
  // https://api.hubapi.com/crm/v3/lists/records/{objectTypeId}/{recordId}/memberships
  const url = `https://api.hubapi.com/crm/v3/lists/records/contacts/${contactId}/memberships`;
  
  let after = undefined;
  let hasMore = true;
  
  // We may need to paginate through the results if there are many list memberships
  while (hasMore) {
    const queryParams = after ? `?after=${after}` : '';
    const response = await fetch(`${url}${queryParams}`, {
      headers: {
        'Authorization': `Bearer ${env.HUBSPOT_API_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`HubSpot API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json() as HubSpotListMembershipResponse;
    
    // Check if the list ID is in this page of results
    const found = data.results.some((membership) => membership.listId === listId);
    if (found) {
      return true;
    }
    
    // Update pagination values for the next request
    if (data.paging && data.paging.next) {
      after = data.paging.next.after;
      hasMore = true;
    } else {
      hasMore = false;
    }
  }
  
  return false;
} 