/**
 * Generic test fixtures for companies
 * No hardcoded specific cases (LVMH, CMA CGM, etc.)
 * Covers multiple scenarios
 */

export const companies = {
  // Simple parent with 1 child
  '1001': {
    id: '1001',
    name: 'Parent Company A',
    childCompanyIds: ['1002'],
    parentCompanyIds: [],
    revenue: 1000000
  },
  '1002': {
    id: '1002',
    name: 'Child Company A1',
    childCompanyIds: [],
    parentCompanyIds: ['1001'],
    revenue: 200000
  },

  // Parent with multiple children (5)
  '2001': {
    id: '2001',
    name: 'Parent Company B',
    childCompanyIds: ['2002', '2003', '2004', '2005', '2006'],
    parentCompanyIds: [],
    revenue: 5000000
  },
  '2002': {
    id: '2002',
    name: 'Child Company B1',
    childCompanyIds: [],
    parentCompanyIds: ['2001'],
    revenue: 500000
  },
  '2003': {
    id: '2003',
    name: 'Child Company B2',
    childCompanyIds: [],
    parentCompanyIds: ['2001'],
    revenue: 300000
  },
  '2004': {
    id: '2004',
    name: 'Child Company B3',
    childCompanyIds: [],
    parentCompanyIds: ['2001'],
    revenue: 0
  },
  '2005': {
    id: '2005',
    name: 'Child Company B4',
    childCompanyIds: [],
    parentCompanyIds: ['2001'],
    revenue: 100000
  },
  '2006': {
    id: '2006',
    name: 'Child Company B5',
    childCompanyIds: [],
    parentCompanyIds: ['2001'],
    revenue: 50000
  },

  // Multi-level hierarchy (3 levels)
  '3001': {
    id: '3001',
    name: 'GrandParent Company C',
    childCompanyIds: ['3002'],
    parentCompanyIds: [],
    revenue: 10000000
  },
  '3002': {
    id: '3002',
    name: 'Parent Company C1',
    childCompanyIds: ['3003', '3004'],
    parentCompanyIds: ['3001'],
    revenue: 3000000
  },
  '3003': {
    id: '3003',
    name: 'Child Company C1A',
    childCompanyIds: [],
    parentCompanyIds: ['3002'],
    revenue: 500000
  },
  '3004': {
    id: '3004',
    name: 'Child Company C1B',
    childCompanyIds: [],
    parentCompanyIds: ['3002'],
    revenue: 200000
  },

  // Standalone companies (no relations)
  '4001': {
    id: '4001',
    name: 'Standalone Company D',
    childCompanyIds: [],
    parentCompanyIds: [],
    revenue: 800000
  },
  '4002': {
    id: '4002',
    name: 'Standalone Company E',
    childCompanyIds: [],
    parentCompanyIds: [],
    revenue: 50000
  },

  // Edge case: company with 0 revenue
  '5001': {
    id: '5001',
    name: 'Zero Revenue Company',
    childCompanyIds: [],
    parentCompanyIds: [],
    revenue: 0
  },

  // Large parent with 10+ children
  '6001': {
    id: '6001',
    name: 'Large Parent Company F',
    childCompanyIds: ['6002', '6003', '6004', '6005', '6006', '6007', '6008', '6009', '6010', '6011', '6012'],
    parentCompanyIds: [],
    revenue: 20000000
  },
  '6002': { id: '6002', name: 'Child F1', childCompanyIds: [], parentCompanyIds: ['6001'], revenue: 100000 },
  '6003': { id: '6003', name: 'Child F2', childCompanyIds: [], parentCompanyIds: ['6001'], revenue: 150000 },
  '6004': { id: '6004', name: 'Child F3', childCompanyIds: [], parentCompanyIds: ['6001'], revenue: 200000 },
  '6005': { id: '6005', name: 'Child F4', childCompanyIds: [], parentCompanyIds: ['6001'], revenue: 250000 },
  '6006': { id: '6006', name: 'Child F5', childCompanyIds: [], parentCompanyIds: ['6001'], revenue: 300000 },
  '6007': { id: '6007', name: 'Child F6', childCompanyIds: [], parentCompanyIds: ['6001'], revenue: 350000 },
  '6008': { id: '6008', name: 'Child F7', childCompanyIds: [], parentCompanyIds: ['6001'], revenue: 400000 },
  '6009': { id: '6009', name: 'Child F8', childCompanyIds: [], parentCompanyIds: ['6001'], revenue: 450000 },
  '6010': { id: '6010', name: 'Child F9', childCompanyIds: [], parentCompanyIds: ['6001'], revenue: 500000 },
  '6011': { id: '6011', name: 'Child F10', childCompanyIds: [], parentCompanyIds: ['6001'], revenue: 0 },
  '6012': { id: '6012', name: 'Child F11', childCompanyIds: [], parentCompanyIds: ['6001'], revenue: 75000 }
};

export const companyDeals = {
  // Parent A has deals
  '1001': [{ id: 'd1001', amount: 50000, closedate: '2024-01-15' }],
  // Child A1 has NO deals (white space)
  '1002': [],

  // Parent B has deals
  '2001': [{ id: 'd2001', amount: 200000, closedate: '2024-03-20' }],
  // B1, B2, B5 have deals
  '2002': [{ id: 'd2002', amount: 30000, closedate: '2024-02-10' }],
  '2003': [{ id: 'd2003', amount: 15000, closedate: '2024-04-05' }],
  '2006': [{ id: 'd2006', amount: 5000, closedate: '2024-05-12' }],
  // B3, B4 have NO deals (white spaces)
  '2004': [],
  '2005': [],

  // GrandParent C has deals
  '3001': [{ id: 'd3001', amount: 500000, closedate: '2024-06-01' }],
  // Parent C1 has deals
  '3002': [{ id: 'd3002', amount: 150000, closedate: '2024-07-15' }],
  // C1A has NO deals (white space)
  '3003': [],
  // C1B has deals
  '3004': [{ id: 'd3004', amount: 25000, closedate: '2024-08-20' }],

  // Standalone D has deals
  '4001': [{ id: 'd4001', amount: 100000, closedate: '2024-09-10' }],
  // Standalone E has NO deals
  '4002': [],

  // Zero revenue company has deals (edge case)
  '5001': [{ id: 'd5001', amount: 1000, closedate: '2024-10-01' }],

  // Large parent F has deals
  '6001': [{ id: 'd6001', amount: 1000000, closedate: '2024-11-01' }],
  // Half of children have deals, half don't
  '6002': [{ id: 'd6002', amount: 10000, closedate: '2024-11-05' }],
  '6003': [],
  '6004': [{ id: 'd6004', amount: 20000, closedate: '2024-11-10' }],
  '6005': [],
  '6006': [{ id: 'd6006', amount: 30000, closedate: '2024-11-15' }],
  '6007': [],
  '6008': [{ id: 'd6008', amount: 40000, closedate: '2024-11-20' }],
  '6009': [],
  '6010': [{ id: 'd6010', amount: 50000, closedate: '2024-11-25' }],
  '6011': [],
  '6012': [{ id: 'd6012', amount: 7500, closedate: '2024-11-30' }]
};

// Expected white spaces for validation
export const expectedWhiteSpaces = [
  { companyId: '1002', parentId: '1001', companyName: 'Child Company A1', parentName: 'Parent Company A' },
  { companyId: '2004', parentId: '2001', companyName: 'Child Company B3', parentName: 'Parent Company B' },
  { companyId: '2005', parentId: '2001', companyName: 'Child Company B4', parentName: 'Parent Company B' },
  { companyId: '3003', parentId: '3002', companyName: 'Child Company C1A', parentName: 'Parent Company C1' },
  { companyId: '6003', parentId: '6001', companyName: 'Child F2', parentName: 'Large Parent Company F' },
  { companyId: '6005', parentId: '6001', companyName: 'Child F4', parentName: 'Large Parent Company F' },
  { companyId: '6007', parentId: '6001', companyName: 'Child F6', parentName: 'Large Parent Company F' },
  { companyId: '6009', parentId: '6001', companyName: 'Child F8', parentName: 'Large Parent Company F' },
  { companyId: '6011', parentId: '6001', companyName: 'Child F10', parentName: 'Large Parent Company F' }
];
