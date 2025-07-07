import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getUserWithFinancialInfo, createOrUpdateUserFinancialInfo, getAllMessagesForUser } from '@/db/chatUtils';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    // TODO: Add admin authentication here
    const resolvedParams = await params;
    const user_id = parseInt(resolvedParams.userId, 10);
    
    if (isNaN(user_id)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Get user with existing financial info
    const user = await getUserWithFinancialInfo(user_id);
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all messages from user's chats (limit to last 50 messages for context)
    const messages = await getAllMessagesForUser(user_id, 50);
    
    if (messages.length === 0) {
      return NextResponse.json({ 
        error: 'No chat history found for this user',
        extracted: false 
      }, { status: 400 });
    }

    // Prepare chat history for LLM analysis
    const chatHistory = messages
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    // Create extraction prompt
    const extractionPrompt = `
Analyze the following chat history and extract personal financial information. Return ONLY a JSON object with the following structure. If information is not available, use null.

Chat History:
${chatHistory}

Extract and return ONLY this JSON structure:
{
  "gender": "male|female|other|null",
  "birthdate": "YYYY-MM-DD|null",
  "estimated_salary": number|null,
  "country": "string|null",
  "domicile": "string|null", 
  "active_loan": number|null,
  "bi_checking_status": "approved|rejected|pending|null"
}

Rules:
- For salary: Extract only the number, no currency symbols
- For active_loan: Count the number of loans mentioned
- For birthdate: Use YYYY-MM-DD format if found
- For gender: Use "male", "female", or "other"
- For bi_checking_status: Use "approved", "rejected", or "pending"
- If information is not mentioned, use null
- Return ONLY the JSON, no other text
`;

    // Call OpenAI for extraction
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a financial data extraction specialist. Extract only the requested information and return it as JSON."
        },
        {
          role: "user",
          content: extractionPrompt
        }
      ],
      temperature: 0.1,
      max_tokens: 500
    });

    const responseText = completion.choices[0]?.message?.content;
    
    if (!responseText) {
      return NextResponse.json({ error: 'Failed to extract financial data' }, { status: 500 });
    }

    // Parse the JSON response
    let extractedData;
    try {
      // Clean the response to extract JSON
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      extractedData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse LLM response:', responseText);
      return NextResponse.json({ error: 'Failed to parse extracted data' }, { status: 500 });
    }

    // Validate and clean the extracted data
    const cleanedData = {
      gender: extractedData.gender && ['male', 'female', 'other'].includes(extractedData.gender) 
        ? extractedData.gender : null,
      birthdate: extractedData.birthdate || null,
      estimated_salary: typeof extractedData.estimated_salary === 'number' && extractedData.estimated_salary > 0 
        ? extractedData.estimated_salary : null,
      country: extractedData.country || null,
      domicile: extractedData.domicile || null,
      active_loan: typeof extractedData.active_loan === 'number' && extractedData.active_loan >= 0 
        ? extractedData.active_loan : null,
      bi_checking_status: extractedData.bi_checking_status && ['approved', 'rejected', 'pending'].includes(extractedData.bi_checking_status)
        ? extractedData.bi_checking_status : null
    };

    // Store the extracted data
    const updatedFinancialInfo = await createOrUpdateUserFinancialInfo(user_id, cleanedData);

    return NextResponse.json({
      success: true,
      extracted: true,
      data: cleanedData,
      message: 'Financial data extracted and stored successfully'
    });

  } catch (err) {
    console.error('Financial extraction error:', err);
    return NextResponse.json({ 
      error: 'Failed to extract financial data',
      extracted: false 
    }, { status: 500 });
  }
} 