// backend/routes/faqRoutes.js
import express from 'express';
import { getAllFaqs, getFaqById, addFaq, updateFaq, deleteFaq } from '../models/faqModel.js';

const router = express.Router();

// Obtener todas las FAQs
router.get('/', async (req, res) => {
  try {
    const faqs = await getAllFaqs();
    res.json(faqs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener una FAQ por ID
router.get('/:id', async (req, res) => {
  try {
    const faq = getFaqById(req.params.id);
    if (!faq) {
      return res.status(404).json({ error: 'FAQ no encontrada' });
    }
    res.json(faq);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear nueva FAQ
router.post('/', async (req, res) => {
  try {
    const { question, answer, category } = req.body;
    
    if (!question || !answer) {
      return res.status(400).json({ error: 'La pregunta y respuesta son obligatorias' });
    }
    
    const newFaq = await addFaq(question, answer, category);
    res.status(201).json(newFaq);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar FAQ
router.put('/:id', async (req, res) => {
  try {
    const { question, answer, category } = req.body;
    
    if (!question || !answer) {
      return res.status(400).json({ error: 'La pregunta y respuesta son obligatorias' });
    }
    
    const updatedFaq = await updateFaq(req.params.id, question, answer, category);
    res.json(updatedFaq);
  } catch (error) {
    if (error.message === 'FAQ no encontrada') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// Eliminar FAQ
router.delete('/:id', async (req, res) => {
  try {
    await deleteFaq(req.params.id);
    res.json({ success: true, message: 'FAQ eliminada correctamente' });
  } catch (error) {
    if (error.message === 'FAQ no encontrada') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;