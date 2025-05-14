import fs from 'fs';
import path from 'path';

const DB_PATH = path.resolve('conversaciones.json');

export const guardarConversacion = async (userId, mensajeUsuario, respuestaBot) => {
  try {
    const data = fs.existsSync(DB_PATH)
      ? JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'))
      : [];

    const nuevaEntrada = {
      userId,
      mensajeUsuario,
      respuestaBot,
      timestamp: new Date().toISOString(),
    };

    data.push(nuevaEntrada);
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error guardando conversación:', error.message);
  }
};
