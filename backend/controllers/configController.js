import fs from 'fs';
import path from 'path';
import botConfig from '../config/botConfig.js';

const CONFIG_PATH = path.resolve('backend/config/botConfig.js');

export const getPersonalities = (req, res) => {
  const { botPersonalities, activePersonality } = botConfig;
  res.json({ personalities: botPersonalities, active: activePersonality });
};

export const setPersonality = (req, res) => {
  const { personality } = req.body;
  
  if (!personality || !botConfig.botPersonalities[personality]) {
    return res.status(400).json({ error: 'Personalidad no válida' });
  }
  
  // Actualizar en memoria
  botConfig.activePersonality = personality;
  
  // También actualizar archivo físico (simplificado)
  try {
    const configContent = fs.readFileSync(CONFIG_PATH, 'utf-8');
    const updatedContent = configContent.replace(
      /activePersonality: ".*"/,
      `activePersonality: "${personality}"`
    );
    fs.writeFileSync(CONFIG_PATH, updatedContent);
    
    res.json({ success: true, active: personality });
  } catch (error) {
    console.error('Error actualizando configuración:', error);
    // Aún así actualiza en memoria aunque falle la escritura
    res.json({ success: true, active: personality, warning: 'Cambio solo en memoria' });
  }
};

export const getBusinessInfo = (req, res) => {
  const { businessOwner } = botConfig;
  res.json({ businessOwner });
};

export const updateBusinessInfo = (req, res) => {
  const { businessInfo } = req.body;
  
  if (!businessInfo) {
    return res.status(400).json({ error: 'Información del negocio no proporcionada' });
  }
  
  // Actualizar en memoria
  botConfig.businessOwner = {
    ...botConfig.businessOwner,
    ...businessInfo
  };
  
  // También podríamos actualizar el archivo físico aquí
  
  res.json({ success: true, businessOwner: botConfig.businessOwner });
};

export const getHumanizationSettings = (req, res) => {
  const { humanization } = botConfig;
  res.json({ humanization });
};

export const updateHumanizationSettings = (req, res) => {
  const { settings } = req.body;
  
  if (!settings) {
    return res.status(400).json({ error: 'Configuración no proporcionada' });
  }
  
  // Actualizar en memoria
  botConfig.humanization = {
    ...botConfig.humanization,
    ...settings
  };
  
  res.json({ success: true, humanization: botConfig.humanization });
};