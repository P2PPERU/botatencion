// frontend/src/utils/salesAnalytics.js
const BASE_URL = 'http://localhost:4000/api';

export const getSalesAnalytics = async (timeRange = 'all') => {
  try {
    const response = await fetch(`${BASE_URL}/analytics/sales?timeRange=${timeRange}`);
    
    if (!response.ok) {
      throw new Error('Error obteniendo análisis de ventas');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en salesAnalytics:', error);
    // Devolver estructura de datos vacía para evitar errores
    return {
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
  }
};

export const analyzeSalesIntent = async (message) => {
  try {
    const response = await fetch(`${BASE_URL}/analytics/intent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    
    if (!response.ok) {
      throw new Error('Error analizando intención de venta');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en analyzeSalesIntent:', error);
    return {
      hasPurchaseIntent: false,
      confidence: 'low',
      detectedKeywords: []
    };
  }
};

export const trackConversion = async (conversationId, productId, stage) => {
  try {
    const response = await fetch(`${BASE_URL}/analytics/track`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        conversationId,
        productId,
        stage 
      })
    });
    
    if (!response.ok) {
      throw new Error('Error registrando conversión');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en trackConversion:', error);
    return { success: false };
  }
};

export const getProductRecommendations = async (message, userId = null) => {
  try {
    const response = await fetch(`${BASE_URL}/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        message,
        userId 
      })
    });
    
    if (!response.ok) {
      throw new Error('Error obteniendo recomendaciones');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error en getProductRecommendations:', error);
    return {
      recommendedProductIds: [],
      shouldShowProducts: false,
      relevantKeywords: []
    };
  }
};

export const getStageDescription = (stage) => {
  const descriptions = {
    awareness: 'El usuario está conociendo los productos',
    interest: 'El usuario muestra interés inicial',
    consideration: 'El usuario está considerando opciones',
    intent: 'El usuario tiene intención de compra',
    evaluation: 'El usuario está evaluando alternativas',
    purchase: 'El usuario está listo para comprar'
  };
  
  return descriptions[stage] || 'Etapa desconocida';
};