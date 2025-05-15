// backend/modules/sales/productModel.js
import fs from 'fs';
import path from 'path';

const PRODUCTS_PATH = path.resolve('products.json');

export const getAllProducts = () => {
  try {
    return fs.existsSync(PRODUCTS_PATH) 
      ? JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf-8')) 
      : [];
  } catch (error) {
    console.error('Error leyendo productos:', error.message);
    return [];
  }
};

export const getProductById = (id) => {
  const products = getAllProducts();
  return products.find(product => product.id === parseInt(id));
};

export const getProductsByCategory = (category) => {
  const products = getAllProducts();
  return products.filter(product => product.category === category);
};

export const addProduct = async (name, description, price, category, imageUrl) => {
  try {
    const products = getAllProducts();
    const newProduct = { 
      id: Date.now(), 
      name, 
      description, 
      price, 
      category, 
      imageUrl,
      createdAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2));
    return newProduct;
  } catch (error) {
    console.error('Error guardando producto:', error.message);
    throw error;
  }
};

export const updateProduct = async (id, updates) => {
  try {
    const products = getAllProducts();
    const index = products.findIndex(product => product.id === parseInt(id));
    
    if (index === -1) throw new Error('Producto no encontrado');
    
    products[index] = { ...products[index], ...updates };
    fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2));
    return products[index];
  } catch (error) {
    console.error('Error actualizando producto:', error.message);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const products = getAllProducts();
    const filteredProducts = products.filter(product => product.id !== parseInt(id));
    
    if (filteredProducts.length === products.length) throw new Error('Producto no encontrado');
    
    fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(filteredProducts, null, 2));
    return true;
  } catch (error) {
    console.error('Error eliminando producto:', error.message);
    throw error;
  }
};