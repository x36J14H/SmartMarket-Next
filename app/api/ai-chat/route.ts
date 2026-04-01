import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

function buildSystemInstruction(products: unknown[]) {
  const simplified = (products as any[]).map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    description: p.shortDescription,
    link: `/product/${p.slug}`,
  }));

  return `
You are a helpful, friendly AI shopping assistant for MarketMVP, an e-commerce store.
Your goal is to help users find products, answer questions about the store, and provide recommendations.
Always be polite and concise.

Here is the store's current catalog:
${JSON.stringify(simplified)}

CRITICAL RULE 1: Whenever you mention a specific product from the catalog, you MUST provide a markdown link to it using the 'link' property provided in the catalog data.
Example format: [Product Name](/product/product-slug)

CRITICAL RULE 2: Whenever you mention a price, you MUST wrap it in backticks so it formats as inline code.
Example format: \`12 990 ₽\`

If a user asks for a product, recommend it from the catalog, mention its price (wrapped in backticks), and provide the link.
If a user asks something unrelated to shopping or the store, politely steer the conversation back to the store's products.
`;
}

export async function POST(req: NextRequest) {
  try {
    const { message, history, products } = await req.json();

    const chat = ai.chats.create({
      model: 'gemini-2.0-flash',
      config: {
        systemInstruction: buildSystemInstruction(products || []),
        temperature: 0.7,
      },
      history: history || [],
    });

    const response = await chat.sendMessage({ message });
    return NextResponse.json({ text: response.text });
  } catch (error) {
    console.error('AI Chat error:', error);
    return NextResponse.json({ error: 'AI service error' }, { status: 500 });
  }
}
