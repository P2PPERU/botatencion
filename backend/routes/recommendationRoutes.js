// backend/routes/recommendationRoutes.js
import express from 'express';
import { getAllProducts } from '../modules/sales/productModel.js';

const router = express.Router();

// Endpoint para recomendaciones de productos
router.post('/', async (req, res) => {
  try {
    const { message, relatedKeywords = [] } = req.body;
    const products = getAllProducts();
    
    // Lógica simple de recomendación basada en palabras clave
    let recommendedProductIds = [];
    const messageLower = message.toLowerCase();
    
    // Buscar coincidencias en el mensaje
    products.forEach(product => {
      // Verificar si el nombre o la descripción del producto aparece en el mensaje
      if (messageLower.includes(product.name.toLowerCase()) || 
          messageLower.includes(product.category.toLowerCase())) {
        recommendedProductIds.push(product.id);
      }
      
      // Verificar coincidencias con palabras clave relacionadas
      if (relatedKeywords.some(keyword => 
        product.name.toLowerCase().includes(keyword) || 
        product.description.toLowerCase().includes(keyword))) {
        recommendedProductIds.push(product.id);
      }
    });
    
    // Eliminar duplicados
    recommendedProductIds = [...new Set(recommendedProductIds)];
    
    // Limitar a 3 productos
    recommendedProductIds = recommendedProductIds.slice(0, 3);
    
    res.json({
      recommendedProductIds,
      shouldShowProducts: recommendedProductIds.length > 0 || relatedKeywords.length > 0
    });
  } catch (error) {
    console.error('Error generando recomendaciones:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

export default router;