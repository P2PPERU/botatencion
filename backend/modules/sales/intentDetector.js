// backend/modules/sales/intentDetector.js
// Detecta intención de compra en mensajes del usuario

const PURCHASE_INTENT_KEYWORDS = [
    // Preguntas sobre precios
    'cuánto cuesta', 'precio', 'cuanto vale', 'costo', 'tarifa',
    
    // Interés de compra
    'quiero comprar', 'me interesa', 'dónde puedo conseguir', 
    'cómo adquiero', 'cómo compro', 'quiero adquirir',
    
    // Comparación de productos
    'diferencia entre', 'mejor que', 'comparar', 'ventajas',
    
    // Disponibilidad
    'tienen disponible', 'hay en stock', 'disponibilidad',
    
    // Información específica
    'características', 'especificaciones', 'detalles',
    
    // Modalidades de pago
    'formas de pago', 'puedo pagar con', 'aceptan', 'tarjeta'
  ];
  
  const PRODUCT_INQUIRY_PATTERNS = [
    /(?:qué|cuales|que) (?:productos|servicios|planes) (?:tienen|ofrecen|hay)/i,
    /(?:me puede|puedes|podrías) (?:mostrar|enseñar|decir) (?:los|las|sus) (?:productos|servicios|opciones)/i
  ];
  
  export const detectPurchaseIntent = (message) => {
    const messageLower = message.toLowerCase();
    
    // Revisar palabras clave
    const containsKeywords = PURCHASE_INTENT_KEYWORDS.some(keyword => 
      messageLower.includes(keyword.toLowerCase())
    );
    
    // Revisar patrones de consulta de productos
    const matchesPattern = PRODUCT_INQUIRY_PATTERNS.some(pattern => 
      pattern.test(messageLower)
    );
    
    // Si contiene palabras clave o coincide con patrones
    if (containsKeywords || matchesPattern) {
      return {
        hasPurchaseIntent: true,
        confidence: containsKeywords && matchesPattern ? 'high' : 'medium',
        detectedKeywords: PURCHASE_INTENT_KEYWORDS.filter(keyword => 
          messageLower.includes(keyword.toLowerCase())
        )
      };
    }
    
    return {
      hasPurchaseIntent: false,
      confidence: 'low'
    };
  };
  
  export const extractProductCategory = (message, availableCategories) => {
    const messageLower = message.toLowerCase();
    
    // Buscar categorías mencionadas en el mensaje
    return availableCategories.filter(category => 
      messageLower.includes(category.toLowerCase())
    );
  };
  
  export const determineUserStage = (conversation) => {
    // Determina en qué etapa del proceso de compra está el usuario
    // Etapas: awareness, interest, consideration, intent, evaluation, purchase
    
    // Contar mensajes con intención de compra
    const purchaseIntentMessages = conversation.filter(msg => 
      msg.sender === 'user' && detectPurchaseIntent(msg.text).hasPurchaseIntent
    );
    
    if (purchaseIntentMessages.length === 0) {
      return 'awareness';
    } else if (purchaseIntentMessages.length === 1) {
      return 'interest';
    } else if (purchaseIntentMessages.length === 2) {
      return 'consideration';
    } else if (purchaseIntentMessages.length >= 3) {
      // Buscar preguntas específicas sobre pago o proceso de compra
      const hasPaymentQuestions = conversation.some(msg => 
        msg.sender === 'user' && 
        (msg.text.toLowerCase().includes('pago') || 
         msg.text.toLowerCase().includes('compra'))
      );
      
      return hasPaymentQuestions ? 'intent' : 'evaluation';
    }
    
    return 'awareness';
  };