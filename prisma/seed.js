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
    createItem("MacBook Pro M2 16-inch", "ELECTRONICS", 120000, "Excellent condition for coding and video editing", "Tv", null, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=800"),
    createItem("DSLR Camera Canon 5D", "CAMERAS", 80000, "Includes 50mm lens and SD card", "Camera", "RentMyGear", "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=800"),
    createItem("GoPro Action Camera", "CAMERAS", 35000, "Comes with underwater casing and mount", "Camera", null, "https://images.unsplash.com/photo-1564466809058-bf4114d55352?auto=format&fit=crop&q=80&w=800"),
    createItem("Epson Home Projector", "ELECTRONICS", 45000, "1080p, great for movie nights", "Tv", "LensRentals", "https://images.unsplash.com/photo-1574267432553-4b4628081c31?auto=format&fit=crop&q=80&w=800"),
    createItem("iPad Air 5 Tablet", "ELECTRONICS", 55000, "With Apple Pencil for sketching", "Tv", null, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&q=80&w=800"),
    createItem("HP LaserJet Printer", "ELECTRONICS", 15000, "B/W printing, wireless document copy", "Tv", null, "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&q=80&w=800"),
    createItem("Sony PS5 Console", "ELECTRONICS", 50000, "With 2 wireless DualSense controllers", "Gamepad2", "GamerRent", "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&q=80&w=800"),
    createItem("Dell 27-inch 4K Monitor", "ELECTRONICS", 25000, "USB-C charging and IPS panel", "Tv", null, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80&w=800"),

    // Vehicles & Mobility
    createItem("Mountain Bicycle", "VEHICLES", 15000, "21 gears, freshly serviced with helmet", "Bike", null, "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=800"),
    createItem("Electric Scooter", "VEHICLES", 30000, "25km range, fast charger included", "Bike", "CityRides", "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&q=80&w=800"),
    createItem("Motorcycle Helmet", "VEHICLES", 4000, "DOT certified, size Large black helmet", "Bike", null, "https://images.unsplash.com/photo-1622185135505-2d795003994a?auto=format&fit=crop&q=80&w=800"),

    // Tools & DIY
    createItem("Bosch Power Drill", "TOOLS", 5000, "18V cordless drill with bit set", "Wrench", null, "https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&q=80&w=800"),
    createItem("Makita Circular Saw", "TOOLS", 12000, "Powerful wood cutting circular saw", "Wrench", "ToolShare", "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&q=80&w=800"),
    createItem("10ft Aluminum Ladder", "TOOLS", 4500, "Foldable stepladder for house painting", "Wrench", null, "https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?auto=format&fit=crop&q=80&w=800"),

    // Outdoors & Party
    createItem("4-Person Camping Tent", "OUTDOORS", 12000, "Waterproof dome tent, easy setup", "Tent", "OutdoorGear", "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=800"),
    createItem("Winter Sleeping Bag", "OUTDOORS", 3000, "Thermal sub-zero rated sleeping bag", "Tent", null, "https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&q=80&w=800"),
    createItem("LED Party Lights set", "PARTY", 6000, "RGB stage lights with remote control", "Sparkles", null, "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&q=80&w=800"),
    createItem("JBL PartyBox Speaker", "PARTY", 35000, "240W loud wireless party speaker", "Radio", "PartyRentals", "https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&q=80&w=800"),
    createItem("Yamaha Acoustic Guitar", "OTHER", 15000, "Warm tone acoustic guitar with gig bag", "Radio", null, "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&q=80&w=800"),

    // Furniture
    createItem("Ergonomic Office Chair", "FURNITURE", 18000, "Executive mesh chair with lumbar support", "Store", null, "https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&q=80&w=800"),
    createItem("Wooden Study Table", "FURNITURE", 8000, "Minimalist solid wood desk", "Store", null, "https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&q=80&w=800"),

    // Kitchen Appliances
    createItem("KitchenAid Stand Mixer", "APPLIANCES", 40000, "Kitchen stand mixer with dough hook", "ChefHat", "KitchenShare", "https://images.unsplash.com/photo-1594385208974-2e75f8d7bb48?auto=format&fit=crop&q=80&w=800"),
    createItem("TTK Prestige Pressure Cooker 5L", "COOKWARE", 4500, "Heavy-duty 5L stainless steel pressure cooker", "ChefHat", null, "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800"),
    createItem("Symphony Air Cooler", "APPLIANCES", 8000, "Personal tower room air cooler", "Waves", null, "https://images.unsplash.com/photo-1585338107529-13afc5f02586?auto=format&fit=crop&q=80&w=800"),

    // Travel & Fitness
    createItem("Samsonite Suitcase", "TRAVEL", 12000, "Hard shell spinner travel luggage", "Store", null, "https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?auto=format&fit=crop&q=80&w=800"),
    createItem("Adjustable Dumbbells (2x24kg)", "FITNESS", 18000, "Selectable weight dumbbells set", "Store", null, "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&q=80&w=800"),
    createItem("Full Cricket Kit", "SPORTS", 10000, "English willow bat, pads, helmet, gloves", "Store", null, "https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&q=80&w=800"),
    createItem("Football & Training Cones", "SPORTS", 2500, "Official size 5 match football", "Store", null, "https://images.unsplash.com/photo-1614632537190-23e4146777db?auto=format&fit=crop&q=80&w=800"),
    createItem("Yonex Badminton Rackets (Pair)", "SPORTS", 4000, "Carbon graphite rackets with shuttlecocks", "Store", null, "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&q=80&w=800"),
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
