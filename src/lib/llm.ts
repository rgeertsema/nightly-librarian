import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function callLLM(systemPrompt: string, userContent: string, model = 'gpt-4o') {
    const completion = await openai.chat.completions.create({
        messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userContent }],
        model, response_format: { type: 'json_object' }, temperature: 0.2,
    });
    const content = completion.choices[0].message.content;
    if (!content) throw new Error('Empty response from LLM');
    return JSON.parse(content);
}
