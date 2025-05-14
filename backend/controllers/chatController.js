import { obtenerRespuestaGPT } from '../utils/gptClient.js';
import { guardarConversacion } from '../models/messageModel.js';

export const processMessage = async (req, res) => {
  const { userId, message } = req.body;

  if (!userId || !message) {
    return res.status(400).json({ error: 'Se requiere userId y message' });
  }

  try {
    // Pasamos el userId para mantener contexto de conversación
    const respuestaBot = await obtenerRespuestaGPT(userId, message);

    // Guardamos la conversación
    await guardarConversacion(userId, message, respuestaBot);

    res.json({ reply: respuestaBot });
  } catch (error) {
    console.error('Error procesando mensaje:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};