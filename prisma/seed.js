const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing existing data...');
  await prisma.borrowRequest.deleteMany();
  await prisma.item.deleteMany();
  await prisma.user.deleteMany();

  console.log('Creating test users...');
  
  const pHash = await bcrypt.hash('password123', 10);
  
  const alice = await prisma.user.create({
    data: { name: 'Alice Neighbor', email: 'alice@example.com', passwordHash: pHash, averageRating: 4.8 }
  });
  const bob = await prisma.user.create({
    data: { name: 'Bob Builder', email: 'bob@example.com', passwordHash: pHash, averageRating: 4.9 }
  });
  const charlie = await prisma.user.create({
    data: { name: 'Charlie Chef', email: 'charlie@example.com', passwordHash: pHash, averageRating: 5.0 }
  });

  const owners = [alice.id, bob.id, charlie.id];
  const getRandomOwner = () => owners[Math.floor(Math.random() * owners.length)];

  const createItem = (name, category, marketPrice, description, iconName, platformName = null, imageUrl) => {
    // Realistic startup pricing:
    // Daily rental is ~2.5% of market value
    // Hourly rental is 1/5th of daily rental
    const pricePerDay = Number((marketPrice / 40).toFixed(2));
    const pricePerHour = Number((pricePerDay / 5).toFixed(2));
    
    return {
      ownerId: getRandomOwner(),
      name,
      category,
      description,
      marketPrice,
      pricePerDay,
      pricePerHour,
      penaltyPerDay: Number((pricePerDay * 1.5).toFixed(2)),
      penaltyPerHour: Number((pricePerHour * 1.5).toFixed(2)),
      source: platformName ? 'ONLINE' : 'NEIGHBOUR',
      platformName,
      iconName,
      distanceKm: platformName ? 0 : Number((Math.random() * 4.5 + 0.5).toFixed(1)),
      timesBorrowed: Math.floor(Math.random() * 20),
      imageUrls: JSON.stringify([imageUrl]),
      imageUrl: imageUrl
    };
  };

  const itemsData = [
    // Electronics & Tech
    createItem("MacBook Pro M2", "ELECTRONICS", 120000, "Excellent condition for coding/editing", "Tv", null, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400"),
    createItem("DSLR Camera Canon 5D", "CAMERAS", 80000, "Includes 50mm lens and SD card", "Camera", "RentMyGear", "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400"),
    createItem("GoPro Action Camera", "CAMERAS", 35000, "Comes with underwater casing", "Camera", null, "https://images.unsplash.com/photo-1527661591475-527312dd65f5?auto=format&fit=crop&q=80&w=400"),
    createItem("Epson Home Projector", "ELECTRONICS", 45000, "1080p, great for movie nights", "Tv", "LensRentals", "https://images.unsplash.com/photo-1574267432553-4b4628081c31?auto=format&fit=crop&q=80&w=400"),
    createItem("iPad Air 5", "ELECTRONICS", 55000, "With Apple Pencil", "Tv", null, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=400"),
    createItem("HP LaserJet Printer", "ELECTRONICS", 15000, "B/W printing, lots of toner", "Tv", null, "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&q=80&w=400"),
    createItem("Texas Instruments Calculator", "ELECTRONICS", 8000, "TI-84 Plus, great for exams", "Tv", null, "https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&q=80&w=400"),
    createItem("Sony PS5 Console", "ELECTRONICS", 50000, "With 2 controllers", "Gamepad2", "GamerRent", "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=400"),
    createItem("Dell 27-inch 4K Monitor", "ELECTRONICS", 25000, "USB-C charging supported", "Tv", null, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=400"),

    // Vehicles & Mobility
    createItem("Mountain Bicycle", "VEHICLES", 15000, "21 gears, freshly serviced", "Bike", null, "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=400"),
    createItem("Electric Scooter", "VEHICLES", 30000, "25km range, charger included", "Bike", "CityRides", "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=400"),
    createItem("Motorcycle Helmet", "VEHICLES", 4000, "DOT certified, size Large", "Bike", null, "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=400"),

    // Tools & DIY
    createItem("Bosch Power Drill", "TOOLS", 5000, "Comes with various drill bits", "Wrench", null, "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=400"),
    createItem("Makita Circular Saw", "TOOLS", 12000, "Powerful cutting tool", "Wrench", "ToolShare", "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&q=80&w=400"),
    createItem("Gardening Shears & Spade", "TOOLS", 3000, "High quality steel", "Wrench", null, "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=400"),
    createItem("10ft Aluminum Ladder", "TOOLS", 4500, "Foldable and sturdy", "Wrench", null, "https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?auto=format&fit=crop&q=80&w=400"),

    // Outdoors & Party
    createItem("4-Person Camping Tent", "OUTDOORS", 12000, "Waterproof, easy setup", "Tent", "OutdoorGear", "https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?auto=format&fit=crop&q=80&w=400"),
    createItem("Winter Sleeping Bag", "OUTDOORS", 3000, "Sub-zero rated", "Tent", null, "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&q=80&w=400"),
    createItem("LED Party Lights set", "PARTY", 6000, "RGB with remote control", "Sparkles", null, "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=400"),
    createItem("JBL PartyBox Speaker", "PARTY", 35000, "Loud, great bass", "Radio", "PartyRentals", "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400"),
    createItem("Shure SM58 Microphone", "PARTY", 9000, "Vocal mic with cable", "Radio", null, "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=400"),
    createItem("Yamaha Acoustic Guitar", "OTHER", 15000, "Warm tone, comes with gig bag", "Radio", null, "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=400"),

    // Furniture
    createItem("Ergonomic Office Chair", "FURNITURE", 18000, "Lumbar support", "Store", null, "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=400"),
    createItem("Wooden Study Table", "FURNITURE", 8000, "Minimalist design", "Store", null, "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=400"),

    // Kitchen Appliances
    createItem("KitchenAid Stand Mixer", "APPLIANCES", 40000, "Red, with dough hook", "ChefHat", "KitchenShare", "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=400"),
    createItem("Philips Induction Stove", "APPLIANCES", 5000, "Fast heating, safe", "Flame", null, "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=400"),
    createItem("Symphony Air Cooler", "APPLIANCES", 8000, "Great for summer", "Waves", null, "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400"),
    createItem("Dyson Vacuum Cleaner", "APPLIANCES", 45000, "V11 Absolute, cordless", "Sparkles", "CleanRent", "https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&q=80&w=400"),

    // Travel & Baby
    createItem("Samsonite Suitcase", "TRAVEL", 12000, "Hard shell, 4 wheels", "Store", null, "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?auto=format&fit=crop&q=80&w=400"),
    createItem("Trekking Backpack 60L", "TRAVEL", 6000, "Quechua Forclaz", "Store", null, "https://images.unsplash.com/photo-1553531384-cc64ac80f931?auto=format&fit=crop&q=80&w=400"),
    createItem("Graco Baby Stroller", "OTHER", 15000, "Foldable and lightweight", "Store", null, "https://images.unsplash.com/photo-1521503862198-2ae9a997bbc9?auto=format&fit=crop&q=80&w=400"),
    createItem("Foldable Wheelchair", "OTHER", 10000, "Standard adult size", "Store", "CareEquip", "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&q=80&w=400"),

    // Fitness & Sports
    createItem("Adjustable Dumbbells (2x24kg)", "FITNESS", 18000, "Bowflex style", "Store", null, "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=400"),
    createItem("Foldable Treadmill", "FITNESS", 35000, "Up to 12km/h", "Store", "FitRent", "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&q=80&w=400"),
    createItem("Full Cricket Kit", "SPORTS", 10000, "Bat, pads, gloves, helmet", "Store", null, "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=400"),
    createItem("Football & Training Cones", "SPORTS", 2500, "Size 5 ball", "Store", null, "https://images.unsplash.com/photo-1614632537190-23e4146777db?auto=format&fit=crop&q=80&w=400"),
    createItem("Yonex Badminton Rackets (Pair)", "SPORTS", 4000, "Carbon frame", "Store", null, "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=400"),

    // Misc
    createItem("Singer Sewing Machine", "OTHER", 12000, "Basic stitch patterns", "Store", null, "https://images.unsplash.com/photo-1516216628859-9bccecab13ca?auto=format&fit=crop&q=80&w=400"),
    createItem("Professional Painting Kit", "OTHER", 4000, "Rollers, brushes, drop cloth", "Store", null, "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=400"),
    createItem("Studio Photography Lights", "OTHER", 20000, "Softboxes and stands", "Camera", "LensRentals", "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=400"),
  ];

  console.log(`Inserting ${itemsData.length} items...`);
  await prisma.item.createMany({ data: itemsData });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
