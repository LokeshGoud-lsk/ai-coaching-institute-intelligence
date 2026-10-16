import { jsPDF } from 'jspdf';
import { formatPaiseToINR } from './feeCalculations';

export interface PDFReportOptions {
  title: string;
  subtitle?: string;
  instituteName?: string;
  dateGenerated?: string;
  headers: string[];
  rows: (string | number)[][];
  summaryNotes?: string[];
}

export function generatePDFReport(options: PDFReportOptions): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const institute = options.instituteName || 'Apex Academy of Science & IIT-JEE/NEET';
  const today = options.dateGenerated || new Date().toLocaleDateString('en-IN');

  // Background Header Bar (Deep Navy)
  doc.setFillColor(11, 15, 25);
  doc.rect(0, 0, 210, 32, 'F');

  // Gold/Blue Accent Line
  doc.setFillColor(59, 130, 246);
  doc.rect(0, 32, 210, 2, 'F');

  // Institute Name
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text(institute, 14, 15);

  // Subtitle / Document Type
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(148, 163, 184);
  doc.text('Performance & Fee Intelligence Official Audit Report', 14, 23);

  // Date on top right
  doc.setFontSize(9);
  doc.text(`Generated: ${today}`, 196, 23, { align: 'right' });

  // Report Title
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(options.title, 14, 44);

  if (options.subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(options.subtitle, 14, 50);
  }

  // Draw Table
  let y = options.subtitle ? 58 : 52;
  const colWidth = 182 / options.headers.length;

  // Table Header
  doc.setFillColor(241, 245, 249);
  doc.rect(14, y, 182, 8, 'F');
  doc.setTextColor(30, 41, 59);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);

  options.headers.forEach((header, idx) => {
    doc.text(header, 16 + idx * colWidth, y + 5.5);
  });

  y += 8;

  // Table Rows
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);

  options.rows.forEach((row, rowIndex) => {
    // Page overflow check
    if (y > 270) {
      doc.addPage();
      y = 20;
    }

    if (rowIndex % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(14, y, 182, 7.5, 'F');
    }

    doc.setTextColor(51, 65, 85);
    row.forEach((cell, cellIndex) => {
      const text = String(cell);
      doc.text(text, 16 + cellIndex * colWidth, y + 5);
    });

    // Horizontal line
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y + 7.5, 196, y + 7.5);

    y += 7.5;
  });

  // Summary Notes if present
  if (options.summaryNotes && options.summaryNotes.length > 0) {
    y += 8;
    if (y > 260) {
      doc.addPage();
      y = 20;
    }
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59);
    doc.text('Verified Analytics Summary:', 14, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    options.summaryNotes.forEach(note => {
      doc.text(`• ${note}`, 16, y);
      y += 4.5;
    });
  }

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(
      'Confidential — For Internal Institute Administration Use Only | AI Coaching Institute Intelligence',
      105,
      290,
      { align: 'center' }
    );
    doc.text(`Page ${i} of ${pageCount}`, 196, 290, { align: 'right' });
  }

  // Trigger Save
  const safeFilename = options.title.toLowerCase().replace(/[^a-z0-9]/g, '_');
  doc.save(`${safeFilename}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

/**
 * Generates official Payment Receipt PDF
 */
export function generatePaymentReceiptPDF(payment: {
  receiptNumber: string;
  studentName: string;
  studentCode: string;
  amountPaise: number;
  paymentMethod: string;
  paidAt: string;
  transactionRef?: string;
  invoiceNumber?: string;
}): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a5', orientation: 'landscape' });

  // Outer Border & Header
  doc.setFillColor(11, 15, 25);
  doc.rect(0, 0, 210, 25, 'F');
  doc.setFillColor(16, 185, 129); // Emerald success line
  doc.rect(0, 25, 210, 2, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('OFFICIAL FEE PAYMENT RECEIPT', 14, 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184);
  doc.text('Apex Academy of Science & IIT-JEE/NEET Coaching', 14, 20);
  doc.text(`Receipt #: ${payment.receiptNumber}`, 196, 14, { align: 'right' });

  // Receipt Details
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(10);
  
  let y = 38;
  const items = [
    ['Student Name:', payment.studentName],
    ['Student ID:', payment.studentCode],
    ['Invoice Reference:', payment.invoiceNumber || 'INV-2026-FEE'],
    ['Payment Method:', payment.paymentMethod],
    ['Transaction Ref:', payment.transactionRef || 'Direct Verification'],
    ['Date & Time:', new Date(payment.paidAt).toLocaleString('en-IN')],
    ['Amount Paid:', formatPaiseToINR(payment.amountPaise)],
  ];

  items.forEach(([label, value], idx) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label, 20, y);
    doc.setFont('helvetica', label === 'Amount Paid:' ? 'bold' : 'normal');
    if (label === 'Amount Paid:') {
      doc.setTextColor(16, 185, 129);
      doc.setFontSize(12);
    } else {
      doc.setTextColor(51, 65, 85);
      doc.setFontSize(10);
    }
    doc.text(value, 80, y);
    y += 10;
  });

  // Stamp / Authorized Signature
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text('Digitally Verified & Stored', 150, 115, { align: 'center' });
  doc.setFont('helvetica', 'normal');
  doc.text('Accounts Department', 150, 120, { align: 'center' });

  doc.save(`receipt_${payment.receiptNumber}.pdf`);
}
