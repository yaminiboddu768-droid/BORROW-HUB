const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'partner@borrowhub.com';
  const password = 'password123';
  const passwordHash = await bcrypt.hash(password, 10);

  // Upsert user
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      role: 'partner',
      partnerStatus: 'approved',
      passwordHash,
    },
    create: {
      email,
      name: 'Apex Equipment Rentals',
      passwordHash,
      role: 'partner',
      partnerStatus: 'approved',
      averageRating: 4.8,
      locationText: 'Metro City, Downtown',
    },
  });

  // Upsert partner profile
  await prisma.partnerProfile.upsert({
    where: { userId: user.id },
    update: {
      businessName: 'Apex Equipment & Tools',
      ownerName: 'Apex Rentals Team',
      address: '123 Business Avenue, Suite 400',
      gstNumber: '22AAAAA0000A1Z5',
      bankAccount: '987654321012',
      upiId: 'apexrentals@upi',
      rentalPolicy: 'Standard 24-hour rental period with flexible extension.',
      damagePolicy: 'Renter covers repair cost for physical damages.',
      returnPolicy: 'Return by 6 PM on the final rental date.',
    },
    create: {
      userId: user.id,
      businessName: 'Apex Equipment & Tools',
      ownerName: 'Apex Rentals Team',
      address: '123 Business Avenue, Suite 400',
      gstNumber: '22AAAAA0000A1Z5',
      bankAccount: '987654321012',
      upiId: 'apexrentals@upi',
      rentalPolicy: 'Standard 24-hour rental period with flexible extension.',
      damagePolicy: 'Renter covers repair cost for physical damages.',
      returnPolicy: 'Return by 6 PM on the final rental date.',
    },
  });

  // Add sample items if none exist
  const item1 = await prisma.item.create({
    data: {
      ownerId: user.id,
      name: 'DeWalt 20V Max Cordless Drill Kit',
      category: 'Tools',
      description: 'High performance cordless drill with 2 batteries and fast charger.',
      pricePerDay: 450,
      pricePerHour: 80,
      source: 'PARTNER',
      brand: 'DeWalt',
      model: 'DCD771C2',
      condition: 'Like New',
      quantity: 3,
      isAvailable: true,
      iconName: 'Wrench',
    },
  });

  const item2 = await prisma.item.create({
    data: {
      ownerId: user.id,
      name: 'Bosch Professional Rotary Hammer Drill',
      category: 'Tools',
      description: 'Heavy duty concrete drilling and chiseling tool.',
      pricePerDay: 750,
      pricePerHour: 120,
      source: 'PARTNER',
      brand: 'Bosch',
      model: 'GBH 2-28',
      condition: 'Excellent',
      quantity: 2,
      isAvailable: true,
      iconName: 'Wrench',
    },
  });

  // Create a borrower user for sample requests
  const borrower = await prisma.user.upsert({
    where: { email: 'borrower@demo.com' },
    update: {},
    create: {
      email: 'borrower@demo.com',
      name: 'Rahul Sharma',
      passwordHash,
      role: 'customer',
    },
  });

  // Add sample borrow requests
  await prisma.borrowRequest.create({
    data: {
      itemId: item1.id,
      borrowerId: borrower.id,
      status: 'pending',
      estimatedCost: 900,
    },
  });

  await prisma.borrowRequest.create({
    data: {
      itemId: item2.id,
      borrowerId: borrower.id,
      status: 'active',
      estimatedCost: 1500,
    },
  });

  await prisma.borrowRequest.create({
    data: {
      itemId: item1.id,
      borrowerId: borrower.id,
      status: 'completed',
      estimatedCost: 450,
    },
  });

  console.log('Successfully seeded approved partner data!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
