// backend/modules/sales/salesFlowModel.js
import fs from 'fs';
import path from 'path';

const SALES_FLOWS_PATH = path.resolve('salesFlows.json');

// Estructura de un flujo de ventas:
// {
//   id: number,
//   name: string,
//   triggerWords: string[],
//   steps: [
//     {
//       id: number,
//       message: string,
//       options: [
//         {
//           text: string,
//           nextStepId: number,
//           action: string (optional)
//         }
//       ]
//     }
//   ],
//   productIds: number[]
// }

export const getAllFlows = () => {
  try {
    return fs.existsSync(SALES_FLOWS_PATH) 
      ? JSON.parse(fs.readFileSync(SALES_FLOWS_PATH, 'utf-8')) 
      : [];
  } catch (error) {
    console.error('Error leyendo flujos de venta:', error.message);
    return [];
  }
};

export const getFlowById = (id) => {
  const flows = getAllFlows();
  return flows.find(flow => flow.id === parseInt(id));
};

export const findMatchingFlow = (userMessage) => {
  const flows = getAllFlows();
  const messageLower = userMessage.toLowerCase();
  
  // Buscar flujo con palabras clave que coincidan con el mensaje
  return flows.find(flow => 
    flow.triggerWords.some(word => 
      messageLower.includes(word.toLowerCase())
    )
  );
};

export const getNextStep = (flowId, currentStepId, selectedOption) => {
  const flow = getFlowById(flowId);
  if (!flow) return null;
  
  // Si no hay step actual, devolver el primer paso
  if (!currentStepId) {
    return flow.steps[0];
  }
  
  // Buscar el siguiente paso basado en la opción seleccionada
  const currentStep = flow.steps.find(step => step.id === currentStepId);
  if (!currentStep) return null;
  
  const selectedOptionObj = currentStep.options.find(
    option => option.text === selectedOption
  );
  
  if (!selectedOptionObj || !selectedOptionObj.nextStepId) return null;
  
  return flow.steps.find(step => step.id === selectedOptionObj.nextStepId);
};

export const addFlow = async (name, triggerWords, steps, productIds) => {
  try {
    const flows = getAllFlows();
    const newFlow = { 
      id: Date.now(), 
      name, 
      triggerWords, 
      steps, 
      productIds,
      createdAt: new Date().toISOString()
    };
    
    flows.push(newFlow);
    fs.writeFileSync(SALES_FLOWS_PATH, JSON.stringify(flows, null, 2));
    return newFlow;
  } catch (error) {
    console.error('Error guardando flujo de venta:', error.message);
    throw error;
  }
};

export const updateFlow = async (id, updates) => {
  try {
    const flows = getAllFlows();
    const index = flows.findIndex(flow => flow.id === parseInt(id));
    
    if (index === -1) throw new Error('Flujo no encontrado');
    
    flows[index] = { 
      ...flows[index], 
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    fs.writeFileSync(SALES_FLOWS_PATH, JSON.stringify(flows, null, 2));
    return flows[index];
  } catch (error) {
    console.error('Error actualizando flujo:', error.message);
    throw error;
  }
};

export const deleteFlow = async (id) => {
  try {
    const flows = getAllFlows();
    const filteredFlows = flows.filter(flow => flow.id !== parseInt(id));
    
    if (filteredFlows.length === flows.length) throw new Error('Flujo no encontrado');
    
    fs.writeFileSync(SALES_FLOWS_PATH, JSON.stringify(filteredFlows, null, 2));
    return true;
  } catch (error) {
    console.error('Error eliminando flujo:', error.message);
    throw error;
  }
};