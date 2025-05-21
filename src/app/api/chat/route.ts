import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'mixtral-8x7b-32768', // or 'llama3-70b-8192'
        messages: [
          { role: 'system', content: 'You are Jarvis, a helpful assistant.' },
          { role: 'user', content: prompt }
        ]
      })
    });

    const data = await response.json();
    return NextResponse.json({ result: data.choices[0].message.content });
  } 
  catch (error) {
  console.error('Groq API error:', error);
  return NextResponse.json({ error: 'Failed to connect to Groq API' }, { status: 500 });
}
}
