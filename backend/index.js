// backend/index.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Ruta principal del bot
app.use('/api/chat', chatRoutes);

// Puerto y arranque
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
