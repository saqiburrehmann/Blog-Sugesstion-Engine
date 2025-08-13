// src/common/utils/groqcloud.ts
import axios from 'axios';

export async function generateBlogContent(topic: string): Promise<string> {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that writes blog posts.' },
          { role: 'user', content: `Write a detailed blog post about: ${topic}` },
        ],
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json',
        },
      },
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('GroqCloud API Error:', error.response?.data || error.message);
    throw new Error('Failed to generate blog content');
  }
}
