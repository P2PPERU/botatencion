// backend/controllers/chatController.js
import { obtenerRespuestaGPT } from '../utils/gptClient.js';
import fs from 'fs';
import path from 'path';

const CONVERSATIONS_PATH = path.resolve('conversaciones.json');
const SAVED_CONVERSATIONS_PATH = path.resolve('conversaciones_completas.json');

// Función para asegurar que un directorio existe
const ensureDirectoryExists = (filePath) => {
  const dirname = path.dirname(filePath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
};

export const processMessage = async (req, res) => {
  try {
    const { userId, message, flowData } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({ 
        reply: 'Se requiere userId y message para procesar la solicitud.',
        intentAnalysis: { hasPurchaseIntent: false, confidence: 'low' }
      });
    }
    
    // Obtener respuesta de GPT con datos de flujo si existen
    const response = await obtenerRespuestaGPT(userId, message, flowData);
    
    // Si llegamos aquí, tenemos una respuesta válida
    // Guardar en historial
    try {
      // Asegurar que el string de respuesta es válido para guardar
      const replyText = typeof response === 'object' && response.reply 
        ? response.reply 
        : typeof response === 'string' 
          ? response 
          : 'Sin respuesta';
      
      // Cargar conversaciones existentes
      let conversaciones = [];
      if (fs.existsSync(CONVERSATIONS_PATH)) {
        const fileContent = fs.readFileSync(CONVERSATIONS_PATH, 'utf-8');
        if (fileContent.trim()) {
          conversaciones = JSON.parse(fileContent);
        }
      } else {
        // Crear directorio si no existe
        ensureDirectoryExists(CONVERSATIONS_PATH);
      }
      
      // Añadir nueva conversación
      conversaciones.push({
        userId,
        timestamp: new Date().toISOString(),
        mensajeUsuario: message,
        respuestaBot: replyText,
        // Guardar estado del flujo si existe
        flowData: response.intentAnalysis && response.intentAnalysis.flowData 
          ? response.intentAnalysis.flowData 
          : null
      });
      
      // Guardar conversaciones
      fs.writeFileSync(CONVERSATIONS_PATH, JSON.stringify(conversaciones, null, 2));
    } catch (error) {
      console.error('Error guardando conversación:', error);
      // Continuamos aunque falle el guardado
    }
    
    // Enviar respuesta al frontend
    return res.json(response);
  } catch (error) {
    console.error('Error procesando mensaje:', error);
    return res.status(500).json({ 
      reply: 'Lo siento, estoy experimentando problemas técnicos. Por favor, inténtalo de nuevo más tarde.',
      intentAnalysis: { hasPurchaseIntent: false, confidence: 'low' }
    });
  }
};

// Guardar conversación completa
export const saveConversation = async (req, res) => {
  try {
    const { userId, messages } = req.body;
    
    if (!userId || !messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        error: 'Se requiere userId y un array de messages para guardar la conversación' 
      });
    }
    
    // Cargar conversaciones guardadas existentes
    let savedConversations = [];
    if (fs.existsSync(SAVED_CONVERSATIONS_PATH)) {
      const content = fs.readFileSync(SAVED_CONVERSATIONS_PATH, 'utf-8');
      if (content.trim()) {
        savedConversations = JSON.parse(content);
      }
    } else {
      ensureDirectoryExists(SAVED_CONVERSATIONS_PATH);
    }
    
    // Crear nueva conversación guardada
    const newSavedConversation = {
      id: Date.now(),
      userId,
      timestamp: new Date().toISOString(),
      messages,
      metadata: {
        messageCount: messages.length,
        userMessageCount: messages.filter(m => m.sender === 'user').length,
        botMessageCount: messages.filter(m => m.sender === 'bot').length
      }
    };
    
    // Añadir a la lista
    savedConversations.push(newSavedConversation);
    
    // Guardar conversaciones
    fs.writeFileSync(SAVED_CONVERSATIONS_PATH, JSON.stringify(savedConversations, null, 2));
    
    res.json({ 
      success: true, 
      message: 'Conversación guardada correctamente',
      conversationId: newSavedConversation.id
    });
  } catch (error) {
    console.error('Error guardando conversación completa:', error);
    res.status(500).json({ error: 'Error al guardar la conversación' });
  }
};