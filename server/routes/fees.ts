import { Router, Request, Response } from 'express';
import { store } from '../db';
import { FeePlan, Invoice } from '../../src/types';
import { calculateNetPaise, calculateBalancePaise, determineInvoiceStatus } from '../../src/lib/feeCalculations';

const router = Router();

// GET /api/v1/fees/plans - List all fee plans
router.get('/plans', (req: Request, res: Response) => {
  return res.json(store.feePlans);
});

// POST /api/v1/fees/plans - Create a new fee plan
router.post('/plans', (req: Request, res: Response) => {
  const { courseId, name, totalPaise, installments, description } = req.body;

  if (!courseId || !name || !totalPaise) {
    return res.status(400).json({ error: 'courseId, name, and totalPaise are required' });
  }

  const course = store.courses.find(c => c.id === courseId);

  const newPlan: FeePlan = {
    id: `plan-${Date.now()}`,
    courseId,
    courseName: course?.name,
    name,
    totalPaise: Number(totalPaise),
    installments: Number(installments) || 1,
    description,
  };

  store.feePlans.push(newPlan);
  store.logAudit('FEE_PLAN_CREATED', 'FEE_PLAN', { id: newPlan.id, name: newPlan.name });

  return res.status(201).json(newPlan);
});

// GET /api/v1/fees/invoices - List invoices with optional status/student filter
router.get('/invoices', (req: Request, res: Response) => {
  const { studentId, status } = req.query;

  let list = [...store.invoices];

  if (studentId) {
    list = list.filter(i => i.studentId === studentId);
  }

  if (status) {
    list = list.filter(i => i.status === status);
  }

  // Recalculate dynamic status based on current date
  const enriched = list.map(inv => ({
    ...inv,
    status: determineInvoiceStatus(inv.totalPaise, inv.paidPaise, inv.dueDate),
    balancePaise: calculateBalancePaise(inv.totalPaise, inv.paidPaise),
  }));

  return res.json(enriched);
});

// POST /api/v1/fees/invoices - Create an invoice for a student
router.post('/invoices', (req: Request, res: Response) => {
  const { studentId, subtotalPaise, discountPaise = 0, dueDate, lineItems } = req.body;

  if (!studentId || !subtotalPaise || !dueDate) {
    return res.status(400).json({ error: 'studentId, subtotalPaise, and dueDate are required' });
  }

  const student = store.students.find(s => s.id === studentId);
  if (!student) {
    return res.status(404).json({ error: 'Student not found' });
  }

  const netTotal = calculateNetPaise(Number(subtotalPaise), Number(discountPaise));
  const invoiceNumber = `INV-2026-${String(store.invoices.length + 101).padStart(5, '0')}`;

  const newInvoice: Invoice = {
    id: `inv-${Date.now()}`,
    studentId: student.id,
    studentName: student.fullName,
    studentCode: student.studentCode,
    invoiceNumber,
    subtotalPaise: Number(subtotalPaise),
    discountPaise: Number(discountPaise),
    totalPaise: netTotal,
    paidPaise: 0,
    balancePaise: netTotal,
    status: determineInvoiceStatus(netTotal, 0, dueDate),
    dueDate,
    createdAt: new Date().toISOString().slice(0, 10),
    lineItems: Array.isArray(lineItems) ? lineItems : [
      { id: `li-${Date.now()}`, description: 'Institute Tuition & Laboratory Access', amountPaise: netTotal, quantity: 1 }
    ],
  };

  store.invoices.unshift(newInvoice);
  student.balanceFeePaise = (student.balanceFeePaise || 0) + netTotal;

  store.logAudit('INVOICE_GENERATED', 'INVOICE', {
    invoiceNumber,
    student: student.fullName,
    totalPaise: netTotal,
  });

  return res.status(201).json(newInvoice);
});

// GET /api/v1/fees/overdue - Aging breakdown
router.get('/overdue', (req: Request, res: Response) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const overdueInvoices = store.invoices.filter(inv => {
    const balance = calculateBalancePaise(inv.totalPaise, inv.paidPaise);
    const dueDate = new Date(inv.dueDate);
    return balance > 0 && dueDate < today;
  });

  let bucket1to30Paise = 0;
  let bucket31to60Paise = 0;
  let bucket60PlusPaise = 0;

  overdueInvoices.forEach(inv => {
    const balance = calculateBalancePaise(inv.totalPaise, inv.paidPaise);
    const dueDate = new Date(inv.dueDate);
    const daysPastDue = Math.floor((today.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));

    if (daysPastDue <= 30) {
      bucket1to30Paise += balance;
    } else if (daysPastDue <= 60) {
      bucket31to60Paise += balance;
    } else {
      bucket60PlusPaise += balance;
    }
  });

  return res.json({
    totalOverdueCount: overdueInvoices.length,
    totalOverduePaise: bucket1to30Paise + bucket31to60Paise + bucket60PlusPaise,
    buckets: {
      bucket1to30Paise,
      bucket31to60Paise,
      bucket60PlusPaise,
    },
    invoices: overdueInvoices,
  });
});

export default router;
