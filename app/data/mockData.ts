import {
  ValidationResult, ValidationCheck, DataCheck, AmpIndicator,
  PricingRow, CurvePoint, Director, CreditStatus,
  BASE_PRICING_ROWS, BASE_STANDING_ROWS, MISMATCH_STANDING_ROWS, makeCurve,
} from './validationData';

export type QuoteStatus = 'Pending' | 'Auto-Approved' | 'Manual Review' | 'Rejected' | 'Escalated' | 'Approved' | 'Accepted';
export type QuoteType = 'Renewal' | 'New Business' | 'Mixed' | 'Framework';

export interface ToleranceResult {
  rule: string;
  threshold: string;
  actual: string;
  result: 'Pass' | 'Fail';
}

export interface HHInterval {
  time: string;
  value: number | null;
  missing: boolean;
}

export interface HHDayData {
  date: string;
  intervals: HHInterval[];
}

export interface Site {
  id: string;
  mpan: string;
  address: string;
  eac: number;
  mop: string;
  dataAge: number;
  profileClass: string;
  meterType: string;
  consumption: { annual: number; peak: number; offPeak: number };
  hhData: HHDayData[];
  toleranceResults: ToleranceResult[];
  // Validation fields (populated when quote enters validation)
  siteRef?: string;
  aq?: number;
  unitRate?: number;
  standingCharge?: number;
  contractStart?: string;
  contractEnd?: string;
  dataChecks?: DataCheck[];
  ampIndicators?: AmpIndicator[];
  pricingRows?: PricingRow[];
  standingRows?: PricingRow[];
  curveData?: CurvePoint[];
  curveName?: string;
  currentCurveName?: string;
  hhDataQuality?: ValidationResult;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  action: 'Auto-Approved' | 'Manually Approved' | 'Rejected' | 'HH Data Refreshed' | 'Submitted for Review' | 'Escalated';
  user: string;
  notes: string;
  hhSnapshot?: { eac: number; peakResidual: number; offPeakResidual: number; hhDays: number };
  dataChanged?: boolean;
}

export interface Quote {
  id: string;
  ref: string;
  basketId?: string;
  customer: string;
  accountManager: string;
  analyst: string;
  quoteType: QuoteType;
  eac: number;
  supplier: string;
  hhSites: number;
  dataAge: number;
  status: QuoteStatus;
  contractStart: string;
  contractEnd: string;
  sites: Site[];
  toleranceResults: ToleranceResult[];
  auditTrail: AuditEvent[];
  pricingWarning: boolean;
  failureReasons?: string[];
  // Validation fields (populated when quote enters post-sign validation)
  mpan?: string;
  aq?: number;
  unitRate?: number;
  standingCharge?: number;
  roi?: number;
  failureCount?: number;
  creditApprovalStatus?: CreditStatus;
  creditApprover?: string;
  signatoryName?: string;
  validationChecks?: {
    dataIntegrity: ValidationCheck;
    pricingAccuracy: ValidationCheck;
    curveAlignment: ValidationCheck;
    ampIndicators: ValidationCheck;
    roiCredit: ValidationCheck;
    signatureReadiness: ValidationCheck;
  };
  dataChecks?: DataCheck[];
  ampIndicators?: AmpIndicator[];
  pricingRows?: PricingRow[];
  standingRows?: PricingRow[];
  curveData?: CurvePoint[];
  curveName?: string;
  currentCurveName?: string;
  companiesHouse?: {
    companyName: string;
    companyNumber: string;
    registeredAddress: string;
    directors: Director[];
  };
}

/** Builds a synthetic single-site Quote from a Site for per-MPAN tab rendering */
export function buildSiteQuote(base: Quote, site: Site): Quote {
  return {
    ...base,
    mpan: site.mpan,
    unitRate: site.unitRate,
    standingCharge: site.standingCharge,
    contractStart: site.contractStart ?? base.contractStart,
    contractEnd: site.contractEnd ?? base.contractEnd,
    dataChecks: site.dataChecks,
    ampIndicators: site.ampIndicators,
    pricingRows: site.pricingRows,
    standingRows: site.standingRows,
    curveData: site.curveData,
    curveName: site.curveName,
    currentCurveName: site.currentCurveName,
    sites: [],
  };
}

function generateHHIntervals(missingSlotsIndices: number[] = [], dayOffset = 0): HHInterval[] {
  const intervals: HHInterval[] = [];
  // Use a seeded-ish approach for consistency
  let seed = dayOffset * 12345;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return Math.abs(seed) / 0xffffffff;
  };

  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const index = h * 2 + m / 30;
      const time = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

      if (missingSlotsIndices.includes(index)) {
        intervals.push({ time, value: null, missing: true });
        continue;
      }

      let base: number;
      if (h < 6) base = 8 + rand() * 8;
      else if (h < 8) base = 20 + rand() * 20 + (h - 6) * 8;
      else if (h < 17) base = 42 + rand() * 18;
      else if (h < 19) base = 38 + rand() * 15;
      else if (h < 21) base = 25 + rand() * 12;
      else base = 12 + rand() * 10;

      intervals.push({ time, value: Math.round(base * 10) / 10, missing: false });
    }
  }
  return intervals;
}

const site1HH: HHDayData[] = [
  { date: '2025-01-15', intervals: generateHHIntervals([14, 15, 28], 0) },
  { date: '2025-01-16', intervals: generateHHIntervals([], 1) },
  { date: '2025-01-17', intervals: generateHHIntervals([0], 2) },
];

const site2HH: HHDayData[] = [
  { date: '2025-01-15', intervals: generateHHIntervals([22, 23, 24, 40], 3) },
  { date: '2025-01-16', intervals: generateHHIntervals([], 4) },
  { date: '2025-01-17', intervals: generateHHIntervals([10], 5) },
];

const site3HH: HHDayData[] = [
  { date: '2025-01-15', intervals: generateHHIntervals([], 6) },
  { date: '2025-01-16', intervals: generateHHIntervals([30, 31], 7) },
];

export const initialQuotes: Quote[] = [
  {
    id: '1',
    ref: 'PQ00000001',
    basketId: 'BSK-001',
    customer: 'MERIDIAN FOODS LTD',
    accountManager: 'Sarah Briggs',
    analyst: 'Tom Walsh',
    quoteType: 'New Business',
    eac: 485000,
    supplier: 'Engie',
    hhSites: 2,
    dataAge: 12,
    status: 'Manual Review',
    contractStart: '01/10/2025',
    contractEnd: '30/09/2027',
    pricingWarning: false,
    sites: [
      {
        id: 's1',
        mpan: '1-012-345-678-901',
        address: 'Unit 4, Meridian Park, Birmingham, B6 5RQ',
        eac: 285000,
        mop: 'NPOWER MOP',
        dataAge: 12,
        profileClass: 'HH',
        meterType: 'AMR',
        consumption: { annual: 285000, peak: 162450, offPeak: 122550 },
        hhData: site1HH,
        toleranceResults: [
          { rule: 'Customer EAC Threshold', threshold: '≥ 100,000 kWh', actual: '285,000 kWh', result: 'Pass' },
          { rule: 'HH Days Tolerance', threshold: '≥ 300 days', actual: '362 days', result: 'Pass' },
          { rule: 'Residual Peak Tolerance', threshold: '±5%', actual: '+3.2%', result: 'Pass' },
          { rule: 'Residual Off-Peak Tolerance', threshold: '±8%', actual: '-2.1%', result: 'Pass' },
          { rule: 'HH Hourly Accuracy', threshold: '≥ 95%', actual: '97.3%', result: 'Pass' },
          { rule: 'EAC Tolerance', threshold: '±10%', actual: '+1.8%', result: 'Pass' },
        ],
        siteRef: 'SITE-MFG-001',
        aq: 200000,
        unitRate: 24.6424,
        standingCharge: 0.89,
        contractStart: '01/10/2025',
        contractEnd: '30/09/2027',
        dataChecks: [
          { id: 'd1', name: 'MPAN format',          expected: '13-digit numeric', actual: '1580000277243', status: 'Pass' },
          { id: 'd2', name: 'EAC within tolerance', expected: '150,000–250,000 kWh', actual: '200,000 kWh', status: 'Pass' },
          { id: 'd3', name: 'Contract start date',  expected: '01/10/2025', actual: '01/10/2025', status: 'Pass' },
          { id: 'd4', name: 'Contract duration',    expected: '24 months', actual: '24 months', status: 'Pass' },
          { id: 'd5', name: 'Supplier code',        expected: 'Engie (ENE)', actual: 'ENE', status: 'Pass' },
          { id: 'd6', name: 'HH Data Quality',      expected: 'Complete 30-min intervals', actual: 'All intervals complete', status: 'Pass' },
        ],
        ampIndicators: [],
        pricingRows: BASE_PRICING_ROWS,
        standingRows: BASE_STANDING_ROWS,
        curveData: makeCurve(24.6424, false),
        curveName: 'ARC-CURVE-2025-Q4-v3',
        currentCurveName: 'ARC-CURVE-2025-Q4-v3',
        hhDataQuality: 'Pass',
      },
      {
        id: 's2',
        mpan: '1-087-234-567-800',
        address: 'Warehouse B, Meridian Park, Birmingham, B6 5RR',
        eac: 200000,
        mop: 'NPOWER MOP',
        dataAge: 12,
        profileClass: 'HH',
        meterType: 'AMR',
        consumption: { annual: 200000, peak: 116000, offPeak: 84000 },
        hhData: site2HH,
        toleranceResults: [
          { rule: 'Customer EAC Threshold', threshold: '≥ 100,000 kWh', actual: '200,000 kWh', result: 'Pass' },
          { rule: 'HH Days Tolerance', threshold: '≥ 300 days', actual: '289 days', result: 'Fail' },
          { rule: 'Residual Peak Tolerance', threshold: '±5%', actual: '+4.1%', result: 'Pass' },
          { rule: 'Residual Off-Peak Tolerance', threshold: '±8%', actual: '-5.9%', result: 'Pass' },
          { rule: 'HH Hourly Accuracy', threshold: '≥ 95%', actual: '96.1%', result: 'Pass' },
          { rule: 'EAC Tolerance', threshold: '±10%', actual: '-3.4%', result: 'Pass' },
        ],
        siteRef: 'SITE-MFG-002',
        aq: 180000,
        unitRate: 24.6424,
        standingCharge: 0.89,
        contractStart: '01/10/2025',
        contractEnd: '30/09/2027',
        dataChecks: [
          { id: 'd1', name: 'MPAN format',          expected: '13-digit numeric', actual: '1012345678901', status: 'Pass' },
          { id: 'd2', name: 'EAC within tolerance', expected: '130,000–230,000 kWh', actual: '180,000 kWh', status: 'Pass' },
          { id: 'd3', name: 'Contract start date',  expected: '01/10/2025', actual: '01/10/2025', status: 'Pass' },
          { id: 'd4', name: 'Contract duration',    expected: '24 months', actual: '24 months', status: 'Pass' },
          { id: 'd5', name: 'Supplier code',        expected: 'Engie (ENE)', actual: 'ENE', status: 'Pass' },
          { id: 'd6', name: 'HH Data Quality',      expected: 'Complete 30-min intervals', actual: '3 missing intervals (HH 14, 27, 31)', status: 'Warning' },
        ],
        ampIndicators: [
          { id: 'amp1', label: 'Site reference mismatch', severity: 'red',   detail: 'SITE-MFG-002 on contract vs SITE-002-ALT in AMP — manual reconciliation required before acceptance' },
        ],
        pricingRows: BASE_PRICING_ROWS.map(r => r.id === 'bsuos' ? { ...r, value: 1.38, anomalyRange: { min: 0.8, max: 1.2 } } : r),
        standingRows: BASE_STANDING_ROWS,
        curveData: makeCurve(24.85, true),
        curveName: 'ARC-CURVE-2025-Q3-v1',
        currentCurveName: 'ARC-CURVE-2025-Q4-v3',
        hhDataQuality: 'Warning',
      },
      // Site 3 — from c1.mpans[2] (MPAN 1087234567800, SITE-MFG-003)
      {
        id: 's2b',
        mpan: '1-087-234-567-800-2',
        address: 'Building C, Meridian Park, Birmingham, B6 5RS',
        eac: 105000,
        mop: 'NPOWER MOP',
        dataAge: 12,
        profileClass: 'HH',
        meterType: 'AMR',
        consumption: { annual: 105000, peak: 60900, offPeak: 44100 },
        hhData: site3HH,
        toleranceResults: [
          { rule: 'Customer EAC Threshold', threshold: '≥ 100,000 kWh', actual: '105,000 kWh', result: 'Pass' },
          { rule: 'HH Days Tolerance', threshold: '≥ 300 days', actual: '340 days', result: 'Pass' },
          { rule: 'Residual Peak Tolerance', threshold: '±5%', actual: '+2.5%', result: 'Pass' },
          { rule: 'Residual Off-Peak Tolerance', threshold: '±8%', actual: '-1.8%', result: 'Pass' },
          { rule: 'HH Hourly Accuracy', threshold: '≥ 95%', actual: '97.0%', result: 'Pass' },
          { rule: 'EAC Tolerance', threshold: '±10%', actual: '+2.0%', result: 'Pass' },
        ],
        siteRef: 'SITE-MFG-003',
        aq: 105000,
        unitRate: 24.6424,
        standingCharge: 1.05,
        contractStart: '01/10/2025',
        contractEnd: '30/09/2027',
        dataChecks: [
          { id: 'd1', name: 'MPAN format',          expected: '13-digit numeric', actual: '1087234567800', status: 'Pass' },
          { id: 'd2', name: 'EAC within tolerance', expected: '80,000–130,000 kWh', actual: '105,000 kWh', status: 'Pass' },
          { id: 'd3', name: 'Contract start date',  expected: '01/10/2025', actual: '01/10/2025', status: 'Pass' },
          { id: 'd4', name: 'Contract duration',    expected: '24 months', actual: '24 months', status: 'Pass' },
          { id: 'd5', name: 'Supplier code',        expected: 'Engie (ENE)', actual: 'ENE', status: 'Pass' },
          { id: 'd6', name: 'HH Data Quality',      expected: 'Complete 30-min intervals', actual: 'All intervals complete', status: 'Pass' },
        ],
        ampIndicators: [
          { id: 'amp2', label: 'Start date discrepancy', severity: 'amber', detail: 'Contract start 01/10/2025 vs AMP effective date 15/10/2025 — 14-day gap requires review' },
        ],
        pricingRows: BASE_PRICING_ROWS,
        standingRows: MISMATCH_STANDING_ROWS,
        curveData: makeCurve(24.6424, false),
        curveName: 'ARC-CURVE-2025-Q4-v3',
        currentCurveName: 'ARC-CURVE-2025-Q4-v3',
        hhDataQuality: 'Pass',
      },
    ],
    toleranceResults: [
      { rule: 'Customer EAC Threshold', threshold: '≥ 100,000 kWh', actual: '485,000 kWh', result: 'Pass' },
      { rule: 'HH Days Tolerance', threshold: '≥ 300 days', actual: '362 days', result: 'Pass' },
      { rule: 'Residual Peak Tolerance', threshold: '±5%', actual: '+3.2%', result: 'Pass' },
      { rule: 'Residual Off-Peak Tolerance', threshold: '±8%', actual: '-2.1%', result: 'Pass' },
      { rule: 'HH Hourly Accuracy', threshold: '≥ 95%', actual: '97.3%', result: 'Pass' },
      { rule: 'EAC Tolerance', threshold: '±10%', actual: '+1.8%', result: 'Pass' },
    ],
    auditTrail: [
      {
        id: 'a1',
        timestamp: '2025-03-18T09:14:22Z',
        action: 'HH Data Refreshed',
        user: 'System',
        notes: 'HH data retrieved from EPS pricing engine. 362 days of complete data.',
        hhSnapshot: { eac: 485000, peakResidual: 3.2, offPeakResidual: -2.1, hhDays: 362 },
        dataChanged: false,
      },
      {
        id: 'a2',
        timestamp: '2025-03-18T09:14:25Z',
        action: 'Auto-Approved',
        user: 'System (Arc)',
        notes: 'All 6 tolerance checks passed. Quote auto-approved and forwarded to pricing engine.',
        hhSnapshot: { eac: 485000, peakResidual: 3.2, offPeakResidual: -2.1, hhDays: 362 },
        dataChanged: false,
      },
    ],
    // Validation fields (post-sign)
    mpan: '1580000277243',
    aq: 485000,
    unitRate: 24.6424,
    standingCharge: 0.89,
    roi: 8.2,
    failureCount: 2,
    creditApprovalStatus: 'N/A',
    creditApprover: '',
    signatoryName: 'John Smith',
    validationChecks: {
      dataIntegrity:     { status: 'Fail',    message: '1 of 3 sites: MPAN 1012345678901 site reference mismatch (red)', tab: 'data' },
      pricingAccuracy:   { status: 'Warning', message: '2 of 3 sites: BSUoS above range (site 2), MAP variance (site 3)', tab: 'pricing' },
      curveAlignment:    { status: 'Fail',    message: '1 of 3 sites: MPAN 1012345678901 locked to superseded ARC-CURVE-2025-Q3-v1', tab: 'quote' },
      ampIndicators:     { status: 'Fail',    message: '2 of 3 sites have AMP indicators requiring review', tab: 'quote' },
      roiCredit:         { status: 'Pass',    message: 'ROI 8.2% — above 5% threshold, no credit approval required', tab: 'aq-approval' },
      signatureReadiness:{ status: 'Pass',    message: 'Signatory verified against Companies House', tab: 'signature' },
    },
    dataChecks: [
      { id: 'd1', name: 'MPAN format',          expected: '13-digit numeric', actual: '1580000277243', status: 'Pass' },
      { id: 'd2', name: 'EAC within tolerance', expected: '400,000–600,000 kWh', actual: '485,000 kWh', status: 'Pass' },
      { id: 'd3', name: 'Contract start date',  expected: '01/10/2025', actual: '01/10/2025', status: 'Pass' },
      { id: 'd4', name: 'Contract duration',    expected: '24 months', actual: '24 months', status: 'Pass' },
      { id: 'd5', name: 'Supplier code',        expected: 'Engie (ENE)', actual: 'ENE', status: 'Pass' },
      { id: 'd6', name: 'HH Data Quality',      expected: 'Complete 30-min intervals', actual: 'All intervals complete', status: 'Pass' },
    ],
    ampIndicators: [],
    pricingRows: BASE_PRICING_ROWS,
    standingRows: BASE_STANDING_ROWS,
    curveData: makeCurve(24.6424, false),
    curveName: 'ARC-CURVE-2025-Q4-v3',
    currentCurveName: 'ARC-CURVE-2025-Q4-v3',
    companiesHouse: {
      companyName: 'Meridian Foods Ltd',
      companyNumber: '08234510',
      registeredAddress: 'Unit 4, Meridian Park, Birmingham, B6 5RQ',
      directors: [
        { name: 'John Smith', role: 'Managing Director', appointed: '14/03/2018', psc: true },
        { name: 'Claire Barnett', role: 'Finance Director', appointed: '01/09/2020', psc: false },
      ],
    },
  },

  {
    id: '2',
    ref: 'PQ00000002',
    basketId: 'BSK-001',
    customer: 'BLACKSTONE MANUFACTURING',
    accountManager: 'James Okafor',
    analyst: 'Fatima Al-Rashid',
    quoteType: 'Renewal',
    eac: 1200000,
    supplier: 'EDF Energy',
    hhSites: 3,
    dataAge: 18,
    status: 'Manual Review',
    contractStart: '01/04/2026',
    contractEnd: '31/03/2028',
    pricingWarning: true,
    sites: [
      {
        id: 's3',
        mpan: '1-098-765-432-100',
        address: '12 Forge Road, Sheffield, S9 2WR',
        eac: 640000,
        mop: 'EDF MOP Services',
        dataAge: 18,
        profileClass: 'HH',
        meterType: 'AMR',
        consumption: { annual: 640000, peak: 390400, offPeak: 249600 },
        hhData: site3HH,
        toleranceResults: [
          { rule: 'Customer EAC Threshold', threshold: '≥ 100,000 kWh', actual: '640,000 kWh', result: 'Pass' },
          { rule: 'HH Days Tolerance', threshold: '≥ 300 days', actual: '289 days', result: 'Fail' },
          { rule: 'Residual Peak Tolerance', threshold: '±5%', actual: '+6.8%', result: 'Fail' },
          { rule: 'Residual Off-Peak Tolerance', threshold: '±8%', actual: '+4.2%', result: 'Pass' },
          { rule: 'HH Hourly Accuracy', threshold: '≥ 95%', actual: '93.4%', result: 'Fail' },
          { rule: 'EAC Tolerance', threshold: '±10%', actual: '+8.1%', result: 'Pass' },
        ],
        siteRef: 'BSTONE-MAIN',
        aq: 1200000,
        unitRate: 22.14,
        standingCharge: 52.00,
        contractStart: '01/10/2025',
        contractEnd: '30/09/2027',
        dataChecks: [
          { id: 'd1', name: 'MPAN format',          expected: '13-digit numeric', actual: '1087234567800', status: 'Pass' },
          { id: 'd2', name: 'EAC within tolerance', expected: '900,000–1,500,000 kWh', actual: '1,200,000 kWh', status: 'Pass' },
          { id: 'd3', name: 'Contract start date',  expected: '01/10/2025', actual: '01/10/2025', status: 'Pass' },
          { id: 'd4', name: 'Contract duration',    expected: '24 months', actual: '24 months', status: 'Pass' },
          { id: 'd5', name: 'Supplier code',        expected: 'EDF Energy (EDF)', actual: 'EDF', status: 'Pass' },
        ],
        ampIndicators: [],
        pricingRows: BASE_PRICING_ROWS.map(r => ({ ...r, value: +(r.value * 0.895).toFixed(4) })),
        standingRows: BASE_STANDING_ROWS,
        curveData: makeCurve(22.14, false),
        curveName: 'ARC-CURVE-2025-Q4-v3',
        currentCurveName: 'ARC-CURVE-2025-Q4-v3',
        hhDataQuality: 'Pass',
      },
      {
        id: 's4',
        mpan: '1-023-456-789-012',
        address: '14 Forge Road, Sheffield, S9 2WR',
        eac: 320000,
        mop: 'EDF MOP Services',
        dataAge: 18,
        profileClass: 'HH',
        meterType: 'AMR',
        consumption: { annual: 320000, peak: 185600, offPeak: 134400 },
        hhData: site1HH,
        toleranceResults: [
          { rule: 'Customer EAC Threshold', threshold: '≥ 100,000 kWh', actual: '320,000 kWh', result: 'Pass' },
          { rule: 'HH Days Tolerance', threshold: '≥ 300 days', actual: '341 days', result: 'Pass' },
          { rule: 'Residual Peak Tolerance', threshold: '±5%', actual: '+2.9%', result: 'Pass' },
          { rule: 'Residual Off-Peak Tolerance', threshold: '±8%', actual: '-3.1%', result: 'Pass' },
          { rule: 'HH Hourly Accuracy', threshold: '≥ 95%', actual: '96.8%', result: 'Pass' },
          { rule: 'EAC Tolerance', threshold: '±10%', actual: '+5.4%', result: 'Pass' },
        ],
        siteRef: 'BSTONE-ANNEX',
        aq: 650000,
        unitRate: 22.14,
        standingCharge: 52.00,
        contractStart: '01/10/2025',
        contractEnd: '30/09/2027',
        dataChecks: [
          { id: 'd1', name: 'MPAN format',          expected: '13-digit numeric', actual: '1087234567811', status: 'Pass' },
          { id: 'd2', name: 'EAC within tolerance', expected: '500,000–800,000 kWh', actual: '650,000 kWh', status: 'Pass' },
          { id: 'd3', name: 'Contract start date',  expected: '01/10/2025', actual: '01/10/2025', status: 'Pass' },
          { id: 'd4', name: 'Contract duration',    expected: '24 months', actual: '24 months', status: 'Pass' },
          { id: 'd5', name: 'Supplier code',        expected: 'EDF Energy (EDF)', actual: 'EDF', status: 'Pass' },
          { id: 'd6', name: 'HH Data Quality',      expected: 'Complete 30-min intervals', actual: '5 missing intervals', status: 'Warning' },
        ],
        ampIndicators: [
          { id: 'amp-b1', label: 'Start date discrepancy', severity: 'amber', detail: 'Contract start 01/10/2025 vs AMP effective 08/10/2025 — 7-day gap' },
        ],
        pricingRows: BASE_PRICING_ROWS.map(r => ({ ...r, value: +(r.value * 0.895).toFixed(4) })),
        standingRows: BASE_STANDING_ROWS,
        curveData: makeCurve(22.14, false),
        curveName: 'ARC-CURVE-2025-Q4-v3',
        currentCurveName: 'ARC-CURVE-2025-Q4-v3',
        hhDataQuality: 'Warning',
      },
      {
        id: 's5',
        mpan: '1-034-567-890-123',
        address: '16 Forge Road, Sheffield, S9 2WR',
        eac: 240000,
        mop: 'EDF MOP Services',
        dataAge: 18,
        profileClass: 'HH',
        meterType: 'AMR',
        consumption: { annual: 240000, peak: 139200, offPeak: 100800 },
        hhData: site2HH,
        toleranceResults: [
          { rule: 'Customer EAC Threshold', threshold: '≥ 100,000 kWh', actual: '240,000 kWh', result: 'Pass' },
          { rule: 'HH Days Tolerance', threshold: '≥ 300 days', actual: '312 days', result: 'Pass' },
          { rule: 'Residual Peak Tolerance', threshold: '±5%', actual: '+1.4%', result: 'Pass' },
          { rule: 'Residual Off-Peak Tolerance', threshold: '±8%', actual: '-0.8%', result: 'Pass' },
          { rule: 'HH Hourly Accuracy', threshold: '≥ 95%', actual: '97.9%', result: 'Pass' },
          { rule: 'EAC Tolerance', threshold: '±10%', actual: '+2.2%', result: 'Pass' },
        ],
      },
    ],
    toleranceResults: [
      { rule: 'Customer EAC Threshold', threshold: '≥ 100,000 kWh', actual: '1,200,000 kWh', result: 'Pass' },
      { rule: 'HH Days Tolerance', threshold: '≥ 300 days', actual: '289 days', result: 'Fail' },
      { rule: 'Residual Peak Tolerance', threshold: '±5%', actual: '+6.8%', result: 'Fail' },
      { rule: 'Residual Off-Peak Tolerance', threshold: '±8%', actual: '+4.2%', result: 'Pass' },
      { rule: 'HH Hourly Accuracy', threshold: '≥ 95%', actual: '93.4%', result: 'Pass' },
      { rule: 'EAC Tolerance', threshold: '±10%', actual: '+8.1%', result: 'Pass' },
    ],
    auditTrail: [
      {
        id: 'b1',
        timestamp: '2025-03-15T14:32:10Z',
        action: 'HH Data Refreshed',
        user: 'System',
        notes: 'Initial HH data retrieval from EPS. Only 289 days available — data gap identified.',
        hhSnapshot: { eac: 1100000, peakResidual: 4.2, offPeakResidual: 2.8, hhDays: 289 },
        dataChanged: false,
      },
      {
        id: 'b2',
        timestamp: '2025-03-20T08:55:03Z',
        action: 'HH Data Refreshed',
        user: 'System',
        notes: 'Re-fetched HH data following AM resubmission. EAC variance increased.',
        hhSnapshot: { eac: 1200000, peakResidual: 6.8, offPeakResidual: 4.2, hhDays: 289 },
        dataChanged: true,
      },
      {
        id: 'b3',
        timestamp: '2025-03-20T08:55:06Z',
        action: 'Submitted for Review',
        user: 'System (Arc)',
        notes: '2 tolerance failures detected: HH Days below threshold (289 < 300), Residual Peak exceeded (+6.8% vs ±5%). Routed to Manual Review.',
      },
    ],
    // Validation fields (post-sign)
    mpan: '1087234567800',
    aq: 1850000,
    unitRate: 22.14,
    standingCharge: 52.00,
    roi: 3.1,
    failureCount: 1,
    creditApprovalStatus: 'Pending',
    creditApprover: 'Phil Marsden',
    signatoryName: 'David Blackstone',
    validationChecks: {
      dataIntegrity:     { status: 'Pass', message: 'All data checks passed', tab: 'data' },
      pricingAccuracy:   { status: 'Pass', message: 'Unit rate and standing charge verified', tab: 'pricing' },
      curveAlignment:    { status: 'Pass', message: 'Contract aligned to approved curve', tab: 'quote' },
      ampIndicators:     { status: 'Pass', message: 'No AMP conflicts detected', tab: 'quote' },
      roiCredit:         { status: 'Fail', message: 'ROI 3.1% — below 5% credit threshold. Credit approval required.', tab: 'aq-approval' },
      signatureReadiness:{ status: 'Warning', message: 'Signatory not yet verified', tab: 'signature' },
    },
    dataChecks: [
      { id: 'd1', name: 'MPAN format',          expected: '13-digit numeric', actual: '1087234567800', status: 'Pass' },
      { id: 'd2', name: 'EAC within tolerance', expected: '1,500,000–2,200,000 kWh', actual: '1,850,000 kWh', status: 'Pass' },
      { id: 'd3', name: 'Contract start date',  expected: '01/10/2025', actual: '01/10/2025', status: 'Pass' },
      { id: 'd4', name: 'Contract duration',    expected: '24 months', actual: '24 months', status: 'Pass' },
      { id: 'd5', name: 'Supplier code',        expected: 'EDF Energy (EDF)', actual: 'EDF', status: 'Pass' },
    ],
    ampIndicators: [],
    pricingRows: BASE_PRICING_ROWS.map(r => ({ ...r, value: +(r.value * 0.895).toFixed(4) })),
    standingRows: BASE_STANDING_ROWS,
    curveData: makeCurve(22.14, false),
    curveName: 'ARC-CURVE-2025-Q4-v3',
    currentCurveName: 'ARC-CURVE-2025-Q4-v3',
    companiesHouse: {
      companyName: 'Blackstone Manufacturing Ltd',
      companyNumber: '04917832',
      registeredAddress: '12 Forge Road, Sheffield, S9 2WR',
      directors: [
        { name: 'Margaret Holt', role: 'Chief Executive', appointed: '02/06/2015', psc: true },
        { name: 'Trevor Blackstone', role: 'Operations Director', appointed: '11/01/2019', psc: false },
      ],
    },
  },

  {
    id: '3',
    ref: 'PQ00000003',
    basketId: 'BSK-001',
    customer: 'HARTLEY LOGISTICS GROUP',
    accountManager: 'Priya Nair',
    analyst: 'Tom Walsh',
    quoteType: 'Mixed',
    eac: 750000,
    supplier: 'British Gas',
    hhSites: 1,
    dataAge: 8,
    status: 'Rejected',
    contractStart: '01/07/2025',
    contractEnd: '30/06/2027',
    pricingWarning: false,
    failureReasons: ['Residual peak exceeded', 'HH days insufficient'],
    sites: [
      {
        id: 's6',
        mpan: '1-045-678-901-234',
        address: 'Depot 1, Hartley Way, Leeds, LS10 2NQ',
        eac: 750000,
        mop: 'BG Metering Ltd',
        dataAge: 8,
        profileClass: 'HH',
        meterType: 'AMR',
        consumption: { annual: 750000, peak: 450000, offPeak: 300000 },
        hhData: site1HH,
        toleranceResults: [
          { rule: 'Customer EAC Threshold', threshold: '≥ 100,000 kWh', actual: '750,000 kWh', result: 'Pass' },
          { rule: 'HH Days Tolerance', threshold: '≥ 300 days', actual: '278 days', result: 'Fail' },
          { rule: 'Residual Peak Tolerance', threshold: '±5%', actual: '+7.4%', result: 'Fail' },
          { rule: 'Residual Off-Peak Tolerance', threshold: '±8%', actual: '-3.2%', result: 'Pass' },
          { rule: 'HH Hourly Accuracy', threshold: '≥ 95%', actual: '96.2%', result: 'Pass' },
          { rule: 'EAC Tolerance', threshold: '±10%', actual: '+6.5%', result: 'Pass' },
        ],
      },
    ],
    toleranceResults: [
      { rule: 'Customer EAC Threshold', threshold: '≥ 100,000 kWh', actual: '750,000 kWh', result: 'Pass' },
      { rule: 'HH Days Tolerance', threshold: '≥ 300 days', actual: '278 days', result: 'Fail' },
      { rule: 'Residual Peak Tolerance', threshold: '±5%', actual: '+7.4%', result: 'Fail' },
      { rule: 'Residual Off-Peak Tolerance', threshold: '±8%', actual: '-3.2%', result: 'Pass' },
      { rule: 'HH Hourly Accuracy', threshold: '≥ 95%', actual: '96.2%', result: 'Pass' },
      { rule: 'EAC Tolerance', threshold: '±10%', actual: '+6.5%', result: 'Pass' },
    ],
    auditTrail: [
      {
        id: 'c1',
        timestamp: '2025-03-10T11:20:44Z',
        action: 'HH Data Refreshed',
        user: 'System',
        notes: 'HH data retrieved. 278 days available — below 300 day threshold.',
        hhSnapshot: { eac: 750000, peakResidual: 7.4, offPeakResidual: -3.2, hhDays: 278 },
        dataChanged: false,
      },
      {
        id: 'c2',
        timestamp: '2025-03-10T11:20:47Z',
        action: 'Submitted for Review',
        user: 'System (Arc)',
        notes: '2 failures detected. Routed to Manual Review queue.',
      },
      {
        id: 'c3',
        timestamp: '2025-03-11T15:44:10Z',
        action: 'Rejected',
        user: 'Tom Walsh',
        notes: 'Residual peak exceeded tolerance at +7.4%. HH days below minimum threshold (278 < 300). Returned to Priya Nair — Account Manager to obtain additional HH data and resubmit.',
        hhSnapshot: { eac: 750000, peakResidual: 7.4, offPeakResidual: -3.2, hhDays: 278 },
        dataChanged: false,
      },
    ],
  },

  {
    id: '4',
    ref: 'PQ00000004',
    basketId: 'BSK-002',
    customer: 'FERNWOOD RETAIL LTD',
    accountManager: 'Sarah Briggs',
    analyst: 'Fatima Al-Rashid',
    quoteType: 'Framework',
    eac: 320000,
    supplier: 'Engie',
    hhSites: 2,
    dataAge: 5,
    status: 'Auto-Approved',
    contractStart: '01/01/2026',
    contractEnd: '31/12/2027',
    pricingWarning: false,
    sites: [
      {
        id: 's7',
        mpan: '1-056-789-012-345',
        address: 'Store 1, Fernwood Park, Nottingham, NG8 3HA',
        eac: 175000,
        mop: 'NPOWER MOP',
        dataAge: 5,
        profileClass: 'HH',
        meterType: 'AMR',
        consumption: { annual: 175000, peak: 98000, offPeak: 77000 },
        hhData: site2HH,
        toleranceResults: [
          { rule: 'Customer EAC Threshold', threshold: '≥ 100,000 kWh', actual: '175,000 kWh', result: 'Pass' },
          { rule: 'HH Days Tolerance', threshold: '≥ 300 days', actual: '358 days', result: 'Pass' },
          { rule: 'Residual Peak Tolerance', threshold: '±5%', actual: '+1.7%', result: 'Pass' },
          { rule: 'Residual Off-Peak Tolerance', threshold: '±8%', actual: '-1.3%', result: 'Pass' },
          { rule: 'HH Hourly Accuracy', threshold: '≥ 95%', actual: '98.9%', result: 'Pass' },
          { rule: 'EAC Tolerance', threshold: '±10%', actual: '+0.4%', result: 'Pass' },
        ],
      },
      {
        id: 's8',
        mpan: '1-067-890-123-456',
        address: 'Store 2, Fernwood Park, Nottingham, NG8 3HB',
        eac: 145000,
        mop: 'NPOWER MOP',
        dataAge: 5,
        profileClass: 'HH',
        meterType: 'AMR',
        consumption: { annual: 145000, peak: 83200, offPeak: 61800 },
        hhData: site3HH,
        toleranceResults: [
          { rule: 'Customer EAC Threshold', threshold: '≥ 100,000 kWh', actual: '145,000 kWh', result: 'Pass' },
          { rule: 'HH Days Tolerance', threshold: '≥ 300 days', actual: '358 days', result: 'Pass' },
          { rule: 'Residual Peak Tolerance', threshold: '±5%', actual: '+0.9%', result: 'Pass' },
          { rule: 'Residual Off-Peak Tolerance', threshold: '±8%', actual: '+2.2%', result: 'Pass' },
          { rule: 'HH Hourly Accuracy', threshold: '≥ 95%', actual: '99.1%', result: 'Pass' },
          { rule: 'EAC Tolerance', threshold: '±10%', actual: '-1.1%', result: 'Pass' },
        ],
      },
    ],
    toleranceResults: [
      { rule: 'Customer EAC Threshold', threshold: '≥ 100,000 kWh', actual: '320,000 kWh', result: 'Pass' },
      { rule: 'HH Days Tolerance', threshold: '≥ 300 days', actual: '358 days', result: 'Pass' },
      { rule: 'Residual Peak Tolerance', threshold: '±5%', actual: '+1.7%', result: 'Pass' },
      { rule: 'Residual Off-Peak Tolerance', threshold: '±8%', actual: '-1.3%', result: 'Pass' },
      { rule: 'HH Hourly Accuracy', threshold: '≥ 95%', actual: '98.9%', result: 'Pass' },
      { rule: 'EAC Tolerance', threshold: '±10%', actual: '+0.4%', result: 'Pass' },
    ],
    auditTrail: [
      {
        id: 'd1',
        timestamp: '2025-03-20T16:02:30Z',
        action: 'HH Data Refreshed',
        user: 'System',
        notes: '358 days of complete HH data retrieved.',
        hhSnapshot: { eac: 320000, peakResidual: 1.7, offPeakResidual: -1.3, hhDays: 358 },
        dataChanged: false,
      },
      {
        id: 'd2',
        timestamp: '2025-03-20T16:02:32Z',
        action: 'Auto-Approved',
        user: 'System (Arc)',
        notes: 'All 6 tolerance checks passed. Auto-approved and sent to pricing.',
        hhSnapshot: { eac: 320000, peakResidual: 1.7, offPeakResidual: -1.3, hhDays: 358 },
        dataChanged: false,
      },
    ],
  },

  {
    id: '5',
    ref: 'PQ00000005',
    basketId: 'BSK-002',
    customer: 'CASTLEFORD INDUSTRIAL',
    accountManager: 'James Okafor',
    analyst: 'Tom Walsh',
    quoteType: 'Renewal',
    eac: 1400000,
    supplier: 'EDF Energy',
    hhSites: 4,
    dataAge: 35,
    status: 'Manual Review',
    contractStart: '01/06/2026',
    contractEnd: '31/05/2028',
    pricingWarning: true,
    sites: [
      {
        id: 's9',
        mpan: '1-078-901-234-567',
        address: 'Plant A, Castleford Works, WF10 4TH',
        eac: 420000,
        mop: 'EDF MOP Services',
        dataAge: 35,
        profileClass: 'HH',
        meterType: 'AMR',
        consumption: { annual: 420000, peak: 252000, offPeak: 168000 },
        hhData: site1HH,
        toleranceResults: [
          { rule: 'Customer EAC Threshold', threshold: '≥ 100,000 kWh', actual: '420,000 kWh', result: 'Pass' },
          { rule: 'HH Days Tolerance', threshold: '≥ 300 days', actual: '318 days', result: 'Pass' },
          { rule: 'Residual Peak Tolerance', threshold: '±5%', actual: '+3.9%', result: 'Pass' },
          { rule: 'Residual Off-Peak Tolerance', threshold: '±8%', actual: '-5.2%', result: 'Pass' },
          { rule: 'HH Hourly Accuracy', threshold: '≥ 95%', actual: '96.5%', result: 'Pass' },
          { rule: 'EAC Tolerance', threshold: '±10%', actual: '+4.2%', result: 'Pass' },
        ],
        siteRef: 'CFORD-PLANT-A',
        aq: 200000,
        unitRate: 24.85,
        standingCharge: 1.05,
        contractStart: '01/10/2025',
        contractEnd: '30/09/2027',
        dataChecks: [
          { id: 'd1', name: 'MPAN format',          expected: '13-digit numeric', actual: '1012345678901', status: 'Pass' },
          { id: 'd2', name: 'EAC within tolerance', expected: '150,000–250,000 kWh', actual: '200,000 kWh', status: 'Pass' },
          { id: 'd3', name: 'Contract start date',  expected: '01/10/2025', actual: '01/10/2025', status: 'Pass' },
          { id: 'd4', name: 'Contract duration',    expected: '24 months', actual: '24 months', status: 'Pass' },
          { id: 'd5', name: 'Supplier code',        expected: 'Engie (ENE)', actual: 'ENE', status: 'Pass' },
        ],
        ampIndicators: [
          { id: 'amp1', label: 'Site reference mismatch', severity: 'red',   detail: 'CFORD-PLANT-A on contract vs SITE-001 in AMP — manual reconciliation required' },
          { id: 'amp2', label: 'Start date discrepancy',  severity: 'amber', detail: 'Contract start 01/10/2025 vs AMP effective date 15/10/2025 — 14-day gap' },
        ],
        pricingRows: BASE_PRICING_ROWS,
        standingRows: MISMATCH_STANDING_ROWS,
        curveData: makeCurve(24.85, true),
        curveName: 'ARC-CURVE-2025-Q3-v1',
        currentCurveName: 'ARC-CURVE-2025-Q4-v3',
        hhDataQuality: 'Pass',
      },
      // Site 2 — from c3.mpans[1] (MPAN 1012345679902, CFORD-WAREHOUSE)
      {
        id: 's10',
        mpan: '1-012-345-679-902',
        address: 'Warehouse, Castleford Works, WF10 4TJ',
        eac: 120000,
        mop: 'EDF MOP Services',
        dataAge: 35,
        profileClass: 'HH',
        meterType: 'AMR',
        consumption: { annual: 120000, peak: 69600, offPeak: 50400 },
        hhData: site2HH,
        toleranceResults: [
          { rule: 'Customer EAC Threshold', threshold: '≥ 100,000 kWh', actual: '120,000 kWh', result: 'Pass' },
          { rule: 'HH Days Tolerance', threshold: '≥ 300 days', actual: '330 days', result: 'Pass' },
          { rule: 'Residual Peak Tolerance', threshold: '±5%', actual: '+2.1%', result: 'Pass' },
          { rule: 'Residual Off-Peak Tolerance', threshold: '±8%', actual: '-1.5%', result: 'Pass' },
          { rule: 'HH Hourly Accuracy', threshold: '≥ 95%', actual: '97.8%', result: 'Pass' },
          { rule: 'EAC Tolerance', threshold: '±10%', actual: '+1.5%', result: 'Pass' },
        ],
        siteRef: 'CFORD-WAREHOUSE',
        aq: 120000,
        unitRate: 24.85,
        standingCharge: 0.78,
        contractStart: '01/10/2025',
        contractEnd: '30/09/2027',
        dataChecks: [
          { id: 'd1', name: 'MPAN format',          expected: '13-digit numeric', actual: '1012345679902', status: 'Pass' },
          { id: 'd2', name: 'EAC within tolerance', expected: '90,000–150,000 kWh', actual: '120,000 kWh', status: 'Pass' },
          { id: 'd3', name: 'Contract start date',  expected: '01/10/2025', actual: '01/10/2025', status: 'Pass' },
          { id: 'd4', name: 'Contract duration',    expected: '24 months', actual: '24 months', status: 'Pass' },
          { id: 'd5', name: 'Supplier code',        expected: 'Engie (ENE)', actual: 'ENE', status: 'Pass' },
        ],
        ampIndicators: [],
        pricingRows: BASE_PRICING_ROWS,
        standingRows: BASE_STANDING_ROWS,
        curveData: makeCurve(24.85, false),
        curveName: 'ARC-CURVE-2025-Q4-v3',
        currentCurveName: 'ARC-CURVE-2025-Q4-v3',
        hhDataQuality: 'Pass',
      },
    ],
    toleranceResults: [
      { rule: 'Customer EAC Threshold', threshold: '≥ 100,000 kWh', actual: '1,400,000 kWh', result: 'Pass' },
      { rule: 'HH Days Tolerance', threshold: '≥ 300 days', actual: '318 days', result: 'Pass' },
      { rule: 'Residual Peak Tolerance', threshold: '±5%', actual: '+3.9%', result: 'Pass' },
      { rule: 'Residual Off-Peak Tolerance', threshold: '±8%', actual: '-5.2%', result: 'Pass' },
      { rule: 'HH Hourly Accuracy', threshold: '≥ 95%', actual: '96.5%', result: 'Pass' },
      { rule: 'EAC Tolerance', threshold: '±10%', actual: '+4.2%', result: 'Pass' },
    ],
    auditTrail: [
      {
        id: 'e1',
        timestamp: '2025-02-16T07:45:00Z',
        action: 'HH Data Refreshed',
        user: 'System',
        notes: 'HH data retrieved 35 days ago. Data approaching staleness threshold (>30 days).',
        hhSnapshot: { eac: 1400000, peakResidual: 3.9, offPeakResidual: -5.2, hhDays: 318 },
        dataChanged: false,
      },
    ],
    // Validation fields (post-sign)
    mpan: '1012345678901',
    aq: 320000,
    unitRate: 24.85,
    standingCharge: 1.05,
    roi: 6.8,
    failureCount: 2,
    creditApprovalStatus: 'N/A',
    creditApprover: '',
    signatoryName: 'Andrea Mills',
    validationChecks: {
      dataIntegrity:     { status: 'Pass', message: 'All data checks passed', tab: 'data' },
      pricingAccuracy:   { status: 'Warning', message: 'Standing charge variance detected (+£0.16/day vs contract)', tab: 'pricing' },
      curveAlignment:    { status: 'Fail', message: 'Contract locked to superseded curve — approval required', tab: 'quote' },
      ampIndicators:     { status: 'Warning', message: '2 AMP indicators require review', tab: 'quote' },
      roiCredit:         { status: 'Pass', message: 'ROI 6.8% — above 5% threshold', tab: 'aq-approval' },
      signatureReadiness:{ status: 'Warning', message: 'Signatory not yet verified', tab: 'signature' },
    },
    dataChecks: [
      { id: 'd1', name: 'MPAN format',          expected: '13-digit numeric', actual: '1012345678901', status: 'Pass' },
      { id: 'd2', name: 'EAC within tolerance', expected: '250,000–400,000 kWh', actual: '320,000 kWh', status: 'Pass' },
      { id: 'd3', name: 'Contract start date',  expected: '01/10/2025', actual: '01/10/2025', status: 'Pass' },
      { id: 'd4', name: 'Contract duration',    expected: '24 months', actual: '24 months', status: 'Pass' },
      { id: 'd5', name: 'Supplier code',        expected: 'Engie (ENE)', actual: 'ENE', status: 'Pass' },
    ],
    ampIndicators: [
      { id: 'amp1', label: 'Site reference mismatch', severity: 'red',   detail: 'SITE-REF-001 on contract vs SITE-001 in AMP — manual reconciliation required' },
      { id: 'amp2', label: 'Start date discrepancy',  severity: 'amber', detail: 'Contract start 01/10/2025 vs AMP effective date 15/10/2025 — 14-day gap' },
    ],
    pricingRows: BASE_PRICING_ROWS,
    standingRows: MISMATCH_STANDING_ROWS,
    curveData: makeCurve(24.85, true),
    curveName: 'ARC-CURVE-2025-Q3-v1',
    currentCurveName: 'ARC-CURVE-2025-Q4-v3',
    companiesHouse: {
      companyName: 'Castleford Industrial Ltd',
      companyNumber: '07612948',
      registeredAddress: 'Plant A, Castleford Works, WF10 4TH',
      directors: [
        { name: 'Andrea Mills', role: 'Managing Director', appointed: '08/02/2017', psc: true },
        { name: 'Kieran Doyle', role: 'Finance Director', appointed: '15/05/2021', psc: false },
      ],
    },
  },
];

export const configRules = [
  { id: 'r1', name: 'Customer EAC Threshold', threshold: '100,000', type: 'kWh', active: true, description: 'Minimum annual consumption for HH curve eligibility' },
  { id: 'r2', name: 'HH Days Tolerance', threshold: '300', type: 'days', active: true, description: 'Minimum number of HH days required for curve approval' },
  { id: 'r3', name: 'Residual Peak Tolerance', threshold: '5', type: '%', active: true, description: 'Maximum allowed residual variance on peak periods' },
  { id: 'r4', name: 'Residual Off-Peak Tolerance', threshold: '8', type: '%', active: true, description: 'Maximum allowed residual variance on off-peak periods' },
  { id: 'r5', name: 'HH Hourly Accuracy Tolerance', threshold: '95', type: '%', active: true, description: 'Minimum % of HH intervals that must be valid (non-missing)' },
  { id: 'r6', name: 'EAC Tolerance', threshold: '10', type: '%', active: true, description: 'Maximum allowed variance between quoted EAC and HH-derived EAC' },
  { id: 'r7', name: 'Stale Data Warning Threshold', threshold: '30', type: 'days', active: true, description: 'Age at which HH data is flagged as potentially stale' },
];
