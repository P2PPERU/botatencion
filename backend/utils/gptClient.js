// backend/utils/gptClient.js
import dotenv from 'dotenv';
dotenv.config(); // esto es necesario aquí también para entornos ES modules

import OpenAI from 'openai';

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ FALTA LA OPENAI_API_KEY en el archivo .env');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const obtenerRespuestaGPT = async (mensajeUsuario) => {
  const chatCompletion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content:
          'Eres una asistente experta en un club de póker que ayuda a usuarios sobre bonos, rakeback y cómo mejorar su juego.',
      },
      { role: 'user', content: mensajeUsuario },
    ],
  });

  return chatCompletion.choices[0].message.content;
};
