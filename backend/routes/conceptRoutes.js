// backend/routes/conceptRoutes.js
import express from 'express';
import { getAllConcepts, getConceptById, addConcept, updateConcept, deleteConcept } from '../models/conceptModel.js';

const router = express.Router();

// Obtener todos los conceptos
router.get('/', async (req, res) => {
  try {
    const concepts = await getAllConcepts();
    res.json(concepts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un concepto por ID
router.get('/:id', async (req, res) => {
  try {
    const concept = getConceptById(req.params.id);
    if (!concept) {
      return res.status(404).json({ error: 'Concepto no encontrado' });
    }
    res.json(concept);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear nuevo concepto
router.post('/', async (req, res) => {
  try {
    const { term, definition, category } = req.body;
    
    if (!term || !definition) {
      return res.status(400).json({ error: 'El término y la definición son obligatorios' });
    }
    
    const newConcept = await addConcept(term, definition, category);
    res.status(201).json(newConcept);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar concepto
router.put('/:id', async (req, res) => {
  try {
    const { term, definition, category } = req.body;
    
    if (!term || !definition) {
      return res.status(400).json({ error: 'El término y la definición son obligatorios' });
    }
    
    const updatedConcept = await updateConcept(req.params.id, term, definition, category);
    res.json(updatedConcept);
  } catch (error) {
    if (error.message === 'Concepto no encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

// Eliminar concepto
router.delete('/:id', async (req, res) => {
  try {
    await deleteConcept(req.params.id);
    res.json({ success: true, message: 'Concepto eliminado correctamente' });
  } catch (error) {
    if (error.message === 'Concepto no encontrado') {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

export default router;