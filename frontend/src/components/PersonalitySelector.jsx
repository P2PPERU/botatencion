import { useState, useEffect } from 'react';
import { 
  Box, 
  Select, 
  Text, 
  Flex, 
  Badge, 
  VStack, 
  HStack,
  Heading,
  useToast
} from '@chakra-ui/react';

const PersonalitySelector = () => {
  const [personalities, setPersonalities] = useState({});
  const [active, setActive] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    fetchPersonalities();
  }, []);

  const fetchPersonalities = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/config/personalities');
      const data = await response.json();
      setPersonalities(data.personalities);
      setActive(data.active);
    } catch (error) {
      console.error('Error obteniendo personalidades:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las personalidades',
        status: 'error',
        duration: 3000,
      });
    }
  };

  const handleChange = async (e) => {
    const newPersonality = e.target.value;
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:4000/api/config/personality', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ personality: newPersonality }),
      });
      
      if (response.ok) {
        setActive(newPersonality);
        toast({
          title: 'Personalidad actualizada',
          description: `El asistente ahora tiene la personalidad ${personalities[newPersonality].name}`,
          status: 'success',
          duration: 3000,
        });
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (error) {
      console.error('Error cambiando personalidad:', error);
      toast({
        title: 'Error',
        description: 'No se pudo cambiar la personalidad',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={4} border="1px" borderColor="gray.200" borderRadius="md" mb={4}>
      <Heading size="md" mb={4}>Personalización del Asistente</Heading>
      
      <VStack spacing={4} align="stretch">
        <Box>
          <Text mb={2} fontWeight="bold">Selecciona una personalidad:</Text>
          <Select 
            value={active} 
            onChange={handleChange}
            isDisabled={loading || Object.keys(personalities).length === 0}
          >
            {Object.entries(personalities).map(([key, value]) => (
              <option key={key} value={key}>
                {value.name} - {value.tone}
              </option>
            ))}
          </Select>
        </Box>
        
        {active && personalities[active] && (
          <Box>
            <Text fontWeight="bold" mb={2}>Características de {personalities[active].name}:</Text>
            <Flex mt={1} wrap="wrap" gap={2}>
              {personalities[active].quirks.map((quirk, i) => (
                <Badge key={i} colorScheme="teal" p={1} borderRadius="md">{quirk}</Badge>
              ))}
            </Flex>
            
            <Text fontWeight="bold" mt={3} mb={2}>Ejemplos de saludos:</Text>
            <VStack align="stretch" spacing={1}>
              {personalities[active].openingLines && personalities[active].openingLines.map((line, i) => (
                <Box key={i} p={2} bg="gray.50" borderRadius="md" fontSize="sm">
                  {line}
                </Box>
              ))}
            </VStack>
          </Box>
        )}
      </VStack>
    </Box>
  );
};

export default PersonalitySelector;