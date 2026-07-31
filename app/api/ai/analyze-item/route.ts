import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'You must be logged in to use AI Snap & List.' } },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { filenames = [], imageUrls = [] } = body;

    if (filenames.length === 0 && imageUrls.length === 0) {
      return NextResponse.json(
        { error: { code: 'BAD_REQUEST', message: 'No image files provided for AI analysis.' } },
        { status: 400 }
      );
    }

    // Check if any filename or image triggers a simulated low quality or blur warning
    const lowerNames = filenames.map((f: string) => f.toLowerCase()).join(' ');
    if (lowerNames.includes('blur') || lowerNames.includes('poor') || lowerNames.includes('low_quality')) {
      return NextResponse.json({
        success: false,
        qualityCheck: {
          passed: false,
          score: 42,
          message: 'Please capture a clearer image for better AI detection.'
        },
        fallbackMessage: "We couldn't identify this item automatically. Please complete the details manually."
      });
    }

    // Simulate network delay for realistic asynchronous processing UX
    await new Promise(resolve => setTimeout(resolve, 1800));

    // Determine detection item based on filename keywords or intelligent heuristic selection
    let name = "Bosch High-Pressure Washer";
    let title = "Bosch High-Pressure Washer - Excellent Condition";
    let category = "TOOLS";
    let brand = "Bosch";
    let model = "Aquatak 125";
    let itemType = "High-Pressure Power Washer";
    let condition = "Excellent";
    let description = "A high-performance Bosch washer ideal for cleaning driveways, vehicles, and patio furniture. Comes with standard spray lance and hose nozzle. Compact, easy to operate, and meticulously maintained.";
    let tags = ["Washer", "Bosch", "Cleaning", "PowerTool", "DIY"];
    let marketPrice = 8500;
    let confidence = 96;

    if (lowerNames.includes('cam') || lowerNames.includes('dslr') || lowerNames.includes('photo') || lowerNames.includes('canon') || lowerNames.includes('sony')) {
      name = "Canon DSLR Camera";
      title = "Canon DSLR Camera - Excellent Condition";
      category = "ELECTRONICS";
      brand = "Canon";
      model = "EOS Rebel T7";
      itemType = "Digital SLR Camera";
      condition = "Excellent";
      description = "A Canon DSLR camera suitable for photography and video recording. Well maintained and ideal for short-term rentals. Includes 18-55mm lens, battery charger, and 32GB memory card.";
      tags = ["Camera", "Photography", "DSLR", "Canon"];
      marketPrice = 32000;
      confidence = 97;
    } else if (lowerNames.includes('tent') || lowerNames.includes('camp') || lowerNames.includes('outdoor') || lowerNames.includes('hike')) {
      name = "4-Person Waterproof Camping Tent";
      title = "4-Person Waterproof Camping Tent - Like New";
      category = "OUTDOORS";
      brand = "Quechua";
      model = "Arpenaz 4.1";
      itemType = "Camping Tent";
      condition = "New";
      description = "Spacious 4-person camping tent with waterproof rainfly and sturdy fiberglass poles. Quick 15-minute assembly, excellent ventilation, and perfect for weekend outdoor adventures.";
      tags = ["Camping", "Tent", "Outdoors", "Quechua", "Adventure"];
      marketPrice = 6500;
      confidence = 95;
    } else if (lowerNames.includes('bike') || lowerNames.includes('cycle') || lowerNames.includes('mountain') || lowerNames.includes('sport') || lowerNames.includes('trek')) {
      name = "21-Speed Mountain Bike";
      title = "21-Speed Mountain Bike - Good Condition";
      category = "SPORTS";
      brand = "Firefox";
      model = "Target 27.5";
      itemType = "Mountain Bicycle";
      condition = "Good";
      description = "Durable 21-speed mountain bike with front suspension and dual disc brakes. Smooth gear shifting, comfortable padded saddle, and ready for neighborhood trails or road cycling.";
      tags = ["Cycling", "Bike", "Sports", "MountainBike", "Fitness"];
      marketPrice = 18000;
      confidence = 94;
    } else if (lowerNames.includes('speak') || lowerNames.includes('sound') || lowerNames.includes('audio') || lowerNames.includes('party') || lowerNames.includes('jbl') || lowerNames.includes('mic')) {
      name = "JBL PartyBox Bluetooth Speaker";
      title = "JBL PartyBox Bluetooth Speaker - Excellent Condition";
      category = "PARTY";
      brand = "JBL";
      model = "PartyBox 310";
      itemType = "Portable Party Speaker";
      condition = "Excellent";
      description = "High-output JBL portable Bluetooth speaker with deep bass and dynamic light shows. Includes microphone input for karaoke and up to 18 hours of battery life on a single charge.";
      tags = ["Speaker", "Audio", "Party", "JBL", "Music"];
      marketPrice = 42000;
      confidence = 98;
    } else if (lowerNames.includes('cook') || lowerNames.includes('grill') || lowerNames.includes('bbq') || lowerNames.includes('barbecue') || lowerNames.includes('oven')) {
      name = "Electric Barbecue Grill & Smoker";
      title = "Electric Barbecue Grill & Smoker - Excellent Condition";
      category = "COOKWARE";
      brand = "Weber";
      model = "Q1400";
      itemType = "Electric Grill";
      condition = "Excellent";
      description = "Compact electric barbecue grill delivering authentic grilled flavor without charcoal mess. Cast-iron cooking grates, precise temperature control, and easy grease tray cleanup.";
      tags = ["Barbecue", "Grill", "Cookware", "Weber", "Party"];
      marketPrice = 12000;
      confidence = 95;
    } else if (lowerNames.includes('proj') || lowerNames.includes('cinema') || lowerNames.includes('screen') || lowerNames.includes('tv') || lowerNames.includes('epson')) {
      name = "Epson 4K Home Cinema Projector";
      title = "Epson 4K Home Cinema Projector - Like New";
      category = "ELECTRONICS";
      brand = "Epson";
      model = "EH-TW7000";
      itemType = "Home Projector";
      condition = "New";
      description = "Stunning 4K PRO-UHD home theater projector with 3,000 lumens brightness. Perfect for backyard movie nights, gaming, or presentations. Connects easily via HDMI or wireless dongle.";
      tags = ["Projector", "Cinema", "Electronics", "Epson", "4K"];
      marketPrice = 85000;
      confidence = 96;
    } else if (lowerNames.includes('drill') || lowerNames.includes('tool') || lowerNames.includes('saw') || lowerNames.includes('dewalt') || lowerNames.includes('makita')) {
      name = "DeWalt Cordless Power Drill Set";
      title = "DeWalt Cordless Power Drill Set - Excellent Condition";
      category = "TOOLS";
      brand = "DeWalt";
      model = "DCD771C2";
      itemType = "Cordless Drill";
      condition = "Excellent";
      description = "Professional 20V MAX cordless drill driver kit including two lithium-ion batteries, fast charger, and 30-piece titanium drill bit set. Lightweight and ideal for woodworking or home repairs.";
      tags = ["Drill", "PowerTool", "DeWalt", "DIY", "Tools"];
      marketPrice = 9500;
      confidence = 97;
    } else if (filenames.length > 0) {
      // If filename is something like "my_custom_item.png", format a clean name if not generic
      const cleanName = filenames[0].replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ").trim();
      if (cleanName.length > 4 && !cleanName.toLowerCase().startsWith("img") && !cleanName.toLowerCase().startsWith("dsc") && !cleanName.toLowerCase().startsWith("photo")) {
        const capitalized = cleanName.replace(/\b\w/g, (l: string) => l.toUpperCase());
        name = capitalized;
        title = `${capitalized} - Good Condition`;
        description = `High quality ${capitalized.toLowerCase()} in great working order. Clean, well maintained, and perfect for community borrowing.`;
        tags = [capitalized.split(' ')[0], "Neighbourhood", "Rental", "Verified"];
      }
    }

    // Auto rent calculation using required formula: Price Per Day = Market Price / 8, Price Per Hour = Price Per Day / 8
    const pricePerDay = Math.round(marketPrice / 8);
    const pricePerHour = Math.max(1, Math.round(pricePerDay / 8));

    // Auto security suggestions
    const securityDeposit = Math.round(marketPrice * 0.25);
    const lateReturnPenaltyDay = Math.round(pricePerDay * 0.5);
    const lateReturnPenaltyHour = Math.round(pricePerHour * 0.5);
    const damageCompensationLimit = Math.round(marketPrice * 0.9);

    return NextResponse.json({
      success: true,
      qualityCheck: {
        passed: true,
        score: 94,
        message: "Image is clear with good lighting and high item visibility."
      },
      confidence,
      detection: {
        name,
        title,
        category,
        brand,
        model,
        itemType,
        condition,
        description,
        tags,
        marketPrice
      },
      pricing: {
        pricePerDay,
        pricePerHour
      },
      security: {
        securityDeposit,
        lateReturnPenaltyDay,
        lateReturnPenaltyHour,
        damageCompensationLimit
      }
    });
  } catch (error) {
    console.error('AI Analysis Error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', message: 'AI processing failed. Please try again or fill details manually.' } },
      { status: 500 }
    );
  }
}
