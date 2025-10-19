/**
 * API Module - HubSpot API calls
 */

const HUBSPOT_TOKEN = process.env.HUBSPOT_ACCESS_TOKEN;
const API_BASE = 'https://api.hubapi.com';

async function fetchHubSpot(endpoint, params = {}) {
  const url = new URL(`${API_BASE}${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      url.searchParams.append(key, value.join(','));
    } else {
      url.searchParams.append(key, value);
    }
  });

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${HUBSPOT_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`HubSpot API error (${response.status}): ${error}`);
  }

  return response.json();
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
