import crypto from 'crypto';
import OpenAI from 'openai';

export interface AIVisionInput {
  images?: string[]; // base64 DataURLs or URLs
  filenames?: string[];
}

export type ItemCategory = 'TOOLS' | 'ELECTRONICS' | 'SPORTS' | 'COOKWARE' | 'BOOKS' | 'OUTDOORS' | 'FURNITURE' | 'TRAVEL' | 'PARTY' | 'FITNESS' | 'VEHICLES' | 'APPLIANCES' | 'OTHER';

export interface AIDetectionResult {
  itemId: string;
  detectedObject: string;
  name: string;
  title: string;
  category: ItemCategory;
  brand?: string;
  model?: string;
  itemType?: string;
  condition: 'New' | 'Like New' | 'Excellent' | 'Good' | 'Fair';
  description: string;
  tags: string[];
  estimatedMarketPrice: number;
  confidence: number;
}

export interface AIVisionResponse {
  success: boolean;
  unavailable?: boolean;
  fingerprintHash?: string;
  confidence?: number;
  qualityCheck?: {
    passed: boolean;
    score: number;
    message: string;
  };
  detection?: AIDetectionResult;
  pricing?: {
    suggestedRentalPrice: number;
    pricePerDay: number;
    pricePerHour: number;
  };
  security?: {
    securityDeposit: number;
    lateReturnPenaltyDay: number;
    lateReturnPenaltyHour: number;
    damageCompensationLimit: number;
  };
  fallbackMessage?: string;
}

const fingerprintCache = new Map<string, AIVisionResponse>();

function extractHash(images: string[], filenames: string[]): string {
  const hash = crypto.createHash('sha256');
  images.forEach(img => {
    if (img.startsWith('data:')) {
      const base64Str = img.split(',')[1] || '';
      hash.update(base64Str.substring(0, 1000));
      hash.update(base64Str.substring(Math.max(0, base64Str.length - 1000)));
    } else {
      hash.update(img);
    }
  });
  filenames.forEach(f => hash.update(f.toLowerCase()));
  return hash.digest('hex');
}

export async function analyzeUploadedImages(input: AIVisionInput): Promise<AIVisionResponse> {
  const images = input.images || [];
  const filenames = input.filenames || [];

  if (images.length === 0) {
    return {
      success: false,
      unavailable: true,
      fallbackMessage: "We couldn't confidently identify this item. Please upload clearer images or enter the details manually.",
    };
  }

  const fingerprintHash = extractHash(images, filenames);
  if (fingerprintCache.has(fingerprintHash)) {
    const cached = fingerprintCache.get(fingerprintHash)!;
    return { ...cached, fingerprintHash };
  }

  const openaiApiKey = process.env.OPENAI_API_KEY;
  if (!openaiApiKey) {
     return {
      success: false,
      unavailable: true,
      fallbackMessage: "OpenAI API key is not configured.",
    };
  }

  try {
    const openai = new OpenAI({ apiKey: openaiApiKey });

    // Extract base64 and mime parts
    const firstImage = images[0];
    let base64Data = '';
    let mimeType = 'image/jpeg';
    
    if (firstImage.startsWith('data:')) {
      const parts = firstImage.split(';');
      mimeType = parts[0].replace('data:', '');
      base64Data = parts[1].replace('base64,', '');
    } else {
       return {
          success: false,
          unavailable: true,
          fallbackMessage: "Invalid image format uploaded.",
        };
    }

    const prompt = `Analyze this uploaded product image for a community borrowing & rental marketplace.
FIRST, detect the primary object present in the image (e.g. Bicycle, Laptop, Pressure Cooker, Power Drill, Camera, Chair, TV, Microwave, Tent, Football).
THEN generate item details corresponding ONLY to that detected object.

Return ONLY a valid JSON object matching exactly this schema, without any markdown formatting like \`\`\`json:
{
  "detectedObject": "Primary object name",
  "name": "Short concise product title",
  "title": "Full product title",
  "category": "COOKWARE|TOOLS|ELECTRONICS|SPORTS|OUTDOORS|APPLIANCES|FURNITURE|PARTY|VEHICLES|OTHER",
  "brand": "Brand if visible",
  "model": "Model if visible",
  "itemType": "Product classification",
  "condition": "New|Like New|Excellent|Good|Fair",
  "description": "2-3 sentences describing ONLY the detected object: what it is, main purpose, condition, basic characteristics, and suitable use case.",
  "tags": ["tag1", "tag2"],
  "estimatedMarketPrice": estimated_rupee_price_number,
  "confidence": confidence_number_between_80_and_98
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Data}`,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
    });

    const responseText = response.choices[0].message.content || '{}';
    
    // Clean up potential markdown formatting (though json_object format should handle this, just to be safe)
    const cleanedText = responseText.replace(/```json\n/g, '').replace(/```\n?/g, '').trim();
    
    const parsed: AIDetectionResult = JSON.parse(cleanedText);
    
    if (!parsed || !parsed.detectedObject) {
       throw new Error("Failed to parse valid AI detection result.");
    }
    
    const finalResponse = formatProductionResponse(parsed, fingerprintHash);
    fingerprintCache.set(fingerprintHash, finalResponse);
    return finalResponse;

  } catch (error) {
    console.error('OpenAI Vision API Error:', error);
    return {
      success: false,
      unavailable: true,
      qualityCheck: {
        passed: false,
        score: 0,
        message: 'Failed to analyze image.',
      },
      fallbackMessage: "Our AI could not analyze the image. Please enter details manually.",
    };
  }
}

function formatProductionResponse(detection: AIDetectionResult, fingerprintHash: string): AIVisionResponse {
  const estimatedMarketPrice = detection.estimatedMarketPrice || 3500;
  const suggestedRentalPrice = Math.round(estimatedMarketPrice / 8);
  const pricePerHour = Math.max(1, Math.round(suggestedRentalPrice / 8));
  const securityDeposit = Math.round(estimatedMarketPrice * 0.20);
  const lateReturnPenaltyDay = Math.round(suggestedRentalPrice * 0.50);
  const lateReturnPenaltyHour = Math.round(pricePerHour * 0.50);
  const damageCompensationLimit = Math.round(estimatedMarketPrice * 0.90);

  const fullDetection: AIDetectionResult = {
    ...detection,
    itemId: detection.itemId || 'ai-item-' + fingerprintHash.substring(0, 8),
    estimatedMarketPrice,
  };

  return {
    success: true,
    fingerprintHash,
    qualityCheck: {
      passed: true,
      score: detection.confidence || 95,
      message: `Object detection stage complete: Identified "${detection.detectedObject}".`,
    },
    confidence: detection.confidence || 95,
    detection: fullDetection,
    pricing: {
      suggestedRentalPrice,
      pricePerDay: suggestedRentalPrice,
      pricePerHour,
    },
    security: {
      securityDeposit,
      lateReturnPenaltyDay,
      lateReturnPenaltyHour,
      damageCompensationLimit,
    },
  };
}
