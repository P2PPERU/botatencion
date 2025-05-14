import { obtenerRespuestaGPT } from '../utils/gptClient.js';
import { guardarConversacion } from '../models/messageModel.js';

export const processMessage = async (req, res) => {
  const { userId, message } = req.body;

  try {
    const respuestaBot = await obtenerRespuestaGPT(message);

    await guardarConversacion(userId, message, respuestaBot);

    res.json({ reply: respuestaBot });
  } catch (error) {
    console.error('Error procesando mensaje:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

