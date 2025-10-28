/**
 * API Module - HubSpot API calls
 * Version améliorée avec retry, timeout, rate limiting
 */

const HUBSPOT_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const API_BASE = 'https://api.hubapi.com';
const REQUEST_TIMEOUT = 30000; // 30 secondes
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 seconde

// Rate limiting: 100 requêtes/10 secondes (limite HubSpot)
const rateLimiter = {
  requests: [],
  maxRequests: 100,
  window: 10000, // 10 secondes

  async waitIfNeeded() {
    const now = Date.now();
    // Nettoyer les requêtes anciennes
    this.requests = this.requests.filter(time => now - time < this.window);

    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.window - (now - oldestRequest);
      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return this.waitIfNeeded();
      }
    }

    this.requests.push(now);
  }
};

// Fetch avec timeout
async function fetchWithTimeout(url, options, timeout = REQUEST_TIMEOUT) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

// Sleep utility pour retry
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchHubSpot(endpoint, params = {}, retries = 0) {
  // Rate limiting
  await rateLimiter.waitIfNeeded();

  const url = new URL(`${API_BASE}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      url.searchParams.append(key, value.join(','));
    } else {
      url.searchParams.append(key, value);
    }
  });

  try {
    const response = await fetchWithTimeout(url.toString(), {
      headers: {
        'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      // Retry sur erreurs temporaires (429, 500, 502, 503, 504)
      if ([429, 500, 502, 503, 504].includes(response.status) && retries < MAX_RETRIES) {
        const delay = RETRY_DELAY * Math.pow(2, retries); // Exponential backoff
        console.log(`  ⚠️  Erreur ${response.status}, retry ${retries + 1}/${MAX_RETRIES} dans ${delay}ms...`);
        await sleep(delay);
        return fetchHubSpot(endpoint, params, retries + 1);
      }

      const error = await response.text();
      throw new Error(`HubSpot API error (${response.status}): ${error}`);
    }

    return response.json();
  } catch (error) {
    // Retry sur erreurs réseau (timeout, connexion)
    if (retries < MAX_RETRIES && (error.message.includes('timeout') || error.message.includes('fetch failed'))) {
      const delay = RETRY_DELAY * Math.pow(2, retries);
      console.log(`  ⚠️  ${error.message}, retry ${retries + 1}/${MAX_RETRIES} dans ${delay}ms...`);
      await sleep(delay);
      return fetchHubSpot(endpoint, params, retries + 1);
    }
    throw error;
  }
}

async function fetchAllPaginated(endpoint, propertyList = []) {
  const results = [];
  let after = null;
  let hasMore = true;

  while (hasMore) {
    const params = { limit: 100 };
    if (propertyList.length > 0) params.properties = propertyList;
    if (after) params.after = after;

    const data = await fetchHubSpot(endpoint, params);

    if (data.results?.length > 0) {
      results.push(...data.results);
      console.log(`  ✓ ${results.length} items...`);
    }

    hasMore = data.paging?.next;
    after = hasMore ? data.paging.next.after : null;
  }

  return results;
}

async function fetchAllNotes(objectId, objectType) {
  try {
    const assocData = await fetchHubSpot(`/crm/v4/objects/${objectType}/${objectId}/associations/notes`);
    if (!assocData.results?.length) return [];

    const notes = [];
    for (const assoc of assocData.results) {
      try {
        const noteData = await fetchHubSpot(`/crm/v3/objects/notes/${assoc.toObjectId}`, {
          properties: ['hs_note_body', 'hs_timestamp', 'hubspot_owner_id']
        });
        notes.push({
          id: noteData.id,
          body: noteData.properties.hs_note_body || '',
          timestamp: noteData.properties.hs_timestamp || '',
          ownerId: noteData.properties.hubspot_owner_id || ''
        });
      } catch (err) {
        // Skip failed notes
      }
    }
    return notes;
  } catch (error) {
    return [];
  }
}

async function fetchEngagementHistory(companyId) {
  const engagement = { emails: 0, calls: 0, meetings: 0, lastActivity: null };
  const types = ['emails', 'calls', 'meetings'];

  for (const type of types) {
    try {
      const data = await fetchHubSpot(`/crm/v4/objects/companies/${companyId}/associations/${type}`);
      engagement[type] = data.results?.length || 0;
    } catch (err) {
      // Type not available
    }
  }

  return engagement;
}

module.exports = {
  fetchHubSpot,
  fetchAllPaginated,
  fetchAllNotes,
  fetchEngagementHistory
};
