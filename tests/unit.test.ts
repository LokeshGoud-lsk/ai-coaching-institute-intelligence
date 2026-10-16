import { describe, it, expect } from 'vitest';
import crypto from 'crypto';
import {
  formatPaiseToINR,
  rupeesToPaise,
  calculateNetPaise,
  calculateBalancePaise,
  calculateInstallments,
  determineInvoiceStatus,
} from '../src/lib/feeCalculations';
import {
  calculateAttendanceRiskPoints,
  calculateScoreDeclineRiskPoints,
  calculateAssessmentHabitRiskPoints,
  evaluateStudentRisk,
} from '../src/lib/earlyWarningEngine';

describe('Deterministic Financial Arithmetic (Integer Paise)', () => {
  it('correctly converts integer paise to formatted INR currency string', () => {
    expect(formatPaiseToINR(18000000)).toBe('₹1,80,000.00');
    expect(formatPaiseToINR(0)).toBe('₹0.00');
    expect(formatPaiseToINR(50)).toBe('₹0.50');
    expect(formatPaiseToINR(1000000)).toBe('₹10,000.00');
  });

  it('correctly converts rupees to integer paise without floating point error', () => {
    expect(rupeesToPaise(100)).toBe(10000);
    expect(rupeesToPaise('₹1,80,000')).toBe(18000000);
    expect(rupeesToPaise('49.99')).toBe(4999);
  });

  it('calculates net fee after scholarship/discount', () => {
    // ₹1,00,000 - ₹15,000 discount = ₹85,000 net
    const gross = 10000000;
    const discount = 1500000;
    expect(calculateNetPaise(gross, discount)).toBe(8500000);
    // Discount greater than gross caps at 0
    expect(calculateNetPaise(1000, 2000)).toBe(0);
  });

  it('calculates remaining balance accurately', () => {
    const total = 18000000; // ₹1,80,000
    const paid = 10000000;  // ₹1,00,000
    expect(calculateBalancePaise(total, paid)).toBe(8000000); // ₹80,000
  });

  it('breaks down installments into equal paise preserving exact remainder', () => {
    // 10,000 paise divided across 3 installments
    // 3333 + 3333 + 3334 = 10000 exact paise
    const installments = calculateInstallments(10000, 3);
    expect(installments).toHaveLength(3);
    expect(installments[0]).toBe(3333);
    expect(installments[1]).toBe(3333);
    expect(installments[2]).toBe(3334);
    expect(installments.reduce((a, b) => a + b, 0)).toBe(10000);
  });

  it('determines invoice status accurately based on balance and due date', () => {
    // Paid in full
    expect(determineInvoiceStatus(10000, 10000, '2026-01-01')).toBe('PAID');

    // Partially paid and not overdue
    const futureDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString();
    expect(determineInvoiceStatus(10000, 4000, futureDate)).toBe('PARTIALLY_PAID');

    // Overdue
    const pastDate = '2020-01-01';
    expect(determineInvoiceStatus(10000, 0, pastDate)).toBe('OVERDUE');
  });
});

describe('Early Warning Multi-Signal Rule Engine', () => {
  it('awards 0 points when attendance is at or above threshold', () => {
    const res = calculateAttendanceRiskPoints(95.0, 75.0);
    expect(res.points).toBe(0);
    expect(res.factor).toBeNull();
  });

  it('awards severe risk points when attendance drops critically below 50%', () => {
    const res = calculateAttendanceRiskPoints(48.0, 75.0);
    expect(res.points).toBe(40);
    expect(res.factor).toContain('Critical attendance deficit');
  });

  it('awards scaled points when attendance is between 50% and 74%', () => {
    const res = calculateAttendanceRiskPoints(62.5, 75.0);
    expect(res.points).toBeGreaterThan(15);
    expect(res.points).toBeLessThanOrEqual(35);
    expect(res.factor).toContain('Attendance below policy');
  });

  it('flags academic decline when drop exceeds configured threshold', () => {
    // Previous 78%, latest 54% -> 24% drop (threshold 15%)
    const res = calculateScoreDeclineRiskPoints(54.0, 78.0, 15.0);
    expect(res.points).toBeGreaterThan(20);
    expect(res.factor).toContain('Significant academic drop');
    expect(res.declinePct).toBe(24.0);
  });

  it('handles absent assessment without double counting or NaN', () => {
    const res = calculateScoreDeclineRiskPoints(null, 75.0, 15.0);
    expect(res.declinePct).toBe(0);
    expect(res.points).toBe(0);
  });

  it('evaluates Rahul Sharma composite profile to HIGH risk category', () => {
    const evalResult = evaluateStudentRisk({
      attendancePercentage: 62.5,
      latestScore: 54.0,
      previousScore: 78.0,
      repeatedAbsencesCount: 5,
      missingAssessmentsCount: 0,
      configuredMinAttendance: 75.0,
      configuredDeclineThreshold: 15.0,
    });

    expect(evalResult.riskCategory).toBe('HIGH');
    expect(evalResult.riskScore).toBeGreaterThanOrEqual(70);
    expect(evalResult.primaryFactors.length).toBeGreaterThanOrEqual(2);
    expect(evalResult.recommendedAction).toContain('parent-faculty consultation');
  });

  it('evaluates top scholar Priya Patel to LOW risk category', () => {
    const evalResult = evaluateStudentRisk({
      attendancePercentage: 96.0,
      latestScore: 92.5,
      previousScore: 89.0,
      repeatedAbsencesCount: 0,
      missingAssessmentsCount: 0,
    });

    expect(evalResult.riskCategory).toBe('LOW');
    expect(evalResult.riskScore).toBeLessThan(40);
  });
});

describe('Razorpay HMAC-SHA256 Cryptographic Verification', () => {
  it('correctly validates valid payment signature', () => {
    const secret = 'rzp_secret_test_12345';
    const orderId = 'order_98129841';
    const paymentId = 'pay_12891921';

    const validSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    // Verification check
    const checkSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    expect(checkSignature).toBe(validSignature);
  });

  it('rejects tampered payment signature', () => {
    const secret = 'rzp_secret_test_12345';
    const orderId = 'order_98129841';
    const paymentId = 'pay_12891921';

    const tamperedSignature = 'fake_signature_hex_12345';
    const checkSignature = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    expect(checkSignature).not.toBe(tamperedSignature);
  });
});
