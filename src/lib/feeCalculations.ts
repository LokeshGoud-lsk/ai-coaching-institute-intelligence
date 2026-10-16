// Deterministic integer-paise financial calculation engine
// Never uses floating-point arithmetic for monetary calculations.
// 1 INR = 100 Paise.

/**
 * Converts integer paise to formatted INR string (e.g. 1000000 -> "₹10,000.00")
 */
export function formatPaiseToINR(paise: number | bigint | undefined | null): string {
  if (paise === undefined || paise === null) return '₹0.00';
  const numericPaise = typeof paise === 'bigint' ? Number(paise) : paise;
  const rupees = numericPaise / 100;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(rupees);
}

/**
 * Converts rupees float/string from user inputs to integer paise
 */
export function rupeesToPaise(rupees: number | string): number {
  const numeric = typeof rupees === 'string' ? parseFloat(rupees.replace(/[^\d.-]/g, '')) : rupees;
  if (isNaN(numeric)) return 0;
  return Math.round(numeric * 100);
}

/**
 * Calculates net fee after discount
 * Net = Gross - Discount
 */
export function calculateNetPaise(grossPaise: number, discountPaise: number): number {
  const safeGross = Math.max(0, Math.round(grossPaise));
  const safeDiscount = Math.max(0, Math.round(discountPaise));
  return Math.max(0, safeGross - safeDiscount);
}

/**
 * Calculates outstanding balance
 * Balance = Total - Paid
 */
export function calculateBalancePaise(totalPaise: number, paidPaise: number): number {
  const safeTotal = Math.max(0, Math.round(totalPaise));
  const safePaid = Math.max(0, Math.round(paidPaise));
  return Math.max(0, safeTotal - safePaid);
}

/**
 * Calculates installment breakdown into equal paise, handling odd remainder in final installment
 */
export function calculateInstallments(totalPaise: number, count: number): number[] {
  if (count <= 1) return [totalPaise];
  const baseAmount = Math.floor(totalPaise / count);
  const remainder = totalPaise % count;
  const installments: number[] = [];
  
  for (let i = 0; i < count; i++) {
    // Add remainder to the last installment for exact paise balance
    if (i === count - 1) {
      installments.push(baseAmount + remainder);
    } else {
      installments.push(baseAmount);
    }
  }
  return installments;
}

/**
 * Determines invoice status based on due date and balance
 */
export function determineInvoiceStatus(
  totalPaise: number,
  paidPaise: number,
  dueDateString: string
): 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'ISSUED' {
  const balance = calculateBalancePaise(totalPaise, paidPaise);
  if (balance === 0) return 'PAID';
  
  const dueDate = new Date(dueDateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (dueDate < today) {
    return 'OVERDUE';
  }

  if (paidPaise > 0) {
    return 'PARTIALLY_PAID';
  }

  return 'ISSUED';
}
