// frontend/src/components/ProductCatalog.jsx
import { useState, useEffect } from 'react';
import {
  Box, Table, Thead, Tbody, Tr, Th, Td, Button, 
  Modal, ModalOverlay, ModalContent, ModalHeader, 
  ModalBody, ModalCloseButton, ModalFooter, 
  FormControl, FormLabel, Input, Textarea, Select,
  NumberInput, NumberInputField, useToast, 
  Heading, Flex, Image, Badge
} from '@chakra-ui/react';

const ProductCatalog = () => {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentProduct, setCurrentProduct] = useState({
    id: null,
    name: '',
    description: '',
    price: '',
    category: 'general',
    imageUrl: ''
  });
  const toast = useToast();

  const categories = [
    'general', 'rakeback', 'bonos', 'torneos', 'club', 'estrategia'
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los productos',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = (product = null) => {
    if (product) {
      setCurrentProduct(product);
    } else {
      setCurrentProduct({
        id: null,
        name: '',
        description: '',
        price: '',
        category: 'general',
        imageUrl: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setCurrentProduct({
      id: null,
      name: '',
      description: '',
      price: '',
      category: 'general',
      imageUrl: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCurrentProduct({
      ...currentProduct,
      [name]: value
    });
  };

  const handlePriceChange = (value) => {
    setCurrentProduct({
      ...currentProduct,
      price: value
    });
  };

  const handleSubmit = async () => {
    if (!currentProduct.name || !currentProduct.price) {
      toast({
        title: 'Error',
        description: 'Nombre y precio son obligatorios',
        status: 'warning',
        duration: 5000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const url = currentProduct.id
        ? `http://localhost:4000/api/products/${currentProduct.id}`
        : 'http://localhost:4000/api/products';
        
      const method = currentProduct.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentProduct)
      });
      
      if (!response.ok) throw new Error('Error en la respuesta del servidor');
      
      await fetchProducts();
      handleClose();
      
      toast({
        title: currentProduct.id ? 'Producto actualizado' : 'Producto creado',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/products/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Error al eliminar el producto');
      
      await fetchProducts();
      
      toast({
        title: 'Producto eliminado',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg">
      <Heading mb={4} size="lg">Catálogo de Productos</Heading>
      
      <Button 
        colorScheme="teal" 
        mb={6} 
        onClick={() => handleOpen()}
      >
        Añadir Producto
      </Button>
      
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Imagen</Th>
            <Th>Nombre</Th>
            <Th>Precio</Th>
            <Th>Categoría</Th>
            <Th>Acciones</Th>
          </Tr>
        </Thead>
        <Tbody>
          {products.map((product) => (
            <Tr key={product.id}>
              <Td>
                {product.imageUrl ? (
                  <Image 
                    src={product.imageUrl} 
                    alt={product.name} 
                    boxSize="50px" 
                    objectFit="cover" 
                  />
                ) : (
                  <Box w="50px" h="50px" bg="gray.200" />
                )}
              </Td>
              <Td>{product.name}</Td>
              <Td>${parseFloat(product.price).toFixed(2)}</Td>
              <Td>
                <Badge colorScheme="blue">{product.category}</Badge>
              </Td>
              <Td>
                <Flex gap={2}>
                  <Button 
                    size="sm" 
                    colorScheme="blue" 
                    onClick={() => handleOpen(product)}
                  >
                    Editar
                  </Button>
                  <Button 
                    size="sm" 
                    colorScheme="red" 
                    onClick={() => handleDelete(product.id)}
                  >
                    Eliminar
                  </Button>
                </Flex>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      <Modal isOpen={isModalOpen} onClose={handleClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {currentProduct.id ? 'Editar Producto' : 'Añadir Producto'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={3}>
              <FormLabel>Nombre</FormLabel>
              <Input 
                name="name" 
                value={currentProduct.name} 
                onChange={handleChange} 
              />
            </FormControl>
            
            <FormControl mb={3}>
              <FormLabel>Descripción</FormLabel>
              <Textarea 
                name="description" 
                value={currentProduct.description} 
                onChange={handleChange} 
              />
            </FormControl>
            
            <FormControl mb={3}>
              <FormLabel>Precio</FormLabel>
              <NumberInput 
                value={currentProduct.price} 
                onChange={handlePriceChange}
                min={0}
                precision={2}
              >
                <NumberInputField name="price" />
              </NumberInput>
            </FormControl>
            
            <FormControl mb={3}>
              <FormLabel>Categoría</FormLabel>
              <Select 
                name="category" 
                value={currentProduct.category} 
                onChange={handleChange}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </Select>
            </FormControl>
            
            <FormControl mb={3}>
              <FormLabel>URL de Imagen</FormLabel>
              <Input 
                name="imageUrl" 
                value={currentProduct.imageUrl} 
                onChange={handleChange} 
              />
            </FormControl>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={handleClose}>
              Cancelar
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleSubmit}
              isLoading={isLoading}
            >
              {currentProduct.id ? 'Actualizar' : 'Crear'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ProductCatalog;