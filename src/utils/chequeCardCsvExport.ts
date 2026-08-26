import { ChequeCardEntry, ChequeBookRecord, DebitCardRecord } from '../types';

/**
 * Calculates days elapsed between a received date and today or a target date
 */
export const getDaysInVault = (receivedDateStr?: string, endDateStr?: string): number => {
  if (!receivedDateStr) return 0;
  const [y, m, d] = receivedDateStr.split('-').map(Number);
  if (!y || !m || !d) return 0;
  const recDate = new Date(y, m - 1, d);
  
  let targetDate = new Date();
  if (endDateStr) {
    const [ey, em, ed] = endDateStr.split('-').map(Number);
    if (ey && em && ed) {
      targetDate = new Date(ey, em - 1, ed);
    }
  }
  
  targetDate.setHours(0, 0, 0, 0);
  recDate.setHours(0, 0, 0, 0);
  const diffTime = targetDate.getTime() - recDate.getTime();
  return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
};

/**
 * Escapes values for RFC 4180 CSV compliance
 */
const escapeCSV = (val: any): string => {
  if (val === null || val === undefined) return '""';
  const str = String(val).trim();
  return `"${str.replace(/"/g, '""')}"`;
};

/**
 * Formats account number / phone number as Excel-safe text formulas to prevent scientific notation and preserve leading zeroes
 */
const formatExcelText = (val: any): string => {
  if (val === null || val === undefined || val === '') return '""';
  const str = String(val).trim();
  // Using ="value" syntax forces Microsoft Excel, LibreOffice Calc, and Google Sheets to treat numeric strings as exact text
  return `="${str.replace(/"/g, '""')}"`;
};

export interface ExportMetadata {
  outletName?: string;
  outletCode?: string;
  outletLocation?: string;
  officerName?: string;
  officerId?: string;
  officerPhone?: string;
  reportTitle?: string;
  filterScopeName?: string;
}

/**
 * Generates a comprehensively formatted, categorized CSV file with executive summary,
 * metric breakdowns (total, pending, delivered, overdue), and complete customer details.
 */
export const generateChequeCardCSVContent = (
  entries: ChequeCardEntry[],
  metadata: ExportMetadata = {}
): string => {
  const today = new Date();
  const todayISO = today.toISOString().split('T')[0];
  const timestampStr = today.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const outletName = metadata.outletName || 'BRAC Bank SME & Agent Banking Outlet';
  const outletCode = metadata.outletCode || 'N/A';
  const officerName = metadata.officerName || 'Station AFO';
  const officerId = metadata.officerId || 'N/A';
  const reportTitle = metadata.reportTitle || 'CHEQUE BOOK & DEBIT CARD MASTER REGISTRY REPORT';
  const filterScope = metadata.filterScopeName || 'All Records';

  // Categorization & Counts
  const chequeRecords = entries.filter((e): e is ChequeBookRecord => e.type === 'CHEQUE');
  const cardRecords = entries.filter((e): e is DebitCardRecord => e.type === 'CARD');

  const totalRecords = entries.length;
  const totalCheques = chequeRecords.length;
  const totalCards = cardRecords.length;

  const pendingCheques = chequeRecords.filter((e) => e.status === 'RECEIVED').length;
  const deliveredCheques = chequeRecords.filter((e) => e.status === 'DELIVERED_TO_CUSTOMER').length;
  const destroyedCheques = chequeRecords.filter((e) => e.status === 'DESTROYED_EXPIRED').length;
  const returnedCheques = chequeRecords.filter((e) => e.status === 'RETURNED').length;

  const pendingCards = cardRecords.filter((e) => e.status === 'RECEIVED').length;
  const deliveredCards = cardRecords.filter((e) => e.status === 'DELIVERED_TO_CUSTOMER').length;
  const destroyedCards = cardRecords.filter((e) => e.status === 'DESTROYED_EXPIRED').length;
  const returnedCards = cardRecords.filter((e) => e.status === 'RETURNED').length;

  const totalPending = pendingCheques + pendingCards;
  const totalDelivered = deliveredCheques + deliveredCards;
  const totalDestroyed = destroyedCheques + destroyedCards;
  const totalReturned = returnedCheques + returnedCards;

  const overdueCheques = chequeRecords.filter((e) => e.status === 'RECEIVED' && getDaysInVault(e.receivedDate) >= 90).length;
  const overdueCards = cardRecords.filter((e) => e.status === 'RECEIVED' && getDaysInVault(e.receivedDate) >= 90).length;
  const totalOverdue = overdueCheques + overdueCards;

  const totalChequeLeaves = chequeRecords.reduce((sum, e) => sum + (e.leafCount || 20), 0);
  const pendingLeaves = chequeRecords
    .filter((e) => e.status === 'RECEIVED')
    .reduce((sum, e) => sum + (e.leafCount || 20), 0);
  const deliveredLeaves = chequeRecords
    .filter((e) => e.status === 'DELIVERED_TO_CUSTOMER')
    .reduce((sum, e) => sum + (e.leafCount || 20), 0);

  const deliveryRate = totalRecords > 0 ? ((totalDelivered / totalRecords) * 100).toFixed(1) + '%' : '0.0%';
  const pendingRate = totalRecords > 0 ? ((totalPending / totalRecords) * 100).toFixed(1) + '%' : '0.0%';

  const lines: string[] = [];

  // ==========================================
  // 1. REPORT HEADER & METADATA SECTION
  // ==========================================
  lines.push('========================================================================================================================');
  lines.push(`BRAC BANK PLC - AGENT BANKING & OUTLET ASSET VAULT REGISTRY`);
  lines.push('========================================================================================================================');
  lines.push(`${escapeCSV('Report Name:')},${escapeCSV(reportTitle)}`);
  lines.push(`${escapeCSV('Station / Outlet:')},${escapeCSV(outletName)},${escapeCSV('Outlet Code:')},${escapeCSV(outletCode)}`);
  lines.push(`${escapeCSV('Assigned AFO / Officer:')},${escapeCSV(`${officerName} (${officerId})`)},${escapeCSV('Officer Contact:')},${formatExcelText(metadata.officerPhone || 'N/A')}`);
  lines.push(`${escapeCSV('Generated Date & Time:')},${escapeCSV(timestampStr)},${escapeCSV('Filter / Scope Applied:')},${escapeCSV(filterScope)}`);
  lines.push(`${escapeCSV('Total Items in this Report:')},${escapeCSV(totalRecords.toString())},${escapeCSV('Delivery Rate:')},${escapeCSV(deliveryRate)}`);
  lines.push('');

  // ==========================================
  // 2. CATEGORIZED EXECUTIVE SUMMARY TABLE
  // ==========================================
  lines.push('========================================================================================================================');
  lines.push('EXECUTIVE SUMMARY & ASSET INVENTORY BREAKDOWN');
  lines.push('========================================================================================================================');
  lines.push([
    escapeCSV('Category Metric / Status'),
    escapeCSV('Cheque Books (Count)'),
    escapeCSV('Debit Cards (Count)'),
    escapeCSV('Combined Total Assets'),
    escapeCSV('Proportion (%)'),
    escapeCSV('Operational Status Remarks')
  ].join(','));

  lines.push([
    escapeCSV('Total Registered Assets'),
    escapeCSV(totalCheques.toString()),
    escapeCSV(totalCards.toString()),
    escapeCSV(totalRecords.toString()),
    escapeCSV('100.0%'),
    escapeCSV('All intake items recorded in outlet log')
  ].join(','));

  lines.push([
    escapeCSV('Pending in Station Vault (In-Hand)'),
    escapeCSV(pendingCheques.toString()),
    escapeCSV(pendingCards.toString()),
    escapeCSV(totalPending.toString()),
    escapeCSV(pendingRate),
    escapeCSV('Currently available in station lockbox for customer collection')
  ].join(','));

  lines.push([
    escapeCSV('Successfully Delivered to Customers'),
    escapeCSV(deliveredCheques.toString()),
    escapeCSV(deliveredCards.toString()),
    escapeCSV(totalDelivered.toString()),
    escapeCSV(deliveryRate),
    escapeCSV('Dispatched & acknowledged by customer')
  ].join(','));

  lines.push([
    escapeCSV('Overdue Vault Warning (≥ 90 Days Unclaimed)'),
    escapeCSV(overdueCheques.toString()),
    escapeCSV(overdueCards.toString()),
    escapeCSV(totalOverdue.toString()),
    escapeCSV(totalRecords > 0 ? ((totalOverdue / totalRecords) * 100).toFixed(1) + '%' : '0.0%'),
    escapeCSV('Exceeded standard 90-day validity period. Review for customer notice or SOP destruction')
  ].join(','));

  lines.push([
    escapeCSV('Destroyed / Expired (SOP Executed)'),
    escapeCSV(destroyedCheques.toString()),
    escapeCSV(destroyedCards.toString()),
    escapeCSV(totalDestroyed.toString()),
    escapeCSV(totalRecords > 0 ? ((totalDestroyed / totalRecords) * 100).toFixed(1) + '%' : '0.0%'),
    escapeCSV('Physically destroyed following branch audit protocols')
  ].join(','));

  lines.push([
    escapeCSV('Returned to Controlling Branch'),
    escapeCSV(returnedCheques.toString()),
    escapeCSV(returnedCards.toString()),
    escapeCSV(totalReturned.toString()),
    escapeCSV(totalRecords > 0 ? ((totalReturned / totalRecords) * 100).toFixed(1) + '%' : '0.0%'),
    escapeCSV('Transferred back to branch hub')
  ].join(','));

  lines.push([
    escapeCSV('Total Cheque Leaves Volume (LVS)'),
    escapeCSV(`${totalChequeLeaves} Leaves (${pendingLeaves} in Vault / ${deliveredLeaves} Delivered)`),
    escapeCSV('N/A'),
    escapeCSV(`${totalChequeLeaves} Leaves`),
    escapeCSV('100.0%'),
    escapeCSV('Cumulative volume of cheque leaf inventory')
  ].join(','));

  lines.push('');

  // ==========================================
  // 3. DETAILED CUSTOMER ASSET REGISTRY TABLE
  // ==========================================
  lines.push('========================================================================================================================');
  lines.push('DETAILED ASSET REGISTRY RECORDS (WITH DATES, CUSTOMER INFO, ACC NUMBERS & STATUS)');
  lines.push('========================================================================================================================');

  const headers = [
    'SL',
    'Asset Category',
    'Customer Name / Account Title',
    'Customer Mobile Number',
    'Account Number',
    'Asset Details & Specs',
    'Cheque Leaves',
    'Start CCH Number',
    'End CCH Number',
    'Card Product Type',
    'Received Date (Intake)',
    'Delivery Date (Customer)',
    'Days in Vault',
    '90-Day Validity Status',
    'Operational Status',
    'Station Outlet',
    'Recorded AFO Officer',
    'Destruction Date',
    'Destruction Reason',
    'Special Remarks / Notes'
  ];

  lines.push(headers.map(escapeCSV).join(','));

  entries.forEach((entry, idx) => {
    const isCheque = entry.type === 'CHEQUE';
    const cheque = isCheque ? (entry as ChequeBookRecord) : null;
    const card = !isCheque ? (entry as DebitCardRecord) : null;

    const categoryStr = isCheque ? 'Cheque Book' : 'Debit Card';
    const customerName = isCheque ? cheque?.accountTitle || 'N/A' : card?.cardName || 'N/A';
    const mobileNo = entry.mobileNumber || '';
    const accNo = entry.accountNumber || '';

    const specsStr = isCheque
      ? `${cheque?.leafCount || 20} Leaves (CCH: ${cheque?.startCchNumber || '-'} to ${cheque?.endCchNumber || '-'})`
      : card?.cardType || 'VISA Debit Card';

    const leafCountStr = isCheque ? (cheque?.leafCount?.toString() || '20') : '-';
    const startCch = isCheque ? (cheque?.startCchNumber || '-') : '-';
    const endCch = isCheque ? (cheque?.endCchNumber || '-') : '-';
    const cardTypeStr = !isCheque ? (card?.cardType || 'VISA Debit') : '-';

    const receivedDate = entry.receivedDate || todayISO;
    const deliveryDate = (entry as any).deliveryDate || entry.deliveredAt || (entry.status === 'DELIVERED_TO_CUSTOMER' ? entry.receivedDate : 'Not Delivered (Pending)');
    
    // Days in vault calculation
    const daysInVault = getDaysInVault(
      entry.receivedDate,
      entry.status === 'DELIVERED_TO_CUSTOMER' ? (entry.deliveredAt || (entry as any).deliveryDate) : undefined
    );

    // 90-day status
    let validityStatus = 'Within 90-Day Validity';
    if (entry.status === 'DELIVERED_TO_CUSTOMER') {
      validityStatus = 'Delivered to Customer';
    } else if (entry.status === 'DESTROYED_EXPIRED') {
      validityStatus = 'Destroyed (SOP Expired)';
    } else if (entry.status === 'RETURNED') {
      validityStatus = 'Returned to Branch';
    } else if (daysInVault >= 90) {
      validityStatus = `EXPIRED (>90 Days: +${daysInVault - 90}d overdue)`;
    } else {
      validityStatus = `Valid (${90 - daysInVault} days remaining)`;
    }

    // Operational status text
    let statusLabel = 'In Station Vault (Pending)';
    if (entry.status === 'DELIVERED_TO_CUSTOMER') {
      statusLabel = 'Delivered to Customer';
    } else if (entry.status === 'DESTROYED_EXPIRED') {
      statusLabel = 'Destroyed (Expired SOP)';
    } else if (entry.status === 'RETURNED') {
      statusLabel = 'Returned to Controlling Branch';
    }

    const outlet = entry.outletName || outletName;
    const officer = entry.userName || officerName;
    const destructionDate = (entry as any).destroyedAt || '-';
    const destructionReason = (entry as any).destructionReason || '-';
    const notes = entry.notes || '-';

    const row = [
      escapeCSV((idx + 1).toString()),
      escapeCSV(categoryStr),
      escapeCSV(customerName),
      formatExcelText(mobileNo),
      formatExcelText(accNo),
      escapeCSV(specsStr),
      escapeCSV(leafCountStr),
      escapeCSV(startCch),
      escapeCSV(endCch),
      escapeCSV(cardTypeStr),
      escapeCSV(receivedDate),
      escapeCSV(deliveryDate),
      escapeCSV(daysInVault.toString()),
      escapeCSV(validityStatus),
      escapeCSV(statusLabel),
      escapeCSV(outlet),
      escapeCSV(officer),
      escapeCSV(destructionDate),
      escapeCSV(destructionReason),
      escapeCSV(notes)
    ];

    lines.push(row.join(','));
  });

  return lines.join('\r\n');
};

/**
 * Triggers the browser download of the CSV content with UTF-8 BOM
 */
export const downloadCSVFile = (csvContent: string, filename: string): void => {
  // UTF-8 BOM (\uFEFF) ensures Excel correctly displays Unicode / Bengali characters without corrupted fonts
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
