export type QuoteStatus = 'Pending' | 'Auto-Approved' | 'Manual Review' | 'Rejected' | 'Escalated' | 'Approved';
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
    customer: 'MERIDIAN FOODS LTD',
    accountManager: 'Sarah Briggs',
    analyst: 'Tom Walsh',
    quoteType: 'New Business',
    eac: 485000,
    supplier: 'Engie',
    hhSites: 2,
    dataAge: 12,
    status: 'Auto-Approved',
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
  },

  {
    id: '2',
    ref: 'PQ00000002',
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
  },

  {
    id: '3',
    ref: 'PQ00000003',
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
    customer: 'CASTLEFORD INDUSTRIAL',
    accountManager: 'James Okafor',
    analyst: 'Tom Walsh',
    quoteType: 'Renewal',
    eac: 1400000,
    supplier: 'EDF Energy',
    hhSites: 4,
    dataAge: 35,
    status: 'Pending',
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
