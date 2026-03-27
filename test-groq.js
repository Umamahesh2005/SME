import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const apiKey = process.env.VITE_GROQ_API_KEY;

const d = new Date();
const todayStr = d.toISOString().split('T')[0];

const systemPrompt = `You are the AI Voice Assistant for an SME Finance Web App.
You help users manage invoices, expenses, and navigate the app.
The current date today is ${todayStr}.
You MUST ALWAYS output pure JSON in the exact following format, and NOTHING ELSE:
{
  "reply": "response",
  "action": "navigate",
  "data": {}
}`;

const messagesPayload = [
  { role: "system", content: systemPrompt },
  { role: "user", content: "generate invoice" }
];

async function test() {
  const fetch = (await import('node-fetch')).default;
  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: "llama3-8b-8192",
      messages: messagesPayload,
      temperature: 0.1,
      response_format: { type: "json_object" }
    })
  });
  
  if (!res.ok) {
    const text = await res.text();
    console.error("Failed!", res.status, text);
  } else {
    console.log("Success!");
  }
}

test();
