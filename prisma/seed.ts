import { PrismaClient, Role, StudentStatus, AttendanceStatus, AssessmentType, RiskCategory, AlertStatus, InvoiceStatus, PaymentStatus, PaymentMethod, NotificationType } from '@prisma/client';
import dotenv from 'dotenv';
import {
  SEED_INSTITUTE,
  SEED_USERS,
  SEED_COURSES,
  SEED_FACULTY,
  SEED_BATCHES,
  SEED_STUDENTS,
  SEED_ASSESSMENTS,
  SEED_FEE_PLANS,
  SEED_INVOICES,
  SEED_PAYMENTS,
  SEED_EARLY_WARNING_ALERTS,
  SEED_NOTIFICATIONS,
} from '../server/seedData';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Starting Database Seed for AI Coaching Institute Intelligence...');

  // 1. Seed Institute
  console.log('Seeding Institute...');
  const institute = await prisma.institute.upsert({
    where: { code: SEED_INSTITUTE.code },
    update: {
      name: SEED_INSTITUTE.name,
      contactEmail: SEED_INSTITUTE.contactEmail,
      contactPhone: SEED_INSTITUTE.contactPhone,
      address: SEED_INSTITUTE.address,
      logoUrl: SEED_INSTITUTE.logoUrl,
      currency: SEED_INSTITUTE.currency,
      minAttendance: SEED_INSTITUTE.minAttendance,
      scoreDeclinePct: SEED_INSTITUTE.scoreDeclinePct,
    },
    create: {
      id: SEED_INSTITUTE.id,
      name: SEED_INSTITUTE.name,
      code: SEED_INSTITUTE.code,
      contactEmail: SEED_INSTITUTE.contactEmail,
      contactPhone: SEED_INSTITUTE.contactPhone,
      address: SEED_INSTITUTE.address,
      logoUrl: SEED_INSTITUTE.logoUrl,
      currency: SEED_INSTITUTE.currency,
      minAttendance: SEED_INSTITUTE.minAttendance,
      scoreDeclinePct: SEED_INSTITUTE.scoreDeclinePct,
    },
  });

  // 2. Seed Users & Memberships
  console.log('Seeding Users & Memberships...');
  for (const u of SEED_USERS) {
    const user = await prisma.userProfile.upsert({
      where: { email: u.email },
      update: {
        fullName: u.fullName,
        phoneNumber: u.phoneNumber,
        avatarUrl: u.avatarUrl,
      },
      create: {
        id: u.id,
        email: u.email,
        fullName: u.fullName,
        phoneNumber: u.phoneNumber,
        avatarUrl: u.avatarUrl,
      },
    });

    await prisma.instituteMembership.upsert({
      where: {
        instituteId_userId: {
          instituteId: institute.id,
          userId: user.id,
        },
      },
      update: {
        role: u.role as Role,
      },
      create: {
        instituteId: institute.id,
        userId: user.id,
        role: u.role as Role,
      },
    });
  }

  // 3. Seed Courses & Subjects
  console.log('Seeding Courses & Subjects...');
  for (const c of SEED_COURSES) {
    const course = await prisma.course.upsert({
      where: {
        instituteId_code: {
          instituteId: institute.id,
          code: c.code,
        },
      },
      update: {
        name: c.name,
        description: c.description,
        durationMonths: c.durationMonths,
      },
      create: {
        id: c.id,
        instituteId: institute.id,
        name: c.name,
        code: c.code,
        description: c.description,
        durationMonths: c.durationMonths,
      },
    });

    if (c.subjects && Array.isArray(c.subjects)) {
      for (const subj of c.subjects) {
        await prisma.subject.upsert({
          where: {
            courseId_code: {
              courseId: course.id,
              code: subj.code,
            },
          },
          update: {
            name: subj.name,
          },
          create: {
            id: subj.id,
            courseId: course.id,
            name: subj.name,
            code: subj.code,
          },
        });
      }
    }
  }

  // 4. Seed Faculty
  console.log('Seeding Faculty...');
  for (const f of SEED_FACULTY) {
    await prisma.faculty.upsert({
      where: {
        instituteId_employeeCode: {
          instituteId: institute.id,
          employeeCode: f.employeeCode,
        },
      },
      update: {
        fullName: f.fullName,
        email: f.email,
        phone: f.phone,
        specialization: f.specialization,
      },
      create: {
        id: f.id,
        instituteId: institute.id,
        employeeCode: f.employeeCode,
        fullName: f.fullName,
        email: f.email,
        phone: f.phone,
        specialization: f.specialization,
      },
    });
  }

  // 5. Seed Batches
  console.log('Seeding Batches...');
  for (const b of SEED_BATCHES) {
    await prisma.batch.upsert({
      where: {
        instituteId_code: {
          instituteId: institute.id,
          code: b.code,
        },
      },
      update: {
        name: b.name,
        courseId: b.courseId,
        leadFacultyId: b.leadFacultyId,
        startDate: new Date(b.startDate),
        scheduleInfo: b.scheduleInfo,
        capacity: b.capacity || 50,
      },
      create: {
        id: b.id,
        instituteId: institute.id,
        name: b.name,
        code: b.code,
        courseId: b.courseId,
        leadFacultyId: b.leadFacultyId,
        startDate: new Date(b.startDate),
        scheduleInfo: b.scheduleInfo,
        capacity: b.capacity || 50,
      },
    });
  }

  // 6. Seed Students & Guardians
  console.log('Seeding Students & Guardians...');
  for (const s of SEED_STUDENTS) {
    let guardianId = undefined;
    if (s.guardianName && s.guardianPhone) {
      const guardian = await prisma.guardian.create({
        data: {
          name: s.guardianName,
          phone: s.guardianPhone,
          relationship: s.guardianRelation || 'Parent',
          email: s.guardianEmail,
        },
      });
      guardianId = guardian.id;
    }

    const student = await prisma.student.upsert({
      where: {
        instituteId_studentCode: {
          instituteId: institute.id,
          studentCode: s.studentCode,
        },
      },
      update: {
        fullName: s.fullName,
        email: s.email,
        phone: s.phone,
        avatarUrl: s.avatarUrl,
        guardianId: guardianId,
        courseId: s.courseId,
        status: (s.status as StudentStatus) || StudentStatus.ACTIVE,
        notes: s.notes,
      },
      create: {
        id: s.id,
        instituteId: institute.id,
        studentCode: s.studentCode,
        fullName: s.fullName,
        email: s.email,
        phone: s.phone,
        avatarUrl: s.avatarUrl,
        guardianId: guardianId,
        courseId: s.courseId,
        enrollmentDate: new Date(s.enrollmentDate || '2025-05-15'),
        status: (s.status as StudentStatus) || StudentStatus.ACTIVE,
        notes: s.notes,
      },
    });

    if (s.batchId) {
      await prisma.batchEnrollment.upsert({
        where: {
          studentId_batchId: {
            studentId: student.id,
            batchId: s.batchId,
          },
        },
        update: { isActive: true },
        create: {
          studentId: student.id,
          batchId: s.batchId,
          isActive: true,
        },
      });
    }
  }

  // 7. Seed Fee Plans & Invoices
  console.log('Seeding Fee Plans & Invoices...');
  for (const fp of SEED_FEE_PLANS) {
    await prisma.feePlan.upsert({
      where: { id: fp.id },
      update: {
        name: fp.name,
        courseId: fp.courseId,
        totalPaise: BigInt(fp.totalPaise),
        installments: fp.installments,
        description: fp.description,
      },
      create: {
        id: fp.id,
        instituteId: institute.id,
        name: fp.name,
        courseId: fp.courseId,
        totalPaise: BigInt(fp.totalPaise),
        installments: fp.installments,
        description: fp.description,
      },
    });
  }

  for (const inv of SEED_INVOICES) {
    await prisma.invoice.upsert({
      where: {
        instituteId_invoiceNumber: {
          instituteId: institute.id,
          invoiceNumber: inv.invoiceNumber,
        },
      },
      update: {
        subtotalPaise: BigInt(inv.subtotalPaise),
        discountPaise: BigInt(inv.discountPaise || 0),
        totalPaise: BigInt(inv.totalPaise),
        paidPaise: BigInt(inv.paidPaise || 0),
        balancePaise: BigInt(inv.balancePaise),
        status: inv.status as InvoiceStatus,
        dueDate: new Date(inv.dueDate),
      },
      create: {
        id: inv.id,
        instituteId: institute.id,
        studentId: inv.studentId,
        invoiceNumber: inv.invoiceNumber,
        subtotalPaise: BigInt(inv.subtotalPaise),
        discountPaise: BigInt(inv.discountPaise || 0),
        totalPaise: BigInt(inv.totalPaise),
        paidPaise: BigInt(inv.paidPaise || 0),
        balancePaise: BigInt(inv.balancePaise),
        status: inv.status as InvoiceStatus,
        dueDate: new Date(inv.dueDate),
      },
    });
  }

  for (const pay of SEED_PAYMENTS) {
    await prisma.payment.upsert({
      where: { receiptNumber: pay.receiptNumber },
      update: {
        amountPaise: BigInt(pay.amountPaise),
        paymentMethod: pay.paymentMethod as PaymentMethod,
        status: pay.status as PaymentStatus,
        razorpayOrderId: pay.razorpayOrderId,
        razorpayPaymentId: pay.razorpayPaymentId,
        receiptNumber: pay.receiptNumber,
        paidAt: new Date(pay.paidAt),
      },
      create: {
        id: pay.id,
        instituteId: institute.id,
        invoiceId: pay.invoiceId,
        studentId: pay.studentId,
        amountPaise: BigInt(pay.amountPaise),
        paymentMethod: pay.paymentMethod as PaymentMethod,
        status: pay.status as PaymentStatus,
        razorpayOrderId: pay.razorpayOrderId,
        razorpayPaymentId: pay.razorpayPaymentId,
        receiptNumber: pay.receiptNumber,
        paidAt: new Date(pay.paidAt),
      },
    });
  }

  // 8. Seed Early Warning Alerts
  console.log('Seeding Early Warning Alerts...');
  for (const alert of SEED_EARLY_WARNING_ALERTS) {
    await prisma.earlyWarningAlert.upsert({
      where: { id: alert.id },
      update: {
        riskScore: alert.riskScore,
        riskCategory: alert.riskCategory as RiskCategory,
        primaryFactors: JSON.stringify(alert.primaryFactors),
        evidenceData: JSON.stringify(alert.evidenceData),
        recommendedAction: alert.recommendedAction,
        status: alert.status as AlertStatus,
        assignedFacultyId: alert.assignedFacultyId,
      },
      create: {
        id: alert.id,
        instituteId: institute.id,
        studentId: alert.studentId,
        riskScore: alert.riskScore,
        riskCategory: alert.riskCategory as RiskCategory,
        primaryFactors: JSON.stringify(alert.primaryFactors),
        evidenceData: JSON.stringify(alert.evidenceData),
        recommendedAction: alert.recommendedAction,
        status: alert.status as AlertStatus,
        assignedFacultyId: alert.assignedFacultyId,
      },
    });
  }

  console.log('✅ Database seeded successfully with Apex Academy of Science records!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
