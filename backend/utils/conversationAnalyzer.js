// backend/utils/conversationAnalyzer.js
import { detectPurchaseIntent, determineUserStage } from '../modules/sales/intentDetector.js';
import fs from 'fs';
import path from 'path';

const ANALYSIS_PATH = path.resolve('conversationAnalysis.json');

// Estructura para almacenar análisis de conversaciones
const initializeAnalysisData = () => {
  if (!fs.existsSync(ANALYSIS_PATH)) {
    const initialData = {
      totalConversations: 0,
      conversationsWithSalesIntent: 0,
      conversionRate: 0,
      averageMessagesUntilPurchaseIntent: 0,
      commonKeywordsBeforePurchase: {},
      salesStageTransitions: {
        awareness: 0,
        interest: 0,
        consideration: 0,
        intent: 0,
        evaluation: 0,
        purchase: 0
      },
      productsMentioned: {}
    };
    fs.writeFileSync(ANALYSIS_PATH, JSON.stringify(initialData, null, 2));
    return initialData;
  }
  
  return JSON.parse(fs.readFileSync(ANALYSIS_PATH, 'utf-8'));
};

export const analyzeConversation = (conversation, products) => {
  // Asegurar que tenemos datos de análisis
  const analysisData = initializeAnalysisData();
  
  // Incrementar total de conversaciones
  analysisData.totalConversations += 1;
  
  // Detectar si hay intención de compra en la conversación
  const messagesWithIntent = conversation.filter(msg => 
    msg.sender === 'user' && detectPurchaseIntent(msg.text).hasPurchaseIntent
  );
  
  const hasSalesIntent = messagesWithIntent.length > 0;
  
  if (hasSalesIntent) {
    // Actualizar conversaciones con intención de compra
    analysisData.conversationsWithSalesIntent += 1;
    
    // Calcular tasa de conversión
    analysisData.conversionRate = 
      (analysisData.conversationsWithSalesIntent / analysisData.totalConversations) * 100;
    
    // Encontrar el primer mensaje con intención de compra
    const indexOfFirstIntentMessage = conversation.findIndex(msg => 
      msg.sender === 'user' && detectPurchaseIntent(msg.text).hasPurchaseIntent
    );
    
    // Contar mensajes hasta ese punto
    const userMessagesUntilIntent = conversation
      .slice(0, indexOfFirstIntentMessage + 1)
      .filter(msg => msg.sender === 'user')
      .length;
    
    // Actualizar promedio
    analysisData.averageMessagesUntilPurchaseIntent = 
      ((analysisData.averageMessagesUntilPurchaseIntent * 
        (analysisData.conversationsWithSalesIntent - 1)) + 
        userMessagesUntilIntent) / analysisData.conversationsWithSalesIntent;
    
    // Analizar palabras clave
    messagesWithIntent.forEach(msg => {
      const { detectedKeywords } = detectPurchaseIntent(msg.text);
      detectedKeywords.forEach(keyword => {
        analysisData.commonKeywordsBeforePurchase[keyword] = 
          (analysisData.commonKeywordsBeforePurchase[keyword] || 0) + 1;
      });
    });
    
    // Detectar productos mencionados
    products.forEach(product => {
      const productName = product.name.toLowerCase();
      const mentionCount = conversation.filter(msg => 
        msg.text.toLowerCase().includes(productName)
      ).length;
      
      if (mentionCount > 0) {
        analysisData.productsMentioned[product.id] = 
          (analysisData.productsMentioned[product.id] || 0) + mentionCount;
      }
    });
  }
  
  // Determinar etapa del usuario
  const stage = determineUserStage(conversation);
  analysisData.salesStageTransitions[stage] += 1;
  
  // Guardar análisis actualizado
  fs.writeFileSync(ANALYSIS_PATH, JSON.stringify(analysisData, null, 2));
  
  return {
    hasSalesIntent,
    stage,
    analysisData
  };
};

export const getSalesAnalytics = () => {
  if (!fs.existsSync(ANALYSIS_PATH)) {
    return initializeAnalysisData();
  }
  
  return JSON.parse(fs.readFileSync(ANALYSIS_PATH, 'utf-8'));
};

export const getProductRecommendations = (userId, message) => {
  // Obtener análisis
  const analysisData = getSalesAnalytics();
  
  // Determinar productos populares basados en menciones
  const popularProducts = Object.entries(analysisData.productsMentioned)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(entry => parseInt(entry[0]));
  
  // Detectar intención y palabras clave
  const { hasPurchaseIntent, detectedKeywords } = detectPurchaseIntent(message);
  
  return {
    recommendedProductIds: popularProducts,
    shouldShowProducts: hasPurchaseIntent,
    relevantKeywords: detectedKeywords || []
  };
};