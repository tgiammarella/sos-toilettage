import { PrismaClient, Role, ShiftStatus, JobStatus, TrainingType, CreditType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean slate — delete in FK-safe order so seed is re-runnable
  await prisma.review.deleteMany();
  await prisma.engagement.deleteMany();
  await prisma.application.deleteMany();
  await prisma.creditLedger.deleteMany();
  await prisma.shiftPost.deleteMany();
  await prisma.jobPost.deleteMany();
  await prisma.trainingListing.deleteMany();
  await prisma.groomerProfile.deleteMany();
  await prisma.salonProfile.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  // ── Admin ──────────────────────────────────────────────────────────────────
  const adminHash = await bcrypt.hash("admin1234!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@sos-toilettage.ca" },
    update: {},
    create: {
      email: "admin@sos-toilettage.ca",
      name: "Admin SOS",
      passwordHash: adminHash,
      role: Role.ADMIN,
    },
  });
  console.log("✅ Admin:", admin.email);

  // ── Salons ─────────────────────────────────────────────────────────────────
  const salon1Hash = await bcrypt.hash("salon1234!", 12);
  const salonUser1 = await prisma.user.upsert({
    where: { email: "salon1@test.ca" },
    update: {},
    create: {
      email: "salon1@test.ca",
      name: "Salon Canin Montréal",
      passwordHash: salon1Hash,
      role: Role.SALON,
      emailVerified: new Date(),
    },
  });
  const salon1 = await prisma.salonProfile.upsert({
    where: { userId: salonUser1.id },
    update: {},
    create: {
      userId: salonUser1.id,
      name: "Salon Canin Montréal",
      address: "1234 rue Sainte-Catherine O",
      city: "Montréal",
      region: "Montréal",
      postalCode: "H3H 1P3",
      phone: "514-555-0101",
      subscriptionPlan: "BASIC",
      subscriptionStatus: "ACTIVE",
      creditsAvailable: 3,
      creditsMonthlyAllowance: 3,
    },
  });

  const salon2Hash = await bcrypt.hash("salon1234!", 12);
  const salonUser2 = await prisma.user.upsert({
    where: { email: "salon2@test.ca" },
    update: {},
    create: {
      email: "salon2@test.ca",
      name: "Toilettage Pro Québec",
      passwordHash: salon2Hash,
      role: Role.SALON,
      emailVerified: new Date(),
    },
  });
  const salon2 = await prisma.salonProfile.upsert({
    where: { userId: salonUser2.id },
    update: {},
    create: {
      userId: salonUser2.id,
      name: "Toilettage Pro Québec",
      address: "567 boulevard Laurier",
      city: "Québec",
      region: "Capitale-Nationale",
      postalCode: "G1V 2L7",
      phone: "418-555-0202",
      subscriptionPlan: "PRO",
      subscriptionStatus: "ACTIVE",
      creditsAvailable: 10,
      creditsMonthlyAllowance: 10,
    },
  });
  console.log("✅ Salons:", salon1.name, "/", salon2.name);

  // ── Groomers ───────────────────────────────────────────────────────────────
  const groomer1Hash = await bcrypt.hash("groomer1234!", 12);
  const groomerUser1 = await prisma.user.upsert({
    where: { email: "marie@test.ca" },
    update: {},
    create: {
      email: "marie@test.ca",
      name: "Marie Tremblay",
      passwordHash: groomer1Hash,
      role: Role.GROOMER,
      emailVerified: new Date(),
    },
  });
  const groomer1 = await prisma.groomerProfile.upsert({
    where: { userId: groomerUser1.id },
    update: {},
    create: {
      userId: groomerUser1.id,
      fullName: "Marie Tremblay",
      city: "Montréal",
      region: "Montréal",
      yearsExperience: 5,
      specializations: JSON.stringify(["BIG_DOGS", "CATS"]),
      certifications: JSON.stringify(["Attestation d'études collégiales — Toilettage animalier"]),
      bio: "Toiletteuse passionnée avec 5 ans d'expérience, spécialisée en races à poil long.",
    },
  });

  const groomer2Hash = await bcrypt.hash("groomer1234!", 12);
  const groomerUser2 = await prisma.user.upsert({
    where: { email: "sophie@test.ca" },
    update: {},
    create: {
      email: "sophie@test.ca",
      name: "Sophie Gagnon",
      passwordHash: groomer2Hash,
      role: Role.GROOMER,
      emailVerified: new Date(),
    },
  });
  const groomer2 = await prisma.groomerProfile.upsert({
    where: { userId: groomerUser2.id },
    update: {},
    create: {
      userId: groomerUser2.id,
      fullName: "Sophie Gagnon",
      city: "Laval",
      region: "Laval",
      yearsExperience: 3,
      specializations: JSON.stringify(["AGGRESSIVE_DOGS", "RABBITS"]),
      certifications: JSON.stringify([]),
      bio: "Spécialiste en gestion des animaux anxieux et difficiles.",
    },
  });
  console.log("✅ Groomers:", groomer1.fullName, "/", groomer2.fullName);

  // ── Shift Posts ────────────────────────────────────────────────────────────
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);

  await prisma.shiftPost.createMany({
    data: [
      {
        salonId: salon1.id,
        date: tomorrow,
        startTime: "09:00",
        address: "1234 rue Sainte-Catherine O",
        city: "Montréal",
        region: "Montréal",
        postalCode: "H3H 1P3",
        lat: 45.4962,
        lng: -73.5829,
        numberOfAppointments: 6,
        payType: "HOURLY",
        payRateCents: 2500,
        requiredExperienceYears: 2,
        criteriaTags: JSON.stringify(["BIG_DOGS", "CATS"]),
        equipmentProvided: true,
        isUrgent: true,
        urgentActivatedAt: new Date(),
        status: ShiftStatus.PUBLISHED,
        publishedAt: new Date(),
        notes: "Remplacement urgent — toiletteuse absente pour maladie.",
      },
      {
        salonId: salon1.id,
        date: nextWeek,
        startTime: "10:00",
        address: "1234 rue Sainte-Catherine O",
        city: "Montréal",
        region: "Montréal",
        postalCode: "H3H 1P3",
        lat: 45.4962,
        lng: -73.5829,
        numberOfAppointments: 4,
        payType: "FLAT",
        payRateCents: 18000,
        requiredExperienceYears: 1,
        criteriaTags: JSON.stringify(["BIG_DOGS"]),
        equipmentProvided: false,
        isUrgent: false,
        status: ShiftStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      {
        salonId: salon2.id,
        date: nextWeek,
        startTime: "08:30",
        address: "567 boulevard Laurier",
        city: "Québec",
        region: "Capitale-Nationale",
        postalCode: "G1V 2L7",
        lat: 46.7833,
        lng: -71.2729,
        numberOfAppointments: 5,
        payType: "HOURLY",
        payRateCents: 2200,
        requiredExperienceYears: 3,
        criteriaTags: JSON.stringify(["CATS", "RABBITS"]),
        equipmentProvided: true,
        isUrgent: false,
        status: ShiftStatus.PUBLISHED,
        publishedAt: new Date(),
        notes: "Jour de congé planifié — bonne ambiance garantie !",
      },
    ],
  });

  // ── Job Posts ──────────────────────────────────────────────────────────────
  await prisma.jobPost.createMany({
    data: [
      {
        salonId: salon2.id,
        title: "Toiletteur(se) — temps plein",
        employmentType: "FULL_TIME",
        city: "Québec",
        region: "Capitale-Nationale",
        description:
          "Nous recherchons un(e) toiletteur(se) expérimenté(e) pour rejoindre notre équipe à temps plein. Salaire compétitif, clientèle établie, horaire stable.",
        payInfo: "28–34 $/h selon expérience",
        requirements: "Minimum 2 ans d'expérience. Connaissance des principales races.",
        status: JobStatus.PUBLISHED,
        publishedAt: new Date(),
      },
      {
        salonId: salon1.id,
        title: "Toiletteur(se) — temps partiel (weekends)",
        employmentType: "PART_TIME",
        city: "Montréal",
        region: "Montréal",
        description:
          "Poste de weekend disponible dans un salon bien établi. Parfait pour compléter un autre emploi ou comme entrée dans le métier.",
        payInfo: "22–26 $/h",
        requirements: "Expérience avec les chiens et chats. Certifications un atout.",
        status: JobStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    ],
  });
  console.log("✅ Shift posts and job posts created");

  // ── Credit ledger entries for salons ──────────────────────────────────────
  await prisma.creditLedger.createMany({
    data: [
      {
        salonId: salon1.id,
        type: CreditType.CREDIT,
        amount: 3,
        reason: "PACK_PURCHASE",
      },
      {
        salonId: salon2.id,
        type: CreditType.CREDIT,
        amount: 10,
        reason: "MONTHLY_GRANT",
      },
    ],
  });

  // ── Training directory ─────────────────────────────────────────────────────
  await prisma.trainingListing.createMany({
    data: [
      {
        type: TrainingType.SCHOOL,
        name: "Institut de toilettage du Québec",
        city: "Montréal",
        region: "Montréal",
        websiteUrl: "https://example.com/itq",
        description:
          "Programme complet de toilettage animalier reconnu par le ministère de l'Éducation du Québec. Formation de 12 mois avec stages.",
        tags: JSON.stringify(["AEC", "Chiens", "Chats", "Stages"]),
        isActive: true,
      },
      {
        type: TrainingType.SCHOOL,
        name: "École de Toilettage Animalia",
        city: "Québec",
        region: "Capitale-Nationale",
        websiteUrl: "https://example.com/animalia",
        description:
          "Formation professionnelle en toilettage animalier. Petites classes, instructeurs certifiés.",
        tags: JSON.stringify(["Cours privés", "Certification"]),
        isActive: true,
      },
      {
        type: TrainingType.COURSE,
        name: "Formation Races Nordiques — Malamute & Husky",
        city: "Laval",
        region: "Laval",
        description:
          "Formation spécialisée d'une journée pour la tonte et le brossage des races nordiques à poil double.",
        tags: JSON.stringify(["Spécialisation", "Races nordiques", "1 jour"]),
        isActive: true,
      },
      {
        type: TrainingType.COURSE,
        name: "Gestion de l'anxiété chez l'animal — Toilettage sans stress",
        city: "Sherbrooke",
        region: "Estrie",
        description:
          "Techniques de contention douce et de désensibilisation. Idéal pour les toiletteurs confrontés à des animaux anxieux.",
        tags: JSON.stringify(["Bien-être animal", "Anxiété", "2 jours"]),
        isActive: true,
      },
    ],
  });
  console.log("✅ Training listings created");

  // ── Test coupons (upsert — safe to re-run) ────────────────────────────────
  await prisma.coupon.upsert({
    where: { code: "BIENVENUE25" },
    update: {},
    create: { code: "BIENVENUE25", type: "CREDITS", credits: 25, maxUses: 999 },
  });
  await prisma.coupon.upsert({
    where: { code: "ESSENTIEL2025" },
    update: {},
    create: { code: "ESSENTIEL2025", type: "BOTH", credits: 5, planKey: "ESSENTIEL", maxUses: 100 },
  });
  await prisma.coupon.upsert({
    where: { code: "SALON2025" },
    update: {},
    create: { code: "SALON2025", type: "PLAN", credits: 0, planKey: "SALON", maxUses: 50 },
  });
  console.log("✅ Coupons: BIENVENUE25 | ESSENTIEL2025 | SALON2025");

  console.log("\n🎉 Seed complete!");
  console.log("──────────────────────────────────────");
  console.log("Credentials:");
  console.log("  Admin:   admin@sos-toilettage.ca / admin1234!");
  console.log("  Salon 1: salon1@test.ca / salon1234!");
  console.log("  Salon 2: salon2@test.ca / salon1234!");
  console.log("  Groomer: marie@test.ca / groomer1234!");
  console.log("  Groomer: sophie@test.ca / groomer1234!");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
