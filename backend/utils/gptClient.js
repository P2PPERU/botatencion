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
import { getAllProducts } from '../modules/sales/productModel.js';
import { detectPurchaseIntent, extractProductCategory } from '../modules/sales/intentDetector.js';
import { findMatchingFlow, getNextStep } from '../modules/sales/salesFlowModel.js';

if (!process.env.OPENAI_API_KEY) {
  console.error('❌ FALTA LA OPENAI_API_KEY en el archivo .env');
  process.exit(1);
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CONVERSATIONS_PATH = path.resolve('conversaciones.json');

// Función auxiliar para asegurar que los valores sean siempre strings
const ensureString = (value) => {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  return JSON.stringify(value);
};

export const obtenerRespuestaGPT = async (userId, mensajeUsuario, flowData = null) => {
  // Asegurar que el mensaje del usuario sea un string
  const userMessage = ensureString(mensajeUsuario);
  
  // Si hay datos de flujo activo y una opción seleccionada, procesar flujo
  if (flowData && flowData.active && flowData.selectedOption) {
    const nextStep = getNextStep(flowData.flowId, flowData.currentStepId, flowData.selectedOption);
    if (nextStep) {
      return {
        reply: nextStep.message,
        intentAnalysis: {
          hasPurchaseIntent: true,
          confidence: 'high',
          flowData: {
            active: true,
            flowId: flowData.flowId,
            currentStepId: nextStep.id,
            options: nextStep.options || []
          }
        }
      };
    }
  }
  
  // Cargar FAQs y conceptos
  const faqs = getAllFaqs() || [];
  const concepts = getAllConcepts() || [];
  
  // Obtener datos de mercado actuales
  const marketData = await getPokerMarketInfo() || { tournaments: [], trending_games: [], popular_strategies: [] };
  
  // Cargar productos
  const products = getAllProducts() || [];
  
  // Detectar intención de compra
  const intentAnalysis = detectPurchaseIntent(userMessage);
  
  // Obtener configuración del bot y personalidad activa
  const { businessOwner, botPersonalities, activePersonality } = botConfig;
  const personality = botPersonalities[activePersonality] || botPersonalities.default;
  
  // Cargar historial de conversación
  let conversaciones = [];
  try {
    if (fs.existsSync(CONVERSATIONS_PATH)) {
      conversaciones = JSON.parse(fs.readFileSync(CONVERSATIONS_PATH, 'utf-8'));
    }
  } catch (error) {
    console.error('Error leyendo conversaciones:', error);
  }
  
  // Filtrar últimas 5 mensajes del usuario (para contexto)
  const userHistory = conversaciones
    .filter(conv => conv.userId === userId)
    .slice(-5);
  
  // Formatear FAQs para el prompt
  const faqsContext = faqs.map(faq => 
    `P: ${ensureString(faq.question)}\nR: ${ensureString(faq.answer)}`
  ).join('\n\n');
  
  // Formatear conceptos para el prompt
  const conceptsContext = concepts.map(concept => 
    `TÉRMINO: ${ensureString(concept.term)}\nDEFINICIÓN: ${ensureString(concept.definition)}`
  ).join('\n\n');
  
  // Formatear productos para el prompt
  const productsContext = products.map(product => 
    `PRODUCTO: ${ensureString(product.name)}\nCATEGORÍA: ${ensureString(product.category)}\nPRECIO: $${ensureString(product.price)}\nDESCRIPCIÓN: ${ensureString(product.description)}`
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
6. Recomendar productos que puedan ayudarles según sus necesidades

PREGUNTAS FRECUENTES:
${faqsContext}

GLOSARIO DE TÉRMINOS:
${conceptsContext}

CATÁLOGO DE PRODUCTOS:
${productsContext}

INFORMACIÓN DE MERCADO ACTUAL:
Torneos populares: 
${marketData.tournaments.map(t => `- ${ensureString(t.name)} (${ensureString(t.platform)}): ${ensureString(t.prize)}`).join('\n')}

Juegos en tendencia: ${ensureString(marketData.trending_games.join(', '))}

Estrategias populares: ${ensureString(marketData.popular_strategies.join(', '))}

Hoy es ${new Date().toLocaleDateString()} y la hora actual es ${new Date().toLocaleTimeString()}.
        
Responde siempre en español y mantén un tono conversacional, cercano y amigable. Si te preguntan algo que no sabes, ofrece buscar la información y volver con ella más tarde, en lugar de admitir limitaciones.`;

  // Construir historial de mensajes para GPT
  const messageHistory = [
    { role: 'system', content: systemPrompt }
  ];
  
  // Añadir historial de conversación asegurando que todos sean strings
  userHistory.forEach(entry => {
    const userContent = ensureString(entry.mensajeUsuario);
    const assistantContent = ensureString(entry.respuestaBot);
    
    messageHistory.push({ role: 'user', content: userContent });
    messageHistory.push({ role: 'assistant', content: assistantContent });
  });
  
  // Añadir mensaje actual
  messageHistory.push({ role: 'user', content: userMessage });

  try {
    // Verificar si hay un flujo que coincida con el mensaje antes de llamar a GPT
    const matchingFlow = findMatchingFlow(userMessage);
    if (matchingFlow) {
      // Obtener el primer paso del flujo
      const firstStep = matchingFlow.steps[0];
      if (firstStep) {
        return {
          reply: firstStep.message,
          intentAnalysis: {
            ...intentAnalysis,
            categories: extractProductCategory(userMessage, products.map(p => p.category)),
            flowData: {
              active: true,
              flowId: matchingFlow.id,
              currentStepId: firstStep.id,
              options: firstStep.options || []
            }
          }
        };
      }
    }
    
    // Si no hay flujo activo, generar respuesta con GPT
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: messageHistory,
      temperature: 0.7,
    });

    const reply = chatCompletion.choices[0].message.content;
    
    // Categorías de productos mencionadas
    const categories = extractProductCategory(userMessage, products.map(p => p.category));
    
    // Retornar respuesta junto con datos de análisis de intención
    return {
      reply,
      intentAnalysis: {
        ...intentAnalysis,
        categories
      }
    };
  } catch (error) {
    console.error('Error al llamar a OpenAI:', error);
    // Devolver un mensaje de error amigable
    return {
      reply: '¡Ups! Parece que estoy teniendo problemas para procesar tu solicitud. ¿Podrías intentarlo de nuevo en unos momentos?',
      intentAnalysis: {
        hasPurchaseIntent: false,
        confidence: 'low',
        categories: []
      }
    };
  }
};