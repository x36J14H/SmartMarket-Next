import { GoogleGenAI, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const { query, products } = await req.json();

    const simplified = (products as any[]).map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      subcategory: p.subcategory,
      brand: p.brand,
      description: p.shortDescription,
      price: p.price,
    }));

    const prompt = `
      You are an AI shopping assistant for an e-commerce store.
      A user is searching for: "${query}"
      
      Here is the list of available products:
      ${JSON.stringify(simplified)}
      
      Return a list of product IDs that best match the user's search query.
      Consider synonyms, categories, brands, and semantic meaning.
      Order them by relevance (best match first).
      If no products match, return an empty array.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
    });

    const matchedIds = JSON.parse(response.text || '[]') as string[];
    return NextResponse.json({ ids: matchedIds });
  } catch (error) {
    console.error('AI Search error:', error);
    return NextResponse.json({ ids: [] }, { status: 500 });
  }
}
