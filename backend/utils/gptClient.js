// backend/utils/gptClient.js
import dotenv from 'dotenv';
dotenv.config();

import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';
import { getAllFaqs } from '../models/faqModel.js';
import { getAllConcepts } from '../models/conceptModel.js';
import { getPokerMarketInfo } from './marketData.js';
import botConfig from '../config/botConfig.js';

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ FALTA LA OPENAI_API_KEY en el archivo .env');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CONVERSATIONS_PATH = path.resolve('conversaciones.json');

export const obtenerRespuestaGPT = async (userId, mensajeUsuario) => {
  // Cargar FAQs y conceptos
  const faqs = getAllFaqs();
  const concepts = getAllConcepts();
  
  // Obtener datos de mercado actuales
  const marketData = await getPokerMarketInfo();
  
  // Obtener configuración del bot y personalidad activa
  const { businessOwner, botPersonalities, activePersonality } = botConfig;
  const personality = botPersonalities[activePersonality];
  
  // Cargar historial de conversación
  const conversaciones = fs.existsSync(CONVERSATIONS_PATH) 
    ? JSON.parse(fs.readFileSync(CONVERSATIONS_PATH, 'utf-8')) 
    : [];
  
  // Filtrar últimas 5 mensajes del usuario (para contexto)
  const userHistory = conversaciones
    .filter(conv => conv.userId === userId)
    .slice(-5);
  
  // Formatear FAQs para el prompt
  const faqsContext = faqs.map(faq => 
    `P: ${faq.question}\nR: ${faq.answer}`
  ).join('\n\n');
  
  // Formatear conceptos para el prompt
  const conceptsContext = concepts.map(concept => 
    `TÉRMINO: ${concept.term}\nDEFINICIÓN: ${concept.definition}`
  ).join('\n\n');
  
  // Construir prompt del sistema con personalidad y datos del negocio
  const systemPrompt = `Eres ${personality.name}, una asistente virtual ${personality.tone} del equipo PokerProTrack dirigido por ${businessOwner.name}, ${businessOwner.position}.

IMPORTANTE: Sé extremadamente conciso y directo en tus respuestas. Usa oraciones cortas y ve directo al punto.
Tu personalidad tiene estas características:
- ${personality.quirks.join('\n- ')}
- Eres cálida y amable, siempre dispuesta a ayudar
- Usas un lenguaje natural y conversacional
- A veces usas expresiones humanas como "hmm", "déjame pensar", etc.
- Haces referencias ocasionales a la hora del día ("¡buenos días!", "buenas noches", etc.)
- Muestras entusiasmo utilizando signos de exclamación ocasionalmente
- Haces preguntas de seguimiento para entender mejor las necesidades del usuario
- Recuerdas y refieres a información compartida previamente por el usuario
- Das respuestas breves que van al punto, nunca excesivamente largas

Conocimientos destacados del dueño: ${businessOwner.expertise.join(', ')}.

Consejos personales de ${businessOwner.name} que puedes compartir:
${businessOwner.personalTips.map(tip => `- "${tip}"`).join('\n')}

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

INFORMACIÓN DE MERCADO ACTUAL:
Torneos populares: 
${marketData.tournaments.map(t => `- ${t.name} (${t.platform}): ${t.prize}`).join('\n')}

Juegos en tendencia: ${marketData.trending_games.join(', ')}

Estrategias populares: ${marketData.popular_strategies.join(', ')}

Hoy es ${new Date().toLocaleDateString()} y la hora actual es ${new Date().toLocaleTimeString()}.
        
Responde siempre en español y mantén un tono conversacional, cercano y amigable. Si te preguntan algo que no sabes, ofrece buscar la información y volver con ella más tarde, en lugar de admitir limitaciones.`;

  // Construir historial de mensajes para GPT
  const messageHistory = [
    { role: 'system', content: systemPrompt }
  ];
  
  // Añadir historial de conversación
  userHistory.forEach(entry => {
    messageHistory.push({ role: 'user', content: entry.mensajeUsuario });
    messageHistory.push({ role: 'assistant', content: entry.respuestaBot });
  });
  
  // Añadir mensaje actual
  messageHistory.push({ role: 'user', content: mensajeUsuario });

  const chatCompletion = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: messageHistory,
    temperature: 0.7,
  });

  return chatCompletion.choices[0].message.content;
};