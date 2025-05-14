// backend/models/conceptModel.js
import fs from 'fs';
import path from 'path';

const CONCEPTS_PATH = path.resolve('concepts.json');

export const getAllConcepts = () => {
  try {
    return fs.existsSync(CONCEPTS_PATH) 
      ? JSON.parse(fs.readFileSync(CONCEPTS_PATH, 'utf-8')) 
      : [];
  } catch (error) {
    console.error('Error leyendo conceptos:', error.message);
    return [];
  }
};

export const getConceptById = (id) => {
  const concepts = getAllConcepts();
  return concepts.find(concept => concept.id === parseInt(id));
};

export const addConcept = async (term, definition, category = 'general') => {
  try {
    const concepts = getAllConcepts();
    const newConcept = { id: Date.now(), term, definition, category };
    concepts.push(newConcept);
    fs.writeFileSync(CONCEPTS_PATH, JSON.stringify(concepts, null, 2));
    return newConcept;
  } catch (error) {
    console.error('Error guardando concepto:', error.message);
    throw error;
  }
};

export const updateConcept = async (id, term, definition, category = 'general') => {
  try {
    const concepts = getAllConcepts();
    const index = concepts.findIndex(concept => concept.id === parseInt(id));
    
    if (index === -1) throw new Error('Concepto no encontrado');
    
    concepts[index] = { ...concepts[index], term, definition, category };
    fs.writeFileSync(CONCEPTS_PATH, JSON.stringify(concepts, null, 2));
    return concepts[index];
  } catch (error) {
    console.error('Error actualizando concepto:', error.message);
    throw error;
  }
};

export const deleteConcept = async (id) => {
  try {
    const concepts = getAllConcepts();
    const filteredConcepts = concepts.filter(concept => concept.id !== parseInt(id));
    
    if (filteredConcepts.length === concepts.length) throw new Error('Concepto no encontrado');
    
    fs.writeFileSync(CONCEPTS_PATH, JSON.stringify(filteredConcepts, null, 2));
    return true;
  } catch (error) {
    console.error('Error eliminando concepto:', error.message);
    throw error;
  }
};