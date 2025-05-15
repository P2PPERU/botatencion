// backend/routes/chatRoutes.js
import express from 'express';
import { processMessage } from '../controllers/chatController.js';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const CONVERSATIONS_PATH = path.resolve('conversaciones.json');

// Ruta principal para procesar mensajes
router.post('/', processMessage);

// Ruta para guardar conversaciones completas
router.post('/save', (req, res) => {
  try {
    const { userId, messages } = req.body;
    
    if (!userId || !messages || !Array.isArray(messages)) {
      return res.status(400).json({ 
        error: 'Se requiere userId y un array de messages para guardar la conversación' 
      });
    }
    
    // Cargar conversaciones guardadas existentes
    let savedConversations = [];
    const SAVED_CONVERSATIONS_PATH = path.resolve('conversaciones_completas.json');
    
    if (fs.existsSync(SAVED_CONVERSATIONS_PATH)) {
      const content = fs.readFileSync(SAVED_CONVERSATIONS_PATH, 'utf-8');
      if (content.trim()) {
        savedConversations = JSON.parse(content);
      }
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
});

export default router;