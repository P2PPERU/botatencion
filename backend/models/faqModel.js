// backend/models/faqModel.js
import fs from 'fs';
import path from 'path';

const FAQ_PATH = path.resolve('faqs.json');

export const getAllFaqs = () => {
  try {
    return fs.existsSync(FAQ_PATH) 
      ? JSON.parse(fs.readFileSync(FAQ_PATH, 'utf-8')) 
      : [];
  } catch (error) {
    console.error('Error leyendo FAQs:', error.message);
    return [];
  }
};

export const getFaqById = (id) => {
  const faqs = getAllFaqs();
  return faqs.find(faq => faq.id === parseInt(id));
};

export const addFaq = async (question, answer, category = 'general') => {
  try {
    const faqs = getAllFaqs();
    const newFaq = { id: Date.now(), question, answer, category };
    faqs.push(newFaq);
    fs.writeFileSync(FAQ_PATH, JSON.stringify(faqs, null, 2));
    return newFaq;
  } catch (error) {
    console.error('Error guardando FAQ:', error.message);
    throw error;
  }
};

export const updateFaq = async (id, question, answer, category = 'general') => {
  try {
    const faqs = getAllFaqs();
    const index = faqs.findIndex(faq => faq.id === parseInt(id));
    
    if (index === -1) throw new Error('FAQ no encontrada');
    
    faqs[index] = { ...faqs[index], question, answer, category };
    fs.writeFileSync(FAQ_PATH, JSON.stringify(faqs, null, 2));
    return faqs[index];
  } catch (error) {
    console.error('Error actualizando FAQ:', error.message);
    throw error;
  }
};

export const deleteFaq = async (id) => {
  try {
    const faqs = getAllFaqs();
    const filteredFaqs = faqs.filter(faq => faq.id !== parseInt(id));
    
    if (filteredFaqs.length === faqs.length) throw new Error('FAQ no encontrada');
    
    fs.writeFileSync(FAQ_PATH, JSON.stringify(filteredFaqs, null, 2));
    return true;
  } catch (error) {
    console.error('Error eliminando FAQ:', error.message);
    throw error;
  }
};