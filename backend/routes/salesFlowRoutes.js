// backend/routes/salesFlowRoutes.js
import express from 'express';
import { 
  getAllFlows, 
  getFlowById, 
  addFlow, 
  updateFlow, 
  deleteFlow 
} from '../modules/sales/salesFlowModel.js';

const router = express.Router();

// Obtener todos los flujos
router.get('/', (req, res) => {
  try {
    const flows = getAllFlows();
    res.json(flows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Obtener un flujo por ID
router.get('/:id', (req, res) => {
  try {
    const flow = getFlowById(req.params.id);
    if (!flow) {
      return res.status(404).json({ error: 'Flujo no encontrado' });
    }
    res.json(flow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Crear un nuevo flujo
router.post('/', async (req, res) => {
  try {
    const { name, triggerWords, steps, productIds } = req.body;
    const newFlow = await addFlow(name, triggerWords, steps, productIds);
    res.status(201).json(newFlow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Actualizar un flujo
router.put('/:id', async (req, res) => {
  try {
    const updatedFlow = await updateFlow(req.params.id, req.body);
    res.json(updatedFlow);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Eliminar un flujo
router.delete('/:id', async (req, res) => {
  try {
    await deleteFlow(req.params.id);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;