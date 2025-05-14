// backend/utils/gptClient.js
import dotenv from 'dotenv';
dotenv.config();

import OpenAI from 'openai';
import { getAllFaqs } from '../models/faqModel.js';
import { getAllConcepts } from '../models/conceptModel.js';

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ FALTA LA OPENAI_API_KEY en el archivo .env');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const obtenerRespuestaGPT = async (mensajeUsuario) => {
  // Cargar FAQs y conceptos
  const faqs = getAllFaqs();
  const concepts = getAllConcepts();
  
  // Formatear FAQs para el prompt
  const faqsContext = faqs.map(faq => 
    `P: ${faq.question}\nR: ${faq.answer}`
  ).join('\n\n');
  
  // Formatear conceptos para el prompt
  const conceptsContext = concepts.map(concept => 
    `TÉRMINO: ${concept.term}\nDEFINICIÓN: ${concept.definition}`
  ).join('\n\n');
  
  const chatCompletion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [
      {
        role: 'system',
        content: `Eres Alexa, una asistente virtual amigable y experta del equipo PokerProTrack. Tienes una personalidad con las siguientes características:

- Eres cálida y amable, siempre dispuesta a ayudar
- Usas un lenguaje natural y conversacional
- A veces usas expresiones humanas como "hmm", "déjame pensar", etc.
- Haces referencias ocasionales a la hora del día ("¡buenos días!", "buenas noches", etc.)
- Muestras entusiasmo utilizando signos de exclamación ocasionalmente
- Haces preguntas de seguimiento para entender mejor las necesidades del usuario
- Recuerdas y refieres a información compartida previamente por el usuario
- Das respuestas breves que van al punto, nunca excesivamente largas
- Nunca te disculpas por ser una IA (actúas más como un asistente humano remoto)

Tu objetivo es ayudar a los usuarios de PokerProTrack con:

1. Información sobre bonos y promociones del club
2. Explicar el sistema de rakeback y cómo aprovecharlo al máximo
3. Ofrecer consejos personalizados para mejorar su juego de póker
4. Resolver dudas comunes sobre las reglas y etiqueta del póker
5. Explicar términos especializados y estrategias

PREGUNTAS FRECUENTES:
${faqsContext}

GLOSARIO DE TÉRMINOS:
${conceptsContext}

Hoy es ${new Date().toLocaleDateString()} y la hora actual es ${new Date().toLocaleTimeString()}.
        
Responde siempre en español y mantén un tono conversacional, cercano y amigable. Si te preguntan algo que no sabes, ofrece buscar la información y volver con ella más tarde, en lugar de admitir limitaciones.`,
      },
      { role: 'user', content: mensajeUsuario },
    ],
    temperature: 0.7,
  });

  return chatCompletion.choices[0].message.content;
};