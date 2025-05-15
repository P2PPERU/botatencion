// frontend/src/components/ProductSuggestion.jsx
import { useState, useEffect } from 'react';
import {
  Box, Flex, Text, Image, Badge, Button, 
  Grid, GridItem, useDisclosure, Modal, 
  ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalCloseButton, Heading
} from '@chakra-ui/react';

const ProductCard = ({ product, onSelect }) => {
  return (
    <Box 
      borderWidth="1px" 
      borderRadius="lg" 
      overflow="hidden"
      p={3}
      transition="all 0.2s"
      _hover={{ shadow: "md", transform: "translateY(-2px)" }}
      cursor="pointer"
      onClick={() => onSelect(product)}
    >
      {product.imageUrl ? (
        <Image 
          src={product.imageUrl} 
          alt={product.name}
          height="120px"
          width="100%"
          objectFit="cover"
          borderRadius="md"
          mb={2}
        />
      ) : (
        <Box 
          height="120px" 
          width="100%" 
          bg="gray.100" 
          borderRadius="md"
          mb={2}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Text color="gray.400">Sin imagen</Text>
        </Box>
      )}
      
      <Text fontWeight="bold" fontSize="sm" noOfLines={1}>
        {product.name}
      </Text>
      
      <Flex justify="space-between" align="center" mt={1}>
        <Badge colorScheme="blue" fontSize="0.7em">
          {product.category}
        </Badge>
        <Text fontWeight="bold" color="teal.500" fontSize="sm">
          ${parseFloat(product.price).toFixed(2)}
        </Text>
      </Flex>
    </Box>
  );
};

const ProductSuggestion = ({ 
  message, 
  onProductSelect,
  relatedKeywords = [] 
}) => {
  const [products, setProducts] = useState([]);
  const [recommendedProducts, setRecommendedProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0 && message) {
      getRecommendedProducts();
    }
  }, [products, message]);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error obteniendo productos:', error);
    }
  };

  const getRecommendedProducts = async () => {
    try {
      // Llamar al servicio de recomendación
      const response = await fetch('http://localhost:4000/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, relatedKeywords })
      });
      
      const { recommendedProductIds, shouldShowProducts } = await response.json();
      
      if (shouldShowProducts && recommendedProductIds.length > 0) {
        const recommended = products.filter(product => 
          recommendedProductIds.includes(product.id)
        );
        setRecommendedProducts(recommended);
      } else {
        // Si no hay recomendaciones específicas, usar filtro de palabras clave
        const lowercaseMessage = message.toLowerCase();
        const filtered = products.filter(product => {
          return (
            lowercaseMessage.includes(product.name.toLowerCase()) ||
            lowercaseMessage.includes(product.category.toLowerCase()) ||
            relatedKeywords.some(keyword => 
              product.name.toLowerCase().includes(keyword) ||
              product.description.toLowerCase().includes(keyword)
            )
          );
        });
        
        // Si no hay coincidencias, mostrar productos populares o aleatorios
        if (filtered.length > 0) {
          setRecommendedProducts(filtered.slice(0, 3));
        } else if (shouldShowProducts) {
          // Mostrar algunos productos aleatorios (podría mejorarse con productos populares)
          setRecommendedProducts(products.slice(0, 3));
        } else {
          setRecommendedProducts([]);
        }
      }
    } catch (error) {
      console.error('Error obteniendo recomendaciones:', error);
      setRecommendedProducts([]);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    onOpen();
  };

  const handleSendProduct = () => {
    if (selectedProduct && onProductSelect) {
      onProductSelect(selectedProduct);
    }
    onClose();
  };

  // Si no hay productos para mostrar, no rendericemos nada
  if (recommendedProducts.length === 0) {
    return null;
  }

  return (
    <>
      <Box mt={4} mb={2}>
        <Text fontSize="sm" fontWeight="medium" mb={2}>
          Productos recomendados:
        </Text>
        <Grid templateColumns="repeat(3, 1fr)" gap={2}>
          {recommendedProducts.map(product => (
            <GridItem key={product.id}>
              <ProductCard 
                product={product} 
                onSelect={handleProductSelect} 
              />
            </GridItem>
          ))}
        </Grid>
      </Box>
      
      {selectedProduct && (
        <Modal isOpen={isOpen} onClose={onClose} size="md">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Detalles del Producto</ModalHeader>
            <ModalCloseButton />
            <ModalBody pb={6}>
              <Flex direction="column">
                {selectedProduct.imageUrl && (
                  <Image 
                    src={selectedProduct.imageUrl} 
                    alt={selectedProduct.name}
                    height="200px"
                    objectFit="cover"
                    borderRadius="md"
                    mb={4}
                  />
                )}
                
                <Heading size="md" mb={2}>{selectedProduct.name}</Heading>
                
                <Flex justify="space-between" align="center" mb={3}>
                  <Badge colorScheme="blue">{selectedProduct.category}</Badge>
                  <Text fontWeight="bold" color="teal.500" fontSize="lg">
                    ${parseFloat(selectedProduct.price).toFixed(2)}
                  </Text>
                </Flex>
                
                <Text mb={4}>{selectedProduct.description}</Text>
                
                <Button 
                  colorScheme="teal" 
                  onClick={handleSendProduct}
                  w="full"
                  mt={2}
                >
                  Enviar al Chat
                </Button>
              </Flex>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </>
  );
};

export default ProductSuggestion;