export type ContractStatus = 'Pending' | 'Auto-Approved' | 'Manual Review' | 'Failed' | 'Accepted';
export type ContractType = 'Renewal' | 'New Business';
export type ValidationResult = 'Pass' | 'Fail' | 'Warning' | 'Pending';
export type TabId = 'overview' | 'data' | 'pricing' | 'quote' | 'signature' | 'aq-approval';
export type CreditStatus = 'N/A' | 'Pending' | 'Approved' | 'Rejected';

export interface ValidationCheck {
  status: ValidationResult;
  message: string;
  tab: TabId;
}

export interface PricingRow {
  id: string;
  name: string;
  value: number;
  anomalyRange?: { min: number; max: number };
  warnIfZero?: boolean;
}

export interface CurvePoint {
  period: string;
  original: number;
  current: number;
}

export interface DataCheck {
  id: string;
  name: string;
  expected: string;
  actual: string;
  status: ValidationResult;
  actionRequired?: string;
}

export interface AmpIndicator {
  id: string;
  label: string;
  severity: 'red' | 'amber';
  detail: string;
}

export interface Director {
  name: string;
  role: string;
  appointed: string;
  psc: boolean;
}

export interface AuditEvent {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  detail: string;
  category: 'auto' | 'manual' | 'system';
}

export interface Contract {
  id: string;
  ref: string;
  customer: string;
  accountManager: string;
  aq: number;
  contractType: ContractType;
  submissionDate: string;
  contractStart: string;
  contractEnd: string;
  mpan: string;
  supplier: string;
  unitRate: number;
  standingCharge: number;
  roi: number;
  status: ContractStatus;
  failureCount: number;
  creditApprovalStatus: CreditStatus;
  creditApprover: string;
  signatoryName: string;
  validationChecks: {
    dataIntegrity: ValidationCheck;
    pricingAccuracy: ValidationCheck;
    curveAlignment: ValidationCheck;
    ampIndicators: ValidationCheck;
    roiCredit: ValidationCheck;
    signatureReadiness: ValidationCheck;
  };
  pricingRows: PricingRow[];
  standingRows: PricingRow[];
  curveData: CurvePoint[];
  curveName: string;
  currentCurveName: string;
  dataChecks: DataCheck[];
  ampIndicators: AmpIndicator[];
  companiesHouse: {
    companyName: string;
    companyNumber: string;
    registeredAddress: string;
    directors: Director[];
  };
  auditTrail: AuditEvent[];
}

// ─── Curve helpers ────────────────────────────────────────────────

function makeCurve(baseRate: number, mismatch: boolean): CurvePoint[] {
  let seed = 42;
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    return (Math.abs(seed) / 0x7fffffff - 0.5);
  };
  return Array.from({ length: 24 }, (_, h) => {
    const isPeak = h >= 7 && h < 19;
    const isNight = h < 6 || h >= 22;
    const mult = isPeak ? 1.28 : isNight ? 0.72 : 1.0;
    const orig = +(baseRate * mult + rand() * 0.4).toFixed(4);
    const drift = mismatch && isPeak
      ? baseRate * (0.10 + rand() * 0.06)
      : rand() * 0.18;
    return {
      period: `${String(h).padStart(2, '0')}:00`,
      original: orig,
      current: +(orig + drift).toFixed(4),
    };
  });
}

// ─── Unit-rate components (from brief) ────────────────────────────

const BASE_PRICING_ROWS: PricingRow[] = [
  { id: 'wholesale',   name: 'Wholesale Energy',   value: 13.2119, anomalyRange: { min: 10, max: 16 } },
  { id: 'risk',        name: 'Risk Premium',        value: 0.3218,  anomalyRange: { min: 0.1, max: 0.6 } },
  { id: 'duos',        name: 'DUoS Variable',       value: 2.5132,  anomalyRange: { min: 1.5, max: 3.5 } },
  { id: 'tnuos',       name: 'TNUoS Variable',      value: 0.0000,  warnIfZero: true },
  { id: 'aahedc',      name: 'AAHEDC',              value: 0.0420,  anomalyRange: { min: 0.02, max: 0.08 } },
  { id: 'bsuos',       name: 'BSUoS',               value: 1.2612,  anomalyRange: { min: 0.8, max: 1.2 } },
  { id: 'cm',          name: 'Capacity Market',     value: 1.1495,  anomalyRange: { min: 0.8, max: 1.4 } },
  { id: 'cfd',         name: 'CfD',                 value: 1.1860,  anomalyRange: { min: 0.8, max: 1.4 } },
  { id: 'eii',         name: 'EII Support Levy',    value: 0.5396,  anomalyRange: { min: 0.3, max: 0.7 } },
  { id: 'fit',         name: 'FiT',                 value: 0.7812,  anomalyRange: { min: 0.5, max: 1.0 } },
  { id: 'rego',        name: 'REGO',                value: 0.1875,  anomalyRange: { min: 0.1, max: 0.3 } },
  { id: 'roc',         name: 'Renewable Obligation',value: 3.3060,  anomalyRange: { min: 2.5, max: 4.0 } },
  { id: 'tc',          name: 'Transaction Cost',    value: 0.1427,  anomalyRange: { min: 0.05, max: 0.2 } },
];

const BASE_STANDING_ROWS: PricingRow[] = [
  { id: 'duos_fixed',  name: 'DUoS Fixed',          value: 0.17 },
  { id: 'tnuos_fixed', name: 'TNUoS Fixed',          value: 0.24 },
  { id: 'map',         name: 'Metering (MAP)',        value: 0.37 },
  { id: 'mop',         name: 'Metering (MOP)',        value: 0.03 },
  { id: 'dcda',        name: 'Metering (DC/DA)',      value: 0.01 },
  { id: 'dr',          name: 'Metering (DR)',         value: 0.08 },
];

// Standing rows for the mismatch contract — standing charge variance
const MISMATCH_STANDING_ROWS: PricingRow[] = [
  { id: 'duos_fixed',  name: 'DUoS Fixed',          value: 0.17 },
  { id: 'tnuos_fixed', name: 'TNUoS Fixed',          value: 0.24 },
  { id: 'map',         name: 'Metering (MAP)',        value: 0.51, anomalyRange: { min: 0.30, max: 0.45 } },
  { id: 'mop',         name: 'Metering (MOP)',        value: 0.03 },
  { id: 'dcda',        name: 'Metering (DC/DA)',      value: 0.01 },
  { id: 'dr',          name: 'Metering (DR)',         value: 0.08 },
];

// ─── Contracts ────────────────────────────────────────────────────

export const initialContracts: Contract[] = [
  // ── CON-2024-04421 — Full happy path ─────────────────────────
  {
    id: 'c1',
    ref: 'CON-2024-04421',
    customer: 'MERIDIAN FOODS LTD',
    accountManager: 'James Okafor',
    aq: 485000,
    contractType: 'New Business',
    submissionDate: '2025-09-12',
    contractStart: '01/10/2025',
    contractEnd: '30/09/2027',
    mpan: '1580000277243',
    supplier: 'Engie',
    unitRate: 24.6424,
    standingCharge: 0.89,
    roi: 8.2,
    status: 'Auto-Approved',
    failureCount: 0,
    creditApprovalStatus: 'N/A',
    creditApprover: '',
    signatoryName: 'John Smith',
    validationChecks: {
      dataIntegrity:     { status: 'Pass', message: 'All data checks passed', tab: 'data' },
      pricingAccuracy:   { status: 'Pass', message: 'Unit rate and standing charge verified', tab: 'pricing' },
      curveAlignment:    { status: 'Pass', message: 'Contract aligned to approved curve', tab: 'quote' },
      ampIndicators:     { status: 'Pass', message: 'No AMP conflicts detected', tab: 'quote' },
      roiCredit:         { status: 'Pass', message: 'ROI 8.2% — above 5% threshold, no credit approval required', tab: 'aq-approval' },
      signatureReadiness:{ status: 'Pass', message: 'Signatory verified against Companies House', tab: 'signature' },
    },
    pricingRows: BASE_PRICING_ROWS,
    standingRows: BASE_STANDING_ROWS,
    curveData: makeCurve(24.6424, false),
    curveName: 'ARC-CURVE-2025-Q4-v3',
    currentCurveName: 'ARC-CURVE-2025-Q4-v3',
    dataChecks: [
      { id: 'd1', name: 'MPAN format',          expected: '13-digit numeric', actual: '1580000277243', status: 'Pass' },
      { id: 'd2', name: 'EAC within tolerance', expected: '400,000–600,000 kWh', actual: '485,000 kWh', status: 'Pass' },
      { id: 'd3', name: 'Contract start date',  expected: '01/10/2025', actual: '01/10/2025', status: 'Pass' },
      { id: 'd4', name: 'Contract duration',    expected: '24 months', actual: '24 months', status: 'Pass' },
      { id: 'd5', name: 'Supplier code',        expected: 'Engie (ENE)', actual: 'ENE', status: 'Pass' },
    ],
    ampIndicators: [],
    companiesHouse: {
      companyName: 'Meridian Foods Ltd',
      companyNumber: '08234510',
      registeredAddress: 'Unit 4, Meridian Park, Birmingham, B6 5RQ',
      directors: [
        { name: 'John Smith', role: 'Managing Director', appointed: '14/03/2018', psc: true },
        { name: 'Claire Barnett', role: 'Finance Director', appointed: '01/09/2020', psc: false },
      ],
    },
    auditTrail: [
      { id: 'a1', timestamp: '2025-09-12T09:02:11Z', action: 'Contract Submitted', user: 'James Okafor', detail: 'Contract CON-2024-04421 submitted for validation.', category: 'system' },
      { id: 'a2', timestamp: '2025-09-12T09:02:15Z', action: 'Auto-Validation Run', user: 'System (Arc)', detail: 'All 6 validation checks passed. Contract routed to Auto-Approved.', category: 'auto' },
      { id: 'a3', timestamp: '2025-09-12T09:02:16Z', action: 'Pricing Verified', user: 'System (Arc)', detail: 'Unit rate 24.6424p/kWh matches calculated total. Standing charge £0.89/day verified.', category: 'auto' },
      { id: 'a4', timestamp: '2025-09-12T09:02:17Z', action: 'Curve Alignment Confirmed', user: 'System (Arc)', detail: 'Contract locked to ARC-CURVE-2025-Q4-v3 — current approved curve. No divergence.', category: 'auto' },
      { id: 'a5', timestamp: '2025-09-12T09:02:18Z', action: 'ROI Check Passed', user: 'System (Arc)', detail: 'ROI 8.2% exceeds credit threshold of 5%. No credit approval required.', category: 'auto' },
      { id: 'a6', timestamp: '2025-09-12T09:02:19Z', action: 'Signatory Verified', user: 'System (Arc)', detail: 'John Smith confirmed Director at Meridian Foods Ltd (Companies House No. 08234510).', category: 'auto' },
    ],
  },

  // ── CON-2024-04398 — ROI below threshold ─────────────────────
  {
    id: 'c2',
    ref: 'CON-2024-04398',
    customer: 'BLACKSTONE MANUFACTURING',
    accountManager: 'Sarah Briggs',
    aq: 1850000,
    contractType: 'Renewal',
    submissionDate: '2025-09-10',
    contractStart: '01/10/2025',
    contractEnd: '30/09/2027',
    mpan: '1087234567800',
    supplier: 'EDF Energy',
    unitRate: 22.14,
    standingCharge: 52.00,
    roi: 3.1,
    status: 'Manual Review',
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
    pricingRows: BASE_PRICING_ROWS.map(r => ({ ...r, value: +(r.value * 0.895).toFixed(4) })),
    standingRows: BASE_STANDING_ROWS,
    curveData: makeCurve(22.14, false),
    curveName: 'ARC-CURVE-2025-Q4-v3',
    currentCurveName: 'ARC-CURVE-2025-Q4-v3',
    dataChecks: [
      { id: 'd1', name: 'MPAN format',          expected: '13-digit numeric', actual: '1087234567800', status: 'Pass' },
      { id: 'd2', name: 'EAC within tolerance', expected: '1,500,000–2,200,000 kWh', actual: '1,850,000 kWh', status: 'Pass' },
      { id: 'd3', name: 'Contract start date',  expected: '01/10/2025', actual: '01/10/2025', status: 'Pass' },
      { id: 'd4', name: 'Contract duration',    expected: '24 months', actual: '24 months', status: 'Pass' },
      { id: 'd5', name: 'Supplier code',        expected: 'EDF Energy (EDF)', actual: 'EDF', status: 'Pass' },
    ],
    ampIndicators: [],
    companiesHouse: {
      companyName: 'Blackstone Manufacturing Ltd',
      companyNumber: '04917832',
      registeredAddress: '12 Forge Road, Sheffield, S9 2WR',
      directors: [
        { name: 'Margaret Holt', role: 'Chief Executive', appointed: '02/06/2015', psc: true },
        { name: 'Trevor Blackstone', role: 'Operations Director', appointed: '11/01/2019', psc: false },
      ],
    },
    auditTrail: [
      { id: 'b1', timestamp: '2025-09-10T14:18:04Z', action: 'Contract Submitted', user: 'Sarah Briggs', detail: 'Contract CON-2024-04398 submitted for validation.', category: 'system' },
      { id: 'b2', timestamp: '2025-09-10T14:18:08Z', action: 'Auto-Validation Run', user: 'System (Arc)', detail: '1 validation failure detected: ROI 3.1% below credit threshold. Contract routed to Manual Review.', category: 'auto' },
      { id: 'b3', timestamp: '2025-09-10T14:18:09Z', action: 'Credit Approval Required', user: 'System (Arc)', detail: 'ROI below 5% threshold. Credit approval notification sent to Phil Marsden (Credit Director).', category: 'auto' },
      { id: 'b4', timestamp: '2025-09-10T16:22:30Z', action: 'Manual Review Opened', user: 'Fatima Al-Rashid', detail: 'Contract opened for manual review. ROI & Credit tab reviewed.', category: 'manual' },
    ],
  },

  // ── CON-2024-04455 — Curve mismatch + pricing variance ────────
  {
    id: 'c3',
    ref: 'CON-2024-04455',
    customer: 'CASTLEFORD INDUSTRIAL',
    accountManager: 'James Okafor',
    aq: 320000,
    contractType: 'Renewal',
    submissionDate: '2025-09-14',
    contractStart: '01/10/2025',
    contractEnd: '30/09/2027',
    mpan: '1012345678901',
    supplier: 'Engie',
    unitRate: 24.85,
    standingCharge: 1.05,
    roi: 6.8,
    status: 'Manual Review',
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
    pricingRows: BASE_PRICING_ROWS,
    standingRows: MISMATCH_STANDING_ROWS,
    curveData: makeCurve(24.85, true),
    curveName: 'ARC-CURVE-2025-Q3-v1',
    currentCurveName: 'ARC-CURVE-2025-Q4-v3',
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
    companiesHouse: {
      companyName: 'Castleford Industrial Ltd',
      companyNumber: '07612948',
      registeredAddress: 'Plant A, Castleford Works, WF10 4TH',
      directors: [
        { name: 'Andrea Mills', role: 'Managing Director', appointed: '08/02/2017', psc: true },
        { name: 'Kieran Doyle', role: 'Finance Director', appointed: '15/05/2021', psc: false },
      ],
    },
    auditTrail: [
      { id: 'c1', timestamp: '2025-09-14T11:05:22Z', action: 'Contract Submitted', user: 'James Okafor', detail: 'Contract CON-2024-04455 submitted for validation.', category: 'system' },
      { id: 'c2', timestamp: '2025-09-14T11:05:26Z', action: 'Auto-Validation Run', user: 'System (Arc)', detail: '2 validation failures detected: Curve mismatch (ARC-CURVE-2025-Q3-v1 vs current Q4-v3), Standing charge variance (+£0.16/day). Routed to Manual Review.', category: 'auto' },
      { id: 'c3', timestamp: '2025-09-14T11:05:27Z', action: 'Curve Mismatch Flagged', user: 'System (Arc)', detail: 'Contract locked to superseded curve ARC-CURVE-2025-Q3-v1. Current approved curve is ARC-CURVE-2025-Q4-v3. Peak divergence +11.4%.', category: 'auto' },
      { id: 'c4', timestamp: '2025-09-14T11:05:28Z', action: 'Pricing Variance Flagged', user: 'System (Arc)', detail: 'Standing charge MAP component £0.51/day vs expected range £0.30–£0.45/day.', category: 'auto' },
      { id: 'c5', timestamp: '2025-09-14T13:44:10Z', action: 'Manual Review Opened', user: 'Tom Walsh', detail: 'Contract opened for manual review. Curve and Pricing tabs reviewed.', category: 'manual' },
    ],
  },
];
