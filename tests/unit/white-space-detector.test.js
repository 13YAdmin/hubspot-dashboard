import { describe, it, expect } from 'vitest';
import { detectWhiteSpaces, calculatePriority, estimatePotential } from '../../.github/scripts/lib/white-space-detector.js';
import { companies, companyDeals, expectedWhiteSpaces } from '../fixtures/companies.js';

describe('White Space Detector', () => {
  describe('detectWhiteSpaces()', () => {
    it('détecte TOUS les white spaces correctement', () => {
      const result = detectWhiteSpaces(companies, companyDeals);

      // Devrait détecter exactement 9 white spaces (voir fixtures)
      expect(result).toHaveLength(9);

      // Vérifier que tous sont de type 'child'
      expect(result.every(ws => ws.type === 'child')).toBe(true);
    });

    it('détecte cas simple: 1 parent → 1 enfant sans deals', () => {
      const result = detectWhiteSpaces(companies, companyDeals);

      const childA1 = result.find(ws => ws.companyId === '1002');
      expect(childA1).toBeDefined();
      expect(childA1.companyName).toBe('Child Company A1');
      expect(childA1.parentName).toBe('Parent Company A');
    });

    it('détecte cas multiple: parent avec 5 enfants, 2 sans deals', () => {
      const result = detectWhiteSpaces(companies, companyDeals);

      const parentBWhiteSpaces = result.filter(ws => ws.parentId === '2001');
      expect(parentBWhiteSpaces).toHaveLength(2);

      const ids = parentBWhiteSpaces.map(ws => ws.companyId);
      expect(ids).toContain('2004'); // B3
      expect(ids).toContain('2005'); // B4
    });

    it('gère hiérarchie multi-niveaux (3 niveaux)', () => {
      const result = detectWhiteSpaces(companies, companyDeals);

      // C1A est enfant de C1 (qui est enfant de C)
      const childC1A = result.find(ws => ws.companyId === '3003');
      expect(childC1A).toBeDefined();
      expect(childC1A.parentId).toBe('3002'); // Parent direct
    });

    it('détecte white spaces dans grand groupe (10+ enfants)', () => {
      const result = detectWhiteSpaces(companies, companyDeals);

      const parentFWhiteSpaces = result.filter(ws => ws.parentId === '6001');
      expect(parentFWhiteSpaces).toHaveLength(5); // F2, F4, F6, F8, F10
    });

    it('ignore companies standalone sans deals (pas des white spaces)', () => {
      const result = detectWhiteSpaces(companies, companyDeals);

      // Company E (4002) a pas de deals MAIS n'a pas de parent avec deals
      const standaloneE = result.find(ws => ws.companyId === '4002');
      expect(standaloneE).toBeUndefined();
    });

    it('ignore enfants avec revenue 0 si parent a deals', () => {
      const result = detectWhiteSpaces(companies, companyDeals);

      // B3 (2004) a revenue 0 mais parent a deals → c'est un white space
      const childB3 = result.find(ws => ws.companyId === '2004');
      expect(childB3).toBeDefined();
    });

    it('applique filtre minParentRevenue correctement', () => {
      const result = detectWhiteSpaces(companies, companyDeals, {
        minParentRevenue: 2000000 // 2M minimum
      });

      // Devrait éliminer Parent A (1M) et Parent B (5M passe)
      const childA1 = result.find(ws => ws.companyId === '1002');
      expect(childA1).toBeUndefined();

      const childB3 = result.find(ws => ws.companyId === '2004');
      expect(childB3).toBeDefined(); // Parent B a 5M
    });

    it('retourne array vide si aucune company', () => {
      const result = detectWhiteSpaces({}, {});
      expect(result).toEqual([]);
    });

    it('retourne array vide si tous ont des deals', () => {
      const allWithDeals = {
        '1': { id: '1', name: 'A', childCompanyIds: ['2'], parentCompanyIds: [] },
        '2': { id: '2', name: 'B', childCompanyIds: [], parentCompanyIds: ['1'] }
      };
      const deals = {
        '1': [{ id: 'd1', amount: 100 }],
        '2': [{ id: 'd2', amount: 50 }]
      };

      const result = detectWhiteSpaces(allWithDeals, deals);
      expect(result).toEqual([]);
    });

    it('gère relations bidirectionnelles correctement', () => {
      const result = detectWhiteSpaces(companies, companyDeals);

      // Vérifier cohérence: si X est white space avec parent Y,
      // alors X doit avoir Y dans parentCompanyIds
      result.forEach(ws => {
        if (ws.parentId) {
          const company = companies[ws.companyId];
          expect(company.parentCompanyIds).toContain(ws.parentId);
        }
      });
    });
  });

  describe('calculatePriority()', () => {
    it('retourne HIGH pour parent revenue >= 500K', () => {
      const ws = { parentRevenue: 1000000 };
      expect(calculatePriority(ws)).toBe('HIGH');
    });

    it('retourne MEDIUM pour parent revenue >= 200K', () => {
      const ws = { parentRevenue: 350000 };
      expect(calculatePriority(ws)).toBe('MEDIUM');
    });

    it('retourne LOW pour parent revenue < 200K', () => {
      const ws = { parentRevenue: 150000 };
      expect(calculatePriority(ws)).toBe('LOW');
    });

    it('utilise custom thresholds si fournis', () => {
      const ws = { parentRevenue: 300000 };
      const priority = calculatePriority(ws, {
        highThreshold: 250000,
        mediumThreshold: 100000
      });
      expect(priority).toBe('HIGH');
    });
  });

  describe('estimatePotential()', () => {
    it('estime 10% du parent revenue par défaut', () => {
      const ws = { parentRevenue: 1000000 };
      expect(estimatePotential(ws)).toBe(100000);
    });

    it('utilise custom multiplier si fourni', () => {
      const ws = { parentRevenue: 1000000 };
      expect(estimatePotential(ws, { multiplier: 0.15 })).toBe(150000);
    });

    it('retourne 0 si parent revenue manquant', () => {
      const ws = { parentRevenue: 0 };
      expect(estimatePotential(ws)).toBe(0);
    });
  });
});
