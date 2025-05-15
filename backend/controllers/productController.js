// backend/controllers/productController.js
import { 
    getAllProducts, 
    getProductById, 
    getProductsByCategory,
    addProduct, 
    updateProduct, 
    deleteProduct 
  } from '../modules/sales/productModel.js';
  
  export const getProducts = (req, res) => {
    try {
      const { category } = req.query;
      
      let products;
      if (category) {
        products = getProductsByCategory(category);
      } else {
        products = getAllProducts();
      }
      
      res.json(products);
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
  
  export const getProduct = (req, res) => {
    try {
      const { id } = req.params;
      const product = getProductById(parseInt(id));
      
      if (!product) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      
      res.json(product);
    } catch (error) {
      console.error('Error obteniendo producto:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
  
  export const createProduct = async (req, res) => {
    try {
      const { name, description, price, category, imageUrl } = req.body;
      
      if (!name || !price || !category) {
        return res.status(400).json({ 
          error: 'Nombre, precio y categoría son obligatorios' 
        });
      }
      
      const newProduct = await addProduct(
        name, 
        description || '', 
        parseFloat(price), 
        category,
        imageUrl || ''
      );
      
      res.status(201).json(newProduct);
    } catch (error) {
      console.error('Error creando producto:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
  
  export const updateProductById = async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      // Convertir price a número si está presente
      if (updates.price) {
        updates.price = parseFloat(updates.price);
      }
      
      const updatedProduct = await updateProduct(parseInt(id), updates);
      res.json(updatedProduct);
    } catch (error) {
      if (error.message === 'Producto no encontrado') {
        return res.status(404).json({ error: error.message });
      }
      console.error('Error actualizando producto:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };
  
  export const deleteProductById = async (req, res) => {
    try {
      const { id } = req.params;
      await deleteProduct(parseInt(id));
      res.json({ success: true, message: 'Producto eliminado correctamente' });
    } catch (error) {
      if (error.message === 'Producto no encontrado') {
        return res.status(404).json({ error: error.message });
      }
      console.error('Error eliminando producto:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  };