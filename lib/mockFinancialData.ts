import { Invoice, Transaction } from '../types';

// --- INVOICES BY DRIVER ---
// All invoices organized by driver ID for easy reference

export const mockInvoicesByDriver: { [driverId: string]: Invoice[] } = {
  'D-DEMO': [
    { id: 'INV-DEMO-001', weekEnding: new Date(Date.now() - 7 * 24 * 3600 * 1000).toLocaleDateString(), grossEarnings: 1250.50, commission: 250.10, netEarnings: 1000.40, statementUrl: '#', items: [
        {id: '1', date: new Date().toISOString(), description: 'Booking B001', amount: 50},
        {id: '2', date: new Date().toISOString(), description: 'Booking B002', amount: 30},
    ]},
    { id: 'INV-DEMO-002', weekEnding: new Date(Date.now() - 14 * 24 * 3600 * 1000).toLocaleDateString(), grossEarnings: 1100.00, commission: 220.00, netEarnings: 880.00, statementUrl: '#', items: [] },
    { id: 'INV-DEMO-003', weekEnding: new Date(Date.now() - 21 * 24 * 3600 * 1000).toLocaleDateString(), grossEarnings: 1350.25, commission: 270.05, netEarnings: 1080.20, statementUrl: '#', items: [] },
    { id: 'INV-DEMO-004', weekEnding: new Date(Date.now() - 28 * 24 * 3600 * 1000).toLocaleDateString(), grossEarnings: 1425.75, commission: 285.15, netEarnings: 1140.60, statementUrl: '#', items: [] },
    { id: 'INV-DEMO-005', weekEnding: new Date(Date.now() - 35 * 24 * 3600 * 1000).toLocaleDateString(), grossEarnings: 1180.00, commission: 236.00, netEarnings: 944.00, statementUrl: '#', items: [] },
    { id: 'INV-DEMO-006', weekEnding: new Date(Date.now() - 42 * 24 * 3600 * 1000).toLocaleDateString(), grossEarnings: 1520.50, commission: 304.10, netEarnings: 1216.40, statementUrl: '#', items: [] },
    { id: 'INV-DEMO-007', weekEnding: new Date(Date.now() - 49 * 24 * 3600 * 1000).toLocaleDateString(), grossEarnings: 995.25, commission: 199.05, netEarnings: 796.20, statementUrl: '#', items: [] },
    { id: 'INV-DEMO-008', weekEnding: new Date(Date.now() - 56 * 24 * 3600 * 1000).toLocaleDateString(), grossEarnings: 1275.00, commission: 255.00, netEarnings: 1020.00, statementUrl: '#', items: [] },
    { id: 'INV-DEMO-009', weekEnding: new Date(Date.now() - 63 * 24 * 3600 * 1000).toLocaleDateString(), grossEarnings: 1380.75, commission: 276.15, netEarnings: 1104.60, statementUrl: '#', items: [] },
    { id: 'INV-DEMO-010', weekEnding: new Date(Date.now() - 70 * 24 * 3600 * 1000).toLocaleDateString(), grossEarnings: 1150.50, commission: 230.10, netEarnings: 920.40, statementUrl: '#', items: [] },
  ],
  'D001': [
    { id: 'INV001-D001', weekEnding: new Date(Date.now() - 7 * 24 * 3600 * 1000).toLocaleDateString(), grossEarnings: 1100.00, commission: 220.00, netEarnings: 880.00, statementUrl: '#', items: [] },
    { id: 'INV002-D001', weekEnding: new Date(Date.now() - 14 * 24 * 3600 * 1000).toLocaleDateString(), grossEarnings: 950.00, commission: 190.00, netEarnings: 760.00, statementUrl: '#', items: [] },
    { id: 'INV003-D001', weekEnding: new Date(Date.now() - 21 * 24 * 3600 * 1000).toLocaleDateString(), grossEarnings: 1200.50, commission: 240.10, netEarnings: 960.40, statementUrl: '#', items: [] },
  ],
  'D002': [
    { id: 'INV001-D002', weekEnding: new Date(Date.now() - 7 * 24 * 3600 * 1000).toLocaleDateString(), grossEarnings: 980.00, commission: 196.00, netEarnings: 784.00, statementUrl: '#', items: [] },
    { id: 'INV002-D002', weekEnding: new Date(Date.now() - 14 * 24 * 3600 * 1000).toLocaleDateString(), grossEarnings: 1050.00, commission: 210.00, netEarnings: 840.00, statementUrl: '#', items: [] },
  ],
  'D004': [
    { id: 'INV001-D004', weekEnding: new Date(Date.now() - 7 * 24 * 3600 * 1000).toLocaleDateString(), grossEarnings: 1320.00, commission: 264.00, netEarnings: 1056.00, statementUrl: '#', items: [] },
    { id: 'INV002-D004', weekEnding: new Date(Date.now() - 14 * 24 * 3600 * 1000).toLocaleDateString(), grossEarnings: 1180.00, commission: 236.00, netEarnings: 944.00, statementUrl: '#', items: [] },
  ],
  'D005': [
    { id: 'INV001-D005', weekEnding: new Date(Date.now() - 7 * 24 * 3600 * 1000).toLocaleDateString(), grossEarnings: 1400.00, commission: 280.00, netEarnings: 1120.00, statementUrl: '#', items: [] },
    { id: 'INV002-D005', weekEnding: new Date(Date.now() - 14 * 24 * 3600 * 1000).toLocaleDateString(), grossEarnings: 1250.00, commission: 250.00, netEarnings: 1000.00, statementUrl: '#', items: [] },
  ],
};

// --- TRANSACTIONS BY DRIVER ---
// All transactions organized by driver ID, sorted by date descending

export const mockTransactionsByDriver: { [driverId: string]: Transaction[] } = {
  'D-DEMO': [
    // Last 7 days transactions (this week)
    { id: 'TR-DEMO-001', datetime: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), type: 'Card', amount: 35.50 },
    { id: 'TR-DEMO-002', datetime: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), type: 'Card', amount: 28.00 },
    { id: 'TR-DEMO-003', datetime: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), type: 'Cash', amount: 20.00 },
    { id: 'TR-DEMO-004', datetime: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), type: 'Cash', amount: 15.50 },
    { id: 'TR-DEMO-005', datetime: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), type: 'Account', amount: 45.00 },
    { id: 'TR-DEMO-006', datetime: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), type: 'Card', amount: 15.75 },
    { id: 'TR-DEMO-007', datetime: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), type: 'Card', amount: 22.25 },
    { id: 'TR-DEMO-008', datetime: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(), type: 'Card', amount: 65.00 },
    { id: 'TR-DEMO-009', datetime: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(), type: 'Card', amount: 38.50 },
    { id: 'TR-DEMO-010', datetime: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(), type: 'Account', amount: 80.20 },
    { id: 'TR-DEMO-011', datetime: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(), type: 'Cash', amount: 42.00 },
    { id: 'TR-DEMO-012', datetime: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(), type: 'Cash', amount: 12.00 },
    { id: 'TR-DEMO-013', datetime: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(), type: 'Card', amount: 48.75 },
    { id: 'TR-DEMO-014', datetime: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(), type: 'Cash', amount: 35.00 },
    { id: 'TR-DEMO-015', datetime: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(), type: 'Card', amount: 55.25 },
    
    // Previous week transactions
    { id: 'TR-DEMO-016', datetime: new Date(Date.now() - 8 * 24 * 3600 * 1000).toISOString(), type: 'Card', amount: 42.00 },
    { id: 'TR-DEMO-017', datetime: new Date(Date.now() - 9 * 24 * 3600 * 1000).toISOString(), type: 'Cash', amount: 28.50 },
    { id: 'TR-DEMO-018', datetime: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(), type: 'Account', amount: 65.75 },
    { id: 'TR-DEMO-019', datetime: new Date(Date.now() - 11 * 24 * 3600 * 1000).toISOString(), type: 'Card', amount: 38.00 },
    { id: 'TR-DEMO-020', datetime: new Date(Date.now() - 12 * 24 * 3600 * 1000).toISOString(), type: 'Card', amount: 52.50 },
    { id: 'TR-DEMO-021', datetime: new Date(Date.now() - 13 * 24 * 3600 * 1000).toISOString(), type: 'Cash', amount: 25.00 },
    { id: 'TR-DEMO-022', datetime: new Date(Date.now() - 14 * 24 * 3600 * 1000).toISOString(), type: 'Account', amount: 48.00 },
    
    // Two weeks ago transactions
    { id: 'TR-DEMO-023', datetime: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(), type: 'Card', amount: 45.50 },
    { id: 'TR-DEMO-024', datetime: new Date(Date.now() - 16 * 24 * 3600 * 1000).toISOString(), type: 'Cash', amount: 32.00 },
    { id: 'TR-DEMO-025', datetime: new Date(Date.now() - 17 * 24 * 3600 * 1000).toISOString(), type: 'Card', amount: 68.75 },
    { id: 'TR-DEMO-026', datetime: new Date(Date.now() - 18 * 24 * 3600 * 1000).toISOString(), type: 'Account', amount: 55.00 },
    { id: 'TR-DEMO-027', datetime: new Date(Date.now() - 19 * 24 * 3600 * 1000).toISOString(), type: 'Card', amount: 41.25 },
    { id: 'TR-DEMO-028', datetime: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString(), type: 'Cash', amount: 28.50 },
    { id: 'TR-DEMO-029', datetime: new Date(Date.now() - 21 * 24 * 3600 * 1000).toISOString(), type: 'Card', amount: 58.00 },
  ],
  'D001': [
    { id: 'TR001-D001', datetime: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), type: 'Card', amount: 32.00 },
    { id: 'TR002-D001', datetime: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), type: 'Cash', amount: 18.50 },
    { id: 'TR003-D001', datetime: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(), type: 'Account', amount: 42.00 },
  ],
  'D002': [
    { id: 'TR001-D002', datetime: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), type: 'Cash', amount: 25.00 },
    { id: 'TR002-D002', datetime: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), type: 'Card', amount: 35.50 },
  ],
  'D004': [
    { id: 'TR001-D004', datetime: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), type: 'Card', amount: 48.00 },
    { id: 'TR002-D004', datetime: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), type: 'Account', amount: 52.50 },
  ],
  'D005': [
    { id: 'TR001-D005', datetime: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(), type: 'Card', amount: 55.00 },
    { id: 'TR002-D005', datetime: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(), type: 'Cash', amount: 30.00 },
  ],
};

// --- UNIFIED INVOICE & TRANSACTION EXPORTS ---
// These flatten the data for backward compatibility with existing components

export const mockInvoices: Invoice[] = Object.values(mockInvoicesByDriver).flat().sort((a, b) => {
  const dateA = new Date(a.weekEnding);
  const dateB = new Date(b.weekEnding);
  return dateB.getTime() - dateA.getTime(); // Most recent first
});

export const mockDriverTransactions: Transaction[] = Object.values(mockTransactionsByDriver).flat().sort((a, b) => {
  return new Date(b.datetime).getTime() - new Date(a.datetime).getTime(); // Most recent first
});

// Helper function to get invoices for a specific driver
export const getInvoicesForDriver = (driverId: string): Invoice[] => {
  return mockInvoicesByDriver[driverId] || [];
};

// Helper function to get transactions for a specific driver
export const getTransactionsForDriver = (driverId: string): Transaction[] => {
  return mockTransactionsByDriver[driverId] || [];
};
