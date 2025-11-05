/**
 * White Space Detector - Generic & Reusable
 *
 * Détecte les opportunités business (filiales/parents sans deals)
 * dans une hiérarchie de companies.
 *
 * GENERIC: Fonctionne avec N'IMPORTE QUELLE structure de données
 * PAS de hardcoding de cas spécifiques (LVMH, CMA CGM, etc.)
 *
 * @module white-space-detector
 */

/**
 * Détecte les white spaces (opportunités) dans une hiérarchie de companies
 *
 * @param {Object.<string, Company>} companies - Map ID→Company object
 * @param {Object.<string, Deal[]>} companyDeals - Map ID→Array of deals
 * @param {Object} [options={}] - Configuration options
 * @param {number} [options.minParentRevenue=0] - Minimum parent revenue to consider
 * @param {boolean} [options.includeParentWhiteSpaces=true] - Detect parent companies without deals
 * @returns {WhiteSpace[]} Array of detected white space opportunities
 *
 * @typedef {Object} WhiteSpace
 * @property {string} companyId - ID of the white space company
 * @property {string} companyName - Name of the white space company
 * @property {string} parentId - ID of the parent company (if child)
 * @property {string} parentName - Name of the parent company (if child)
 * @property {number} parentRevenue - Revenue of parent company
 * @property {string} type - Type: 'child' or 'parent'
 * @property {Object} company - Full company object reference
 *
 * @example
 * const whiteSpaces = detectWhiteSpaces(companies, deals);
 * console.log(`Found ${whiteSpaces.length} opportunities`);
 */
function detectWhiteSpaces(companies, companyDeals, options = {}) {
  const {
    minParentRevenue = 0,
    includeParentWhiteSpaces = true
  } = options;

  const whiteSpaces = [];

  // Build set of companies with deals (faster lookup)
  const companiesWithDeals = new Set(
    Object.keys(companyDeals).filter(id => companyDeals[id]?.length > 0)
  );

  // PASS 1: Detect child white spaces
  // For each company with deals, check if their children have deals
  Object.entries(companies).forEach(([companyId, company]) => {
    // Skip if company has no deals (not a client)
    if (!companiesWithDeals.has(companyId)) {
      return;
    }

    // Skip if no children
    if (!company.childCompanyIds || company.childCompanyIds.length === 0) {
      return;
    }

    // Filter by minimum parent revenue if specified
    if (company.revenue < minParentRevenue) {
      return;
    }

    // Check each child
    company.childCompanyIds.forEach(childId => {
      const childCompany = companies[childId];

      // Skip if child company doesn't exist
      if (!childCompany) {
        return;
      }

      // White space detected: child has NO deals
      if (!companiesWithDeals.has(childId)) {
        whiteSpaces.push({
          companyId: childId,
          companyName: childCompany.name,
          parentId: companyId,
          parentName: company.name,
          parentRevenue: company.revenue || 0,
          type: 'child',
          company: childCompany
        });
      }
    });
  });

  // PASS 2: Detect parent white spaces (optional)
  // Parent companies that have NO deals but have children with deals
  if (includeParentWhiteSpaces) {
    Object.entries(companies).forEach(([companyId, company]) => {
      // Skip if company HAS deals (already a client)
      if (companiesWithDeals.has(companyId)) {
        return;
      }

      // Skip if no children
      if (!company.childCompanyIds || company.childCompanyIds.length === 0) {
        return;
      }

      // Check if at least ONE child has deals
      const hasChildWithDeals = company.childCompanyIds.some(
        childId => companiesWithDeals.has(childId)
      );

      if (hasChildWithDeals) {
        // Get first child with deals for reference
        const childWithDealsId = company.childCompanyIds.find(
          childId => companiesWithDeals.has(childId)
        );
        const childWithDeals = companies[childWithDealsId];

        whiteSpaces.push({
          companyId: companyId,
          companyName: company.name,
          parentId: null, // It's the parent itself
          parentName: null,
          parentRevenue: company.revenue || 0,
          type: 'parent',
          company: company,
          // Add context
          childrenCount: company.childCompanyIds.length,
          childrenWithDeals: company.childCompanyIds.filter(
            id => companiesWithDeals.has(id)
          ).length
        });
      }
    });
  }

  return whiteSpaces;
}

/**
 * Calculate white space priority based on parent revenue
 *
 * @param {WhiteSpace} whiteSpace - White space opportunity
 * @param {Object} [thresholds] - Custom thresholds
 * @returns {'HIGH'|'MEDIUM'|'LOW'} Priority level
 */
function calculatePriority(whiteSpace, thresholds = {}) {
  const {
    highThreshold = 500000,
    mediumThreshold = 200000
  } = thresholds;

  const revenue = whiteSpace.parentRevenue || 0;

  if (revenue >= highThreshold) return 'HIGH';
  if (revenue >= mediumThreshold) return 'MEDIUM';
  return 'LOW';
}

/**
 * Estimate white space potential revenue
 *
 * @param {WhiteSpace} whiteSpace - White space opportunity
 * @param {Object} [options] - Estimation options
 * @returns {number} Estimated potential revenue
 */
function estimatePotential(whiteSpace, options = {}) {
  const {
    minPercentage = 0.05, // 5%
    maxPercentage = 0.15, // 15%
    multiplier = 0.10 // Default 10%
  } = options;

  const parentRevenue = whiteSpace.parentRevenue || 0;
  return Math.round(parentRevenue * multiplier);
}

module.exports = {
  detectWhiteSpaces,
  calculatePriority,
  estimatePotential
};
