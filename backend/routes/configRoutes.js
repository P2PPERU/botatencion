import express from 'express';
import { 
  getPersonalities, 
  setPersonality,
  getBusinessInfo,
  updateBusinessInfo,
  getHumanizationSettings,
  updateHumanizationSettings
} from '../controllers/configController.js';

const router = express.Router();

// Rutas para personalidades del bot
router.get('/personalities', getPersonalities);
router.post('/personality', setPersonality);

// Rutas para información del negocio
router.get('/business', getBusinessInfo);
router.post('/business', updateBusinessInfo);

// Rutas para configuración de humanización
router.get('/humanization', getHumanizationSettings);
router.post('/humanization', updateHumanizationSettings);

export default router;