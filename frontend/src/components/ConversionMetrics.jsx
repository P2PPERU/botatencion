// frontend/src/components/ConversionMetrics.jsx
import { useState, useEffect } from 'react';
import {
  Box, Heading, Stat, StatLabel, StatNumber, 
  StatHelpText, StatArrow, SimpleGrid, Text,
  Table, Thead, Tbody, Tr, Th, Td, Badge,
  Select, Divider, Progress, Flex
} from '@chakra-ui/react';
import { getSalesAnalytics } from '../utils/salesAnalytics';

const ConversionMetrics = () => {
  const [analytics, setAnalytics] = useState({
    totalConversations: 0,
    conversationsWithSalesIntent: 0,
    conversionRate: 0,
    averageMessagesUntilPurchaseIntent: 0,
    commonKeywordsBeforePurchase: {},
    salesStageTransitions: {
      awareness: 0,
      interest: 0,
      consideration: 0,
      intent: 0,
      evaluation: 0,
      purchase: 0
    },
    productsMentioned: {}
  });
  
  const [timeRange, setTimeRange] = useState('all');
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    fetchData();
  }, [timeRange]);
  
  const fetchData = async () => {
    // Obtener datos de análisis
    const analyticsData = await getSalesAnalytics(timeRange);
    setAnalytics(analyticsData);
    
    // Obtener productos para mostrar nombres
    try {
      const response = await fetch('http://localhost:4000/api/products');
      const productsData = await response.json();
      setProducts(productsData);
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };
  
  const getProductName = (productId) => {
    const product = products.find(p => p.id === parseInt(productId));
    return product ? product.name : `Producto ${productId}`;
  };
  
  const getStageName = (stage) => {
    const stageNames = {
      awareness: 'Conocimiento',
      interest: 'Interés',
      consideration: 'Consideración',
      intent: 'Intención',
      evaluation: 'Evaluación',
      purchase: 'Compra'
    };
    return stageNames[stage] || stage;
  };
  
  const getTotalStageTransitions = () => {
    return Object.values(analytics.salesStageTransitions).reduce((sum, val) => sum + val, 0);
  };
  
  const getStagePercentage = (stage) => {
    const total = getTotalStageTransitions();
    if (total === 0) return 0;
    return (analytics.salesStageTransitions[stage] / total) * 100;
  };
  
  const getTopKeywords = () => {
    return Object.entries(analytics.commonKeywordsBeforePurchase)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };
  
  const getTopProducts = () => {
    return Object.entries(analytics.productsMentioned)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  };

  return (
    <Box p={5} shadow="md" borderWidth="1px" borderRadius="lg">
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">Métricas de Conversión</Heading>
        
        <Select 
          value={timeRange} 
          onChange={(e) => setTimeRange(e.target.value)}
          width="200px"
        >
          <option value="today">Hoy</option>
          <option value="week">Esta semana</option>
          <option value="month">Este mes</option>
          <option value="all">Todo el tiempo</option>
        </Select>
      </Flex>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={10} mb={8}>
        <Stat>
          <StatLabel>Tasa de Conversión</StatLabel>
          <StatNumber>{analytics.conversionRate.toFixed(2)}%</StatNumber>
          <StatHelpText>
            <StatArrow type="increase" />
            Basado en {analytics.totalConversations} conversaciones
          </StatHelpText>
        </Stat>
        
        <Stat>
          <StatLabel>Conversaciones con Intención</StatLabel>
          <StatNumber>{analytics.conversationsWithSalesIntent}</StatNumber>
          <StatHelpText>
            Del total de {analytics.totalConversations} conversaciones
          </StatHelpText>
        </Stat>
        
        <Stat>
          <StatLabel>Mensajes hasta Intención</StatLabel>
          <StatNumber>
            {analytics.averageMessagesUntilPurchaseIntent.toFixed(1)}
          </StatNumber>
          <StatHelpText>
            Promedio de mensajes antes de mostrar interés
          </StatHelpText>
        </Stat>
      </SimpleGrid>
      
      <Divider my={6} />
      
      <Heading size="md" mb={4}>Etapas del Embudo de Ventas</Heading>
      
      <Box mb={8}>
        {Object.keys(analytics.salesStageTransitions).map(stage => (
          <Box key={stage} mb={3}>
            <Flex justifyContent="space-between" mb={1}>
              <Text>{getStageName(stage)}</Text>
              <Text>{getStagePercentage(stage).toFixed(1)}%</Text>
            </Flex>
            <Progress 
              value={getStagePercentage(stage)} 
              size="sm" 
              colorScheme={stage === 'purchase' ? 'green' : 'blue'} 
            />
          </Box>
        ))}
      </Box>
      
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10}>
        <Box>
          <Heading size="md" mb={4}>Términos Populares</Heading>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Palabra Clave</Th>
                <Th isNumeric>Frecuencia</Th>
              </Tr>
            </Thead>
            <Tbody>
              {getTopKeywords().map(([keyword, count]) => (
                <Tr key={keyword}>
                  <Td>{keyword}</Td>
                  <Td isNumeric>{count}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
        
        <Box>
          <Heading size="md" mb={4}>Productos Más Mencionados</Heading>
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Producto</Th>
                <Th isNumeric>Menciones</Th>
              </Tr>
            </Thead>
            <Tbody>
              {getTopProducts().map(([productId, count]) => (
                <Tr key={productId}>
                  <Td>{getProductName(productId)}</Td>
                  <Td isNumeric>{count}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default ConversionMetrics;