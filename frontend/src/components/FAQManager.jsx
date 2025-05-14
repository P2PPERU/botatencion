// frontend/src/components/FAQManager.jsx
import { useState, useEffect } from 'react';
import {
  Box, Button, FormControl, FormLabel, Input, Textarea, VStack, 
  Heading, Table, Thead, Tbody, Tr, Th, Td, Select, 
  useToast, IconButton, Flex, useDisclosure, Modal, 
  ModalOverlay, ModalContent, ModalHeader, ModalFooter, 
  ModalBody, ModalCloseButton
} from '@chakra-ui/react';

const FAQManager = () => {
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('general');
  const [editingId, setEditingId] = useState(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Categorías predefinidas de FAQs
  const categories = [
    'general', 
    'bonos', 
    'rakeback', 
    'estrategia', 
    'reglas', 
    'torneos'
  ];

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/faqs');
      const data = await response.json();
      setFaqs(data);
    } catch (error) {
      toast({
        title: 'Error al cargar FAQs',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!question.trim() || !answer.trim()) {
      toast({
        title: 'Campos incompletos',
        description: 'La pregunta y respuesta son obligatorias',
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    setIsLoading(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId 
        ? `http://localhost:4000/api/faqs/${editingId}` 
        : 'http://localhost:4000/api/faqs';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer, category }),
      });

      const data = await response.json();
      
      if (response.ok) {
        toast({
          title: editingId ? 'FAQ actualizada' : 'FAQ añadida',
          status: 'success',
          duration: 3000,
        });
        fetchFaqs();
        resetForm();
      } else {
        throw new Error(data.error || 'Error al procesar la FAQ');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (faq) => {
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setCategory(faq.category);
    setEditingId(faq.id);
    onOpen();
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta FAQ?')) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/faqs/${id}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        toast({
          title: 'FAQ eliminada',
          status: 'success',
          duration: 3000,
        });
        fetchFaqs();
      } else {
        const data = await response.json();
        throw new Error(data.error || 'Error al eliminar la FAQ');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setQuestion('');
    setAnswer('');
    setCategory('general');
    setEditingId(null);
    onClose();
  };

  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg">
      <Heading mb={4} size="lg">Gestión de Preguntas Frecuentes</Heading>
      
      <Button 
        colorScheme="teal" 
        mb={6} 
        onClick={() => {
          resetForm();
          onOpen();
        }}
      >
        Añadir Nueva FAQ
      </Button>
      
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Categoría</Th>
            <Th>Pregunta</Th>
            <Th>Respuesta</Th>
            <Th>Acciones</Th>
          </Tr>
        </Thead>
        <Tbody>
          {faqs.map((faq) => (
            <Tr key={faq.id}>
              <Td>{faq.category}</Td>
              <Td>{faq.question}</Td>
              <Td>{faq.answer.substring(0, 50)}...</Td>
              <Td>
                <Flex gap={2}>
                  <Button size="sm" onClick={() => handleEdit(faq)}>Editar</Button>
                  <Button size="sm" colorScheme="red" onClick={() => handleDelete(faq.id)}>Eliminar</Button>
                </Flex>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Modal para añadir/editar FAQ */}
      <Modal isOpen={isOpen} onClose={resetForm} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{editingId ? 'Editar FAQ' : 'Añadir Nueva FAQ'}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Categoría</FormLabel>
                <Select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Pregunta</FormLabel>
                <Input 
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="Ingresa la pregunta"
                />
              </FormControl>
              
              <FormControl isRequired>
                <FormLabel>Respuesta</FormLabel>
                <Textarea 
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Ingresa la respuesta"
                  rows={6}
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={resetForm}>
              Cancelar
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleSubmit}
              isLoading={isLoading}
            >
              {editingId ? 'Actualizar' : 'Añadir'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default FAQManager;