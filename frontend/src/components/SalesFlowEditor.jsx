// frontend/src/components/SalesFlowEditor.jsx
import { useState, useEffect } from 'react';
import {
  Box, Heading, Button, VStack, HStack, Text, Input, 
  FormControl, FormLabel, Select, Textarea, IconButton,
  Tag, TagLabel, TagCloseButton, Flex, useToast,
  Table, Thead, Tbody, Tr, Th, Td, Modal, ModalOverlay,
  ModalContent, ModalHeader, ModalBody, ModalCloseButton,
  ModalFooter, Divider, useDisclosure, NumberInput, 
  NumberInputField
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, ArrowForwardIcon } from '@chakra-ui/icons';

const SalesFlowEditor = () => {
  const [flows, setFlows] = useState([]);
  const [currentFlow, setCurrentFlow] = useState({
    id: null,
    name: '',
    triggerWords: [],
    steps: [],
    productIds: []
  });
  const [products, setProducts] = useState([]);
  const [newTriggerWord, setNewTriggerWord] = useState('');
  const [newOptionText, setNewOptionText] = useState('');
  const [selectedStep, setSelectedStep] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  
  const { 
    isOpen: isFlowModalOpen, 
    onOpen: onFlowModalOpen, 
    onClose: onFlowModalClose 
  } = useDisclosure();
  
  const { 
    isOpen: isStepModalOpen, 
    onOpen: onStepModalOpen, 
    onClose: onStepModalClose 
  } = useDisclosure();

  useEffect(() => {
    fetchFlows();
    fetchProducts();
  }, []);

  const fetchFlows = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:4000/api/salesFlows');
      const data = await response.json();
      setFlows(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los flujos de venta',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
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
    }
  };

  const handleFlowOpen = (flow = null) => {
    if (flow) {
      setCurrentFlow(flow);
    } else {
      setCurrentFlow({
        id: null,
        name: '',
        triggerWords: [],
        steps: [],
        productIds: []
      });
    }
    onFlowModalOpen();
  };

  const handleStepOpen = (step = null) => {
    if (step) {
      setSelectedStep(step);
    } else {
      setSelectedStep({
        id: Date.now(),
        message: '',
        options: []
      });
    }
    onStepModalOpen();
  };

  const handleFlowChange = (e) => {
    const { name, value } = e.target;
    setCurrentFlow({
      ...currentFlow,
      [name]: value
    });
  };

  const handleAddTriggerWord = () => {
    if (!newTriggerWord.trim()) return;
    
    if (!currentFlow.triggerWords.includes(newTriggerWord.trim())) {
      setCurrentFlow({
        ...currentFlow,
        triggerWords: [...currentFlow.triggerWords, newTriggerWord.trim()]
      });
    }
    setNewTriggerWord('');
  };

  const handleRemoveTriggerWord = (word) => {
    setCurrentFlow({
      ...currentFlow,
      triggerWords: currentFlow.triggerWords.filter(w => w !== word)
    });
  };

  const handleProductToggle = (productId) => {
    const newProductIds = currentFlow.productIds.includes(productId)
      ? currentFlow.productIds.filter(id => id !== productId)
      : [...currentFlow.productIds, productId];
    
    setCurrentFlow({
      ...currentFlow,
      productIds: newProductIds
    });
  };

  const handleStepChange = (e) => {
    const { name, value } = e.target;
    setSelectedStep({
      ...selectedStep,
      [name]: value
    });
  };

  const handleAddOption = () => {
    if (!newOptionText.trim()) return;
    
    const newOption = {
      text: newOptionText.trim(),
      nextStepId: null
    };
    
    setSelectedStep({
      ...selectedStep,
      options: [...selectedStep.options, newOption]
    });
    
    setNewOptionText('');
  };

  const handleRemoveOption = (index) => {
    const newOptions = [...selectedStep.options];
    newOptions.splice(index, 1);
    
    setSelectedStep({
      ...selectedStep,
      options: newOptions
    });
  };

  const handleOptionNextStepChange = (index, stepId) => {
    const newOptions = [...selectedStep.options];
    newOptions[index] = {
      ...newOptions[index],
      nextStepId: stepId !== '' ? parseInt(stepId) : null
    };
    
    setSelectedStep({
      ...selectedStep,
      options: newOptions
    });
  };

  const handleSaveStep = () => {
    if (!selectedStep.message.trim()) {
      toast({
        title: 'Error',
        description: 'El mensaje del paso es obligatorio',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
    
    let newSteps;
    const existingStepIndex = currentFlow.steps.findIndex(s => s.id === selectedStep.id);
    
    if (existingStepIndex >= 0) {
      newSteps = [...currentFlow.steps];
      newSteps[existingStepIndex] = selectedStep;
    } else {
      newSteps = [...currentFlow.steps, selectedStep];
    }
    
    setCurrentFlow({
      ...currentFlow,
      steps: newSteps
    });
    
    onStepModalClose();
  };

  const handleRemoveStep = (stepId) => {
    setCurrentFlow({
      ...currentFlow,
      steps: currentFlow.steps.filter(s => s.id !== stepId)
    });
  };

  const handleSaveFlow = async () => {
    if (!currentFlow.name.trim() || currentFlow.triggerWords.length === 0) {
      toast({
        title: 'Error',
        description: 'Nombre y palabras clave son obligatorios',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
    
    if (currentFlow.steps.length === 0) {
      toast({
        title: 'Error',
        description: 'El flujo debe tener al menos un paso',
        status: 'warning',
        duration: 3000,
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const url = currentFlow.id
        ? `http://localhost:4000/api/salesFlows/${currentFlow.id}`
        : 'http://localhost:4000/api/salesFlows';
        
      const method = currentFlow.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentFlow)
      });
      
      if (!response.ok) throw new Error('Error en la respuesta del servidor');
      
      await fetchFlows();
      onFlowModalClose();
      
      toast({
        title: currentFlow.id ? 'Flujo actualizado' : 'Flujo creado',
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

  const handleDeleteFlow = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este flujo?')) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:4000/api/salesFlows/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) throw new Error('Error al eliminar el flujo');
      
      await fetchFlows();
      
      toast({
        title: 'Flujo eliminado',
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
      <Heading mb={4} size="lg">Editor de Flujos de Venta</Heading>
      
      <Button 
        colorScheme="teal" 
        mb={6} 
        onClick={() => handleFlowOpen()}
      >
        Crear Nuevo Flujo
      </Button>
      
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th>Nombre</Th>
            <Th>Palabras Clave</Th>
            <Th>Pasos</Th>
            <Th>Productos</Th>
            <Th>Acciones</Th>
          </Tr>
        </Thead>
        <Tbody>
          {flows.map((flow) => (
            <Tr key={flow.id}>
              <Td>{flow.name}</Td>
              <Td>
                <Flex wrap="wrap" gap={1}>
                  {flow.triggerWords.slice(0, 3).map((word, i) => (
                    <Tag key={i} size="sm" colorScheme="blue">
                      {word}
                    </Tag>
                  ))}
                  {flow.triggerWords.length > 3 && (
                    <Tag size="sm" colorScheme="gray">
                      +{flow.triggerWords.length - 3}
                    </Tag>
                  )}
                </Flex>
              </Td>
              <Td>{flow.steps.length}</Td>
              <Td>{flow.productIds.length}</Td>
              <Td>
                <HStack spacing={2}>
                  <Button 
                    size="sm" 
                    colorScheme="blue" 
                    onClick={() => handleFlowOpen(flow)}
                  >
                    Editar
                  </Button>
                  <Button 
                    size="sm" 
                    colorScheme="red" 
                    onClick={() => handleDeleteFlow(flow.id)}
                  >
                    Eliminar
                  </Button>
                </HStack>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>

      {/* Modal de Flujo */}
      <Modal 
        isOpen={isFlowModalOpen} 
        onClose={onFlowModalClose}
        size="xl"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {currentFlow.id ? 'Editar Flujo' : 'Crear Flujo'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel>Nombre</FormLabel>
                <Input 
                  name="name" 
                  value={currentFlow.name} 
                  onChange={handleFlowChange} 
                />
              </FormControl>
              
              <FormControl>
                <FormLabel>Palabras Clave Desencadenantes</FormLabel>
                <HStack mb={2}>
                  <Input 
                    value={newTriggerWord} 
                    onChange={(e) => setNewTriggerWord(e.target.value)}
                    placeholder="Nueva palabra clave"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTriggerWord()}
                  />
                  <IconButton 
                    icon={<AddIcon />} 
                    onClick={handleAddTriggerWord} 
                    aria-label="Añadir palabra clave"
                  />
                </HStack>
                <Flex wrap="wrap" gap={2}>
                  {currentFlow.triggerWords.map((word, i) => (
                    <Tag key={i} size="md" variant="solid" colorScheme="blue">
                      <TagLabel>{word}</TagLabel>
                      <TagCloseButton onClick={() => handleRemoveTriggerWord(word)} />
                    </Tag>
                  ))}
                </Flex>
              </FormControl>
              
              <FormControl>
                <FormLabel>Pasos del Flujo</FormLabel>
                <Button 
                  leftIcon={<AddIcon />} 
                  onClick={() => handleStepOpen()}
                  mb={2}
                >
                  Añadir Paso
                </Button>
                
                <VStack align="stretch" spacing={2}>
                  {currentFlow.steps.map((step, i) => (
                    <Box 
                      key={step.id} 
                      p={3} 
                      borderWidth="1px" 
                      borderRadius="md"
                      position="relative"
                    >
                      <Flex justify="space-between" alignItems="center">
                        <Text fontWeight="bold">Paso {i+1}</Text>
                        <HStack>
                          <Button 
                            size="xs" 
                            onClick={() => handleStepOpen(step)}
                          >
                            Editar
                          </Button>
                          <IconButton 
                            size="xs"
                            icon={<DeleteIcon />} 
                            colorScheme="red"
                            onClick={() => handleRemoveStep(step.id)}
                            aria-label="Eliminar paso"
                          />
                        </HStack>
                      </Flex>
                      <Text noOfLines={2} fontSize="sm" mt={1}>
                        {step.message}
                      </Text>
                      {step.options.length > 0 && (
                        <Box mt={2}>
                          <Text fontSize="xs" fontWeight="bold">Opciones:</Text>
                          {step.options.map((option, j) => (
                            <Flex key={j} fontSize="xs" alignItems="center" mt={1}>
                              <Text>{option.text}</Text>
                              {option.nextStepId && (
                                <HStack fontSize="xs" ml={2}>
                                  <ArrowForwardIcon boxSize={3} />
                                  <Text>
                                    Paso {currentFlow.steps.findIndex(s => s.id === option.nextStepId) + 1}
                                  </Text>
                                </HStack>
                              )}
                            </Flex>
                          ))}
                        </Box>
                      )}
                    </Box>
                  ))}
                </VStack>
              </FormControl>
              
              <FormControl>
                <FormLabel>Productos Asociados</FormLabel>
                <Table size="sm" variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Seleccionar</Th>
                      <Th>Nombre</Th>
                      <Th>Categoría</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {products.map((product) => (
                      <Tr key={product.id}>
                        <Td>
                          <input 
                            type="checkbox" 
                            checked={currentFlow.productIds.includes(product.id)}
                            onChange={() => handleProductToggle(product.id)}
                          />
                        </Td>
                        <Td>{product.name}</Td>
                        <Td>{product.category}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </FormControl>
            </VStack>
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onFlowModalClose}>
              Cancelar
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleSaveFlow}
              isLoading={isLoading}
            >
              {currentFlow.id ? 'Actualizar' : 'Crear'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Modal de Paso */}
      <Modal 
        isOpen={isStepModalOpen} 
        onClose={onStepModalClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedStep && selectedStep.id && currentFlow.steps.some(s => s.id === selectedStep.id) 
              ? 'Editar Paso' 
              : 'Añadir Paso'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedStep && (
              <VStack spacing={4} align="stretch">
                <FormControl>
                  <FormLabel>Mensaje</FormLabel>
                  <Textarea 
                    name="message" 
                    value={selectedStep.message} 
                    onChange={handleStepChange} 
                    placeholder="Mensaje que el bot enviará"
                    rows={4}
                  />
                </FormControl>
                
                <Divider />
                
                <FormControl>
                  <FormLabel>Opciones de Respuesta</FormLabel>
                  <HStack mb={2}>
                    <Input 
                      value={newOptionText} 
                      onChange={(e) => setNewOptionText(e.target.value)}
                      placeholder="Texto de la opción"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddOption()}
                    />
                    <IconButton 
                      icon={<AddIcon />} 
                      onClick={handleAddOption} 
                      aria-label="Añadir opción"
                    />
                  </HStack>
                  
                  {selectedStep.options.length > 0 && (
                    <Table size="sm" variant="simple" mt={2}>
                      <Thead>
                        <Tr>
                          <Th>Texto</Th>
                          <Th>Siguiente Paso</Th>
                          <Th></Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {selectedStep.options.map((option, i) => (
                          <Tr key={i}>
                            <Td>{option.text}</Td>
                            <Td>
                              <Select 
                                size="sm"
                                value={option.nextStepId || ''}
                                onChange={(e) => handleOptionNextStepChange(i, e.target.value)}
                              >
                                <option value="">Finalizar</option>
                                {currentFlow.steps
                                  .filter(step => step.id !== selectedStep.id)
                                  .map((step, j) => (
                                    <option key={step.id} value={step.id}>
                                      Paso {currentFlow.steps.indexOf(step) + 1}
                                    </option>
                                  ))}
                              </Select>
                            </Td>
                            <Td>
                              <IconButton 
                                size="xs"
                                icon={<DeleteIcon />} 
                                colorScheme="red"
                                onClick={() => handleRemoveOption(i)}
                                aria-label="Eliminar opción"
                              />
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  )}
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onStepModalClose}>
              Cancelar
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleSaveStep}
            >
              Guardar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SalesFlowEditor;