// frontend/src/App.jsx
import { useState } from 'react';
import { Box, Tabs, TabList, TabPanels, Tab, TabPanel, Button } from '@chakra-ui/react';
import HumanLikeChatBot from './components/HumanLikeChatBot.jsx';
import FAQManager from './components/FAQManager.jsx';
import PersonalitySelector from './components/PersonalitySelector.jsx';
import ProductCatalog from './components/ProductCatalog.jsx';
import SalesFlowEditor from './components/SalesFlowEditor.jsx';
import ConversionMetrics from './components/ConversionMetrics.jsx';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  
  return (
    <Box p={4}>
      <Tabs variant="enclosed">
        <TabList>
          <Tab>Chat con Alexa</Tab>
          {isAdmin && <Tab>Productos</Tab>}
          {isAdmin && <Tab>Flujos de Venta</Tab>}
          {isAdmin && <Tab>Gestión de FAQs</Tab>}
          {isAdmin && <Tab>Configuración de Bot</Tab>}
          {isAdmin && <Tab>Métricas</Tab>}
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <HumanLikeChatBot />
          </TabPanel>
          
          {isAdmin && (
            <TabPanel>
              <ProductCatalog />
            </TabPanel>
          )}
          
          {isAdmin && (
            <TabPanel>
              <SalesFlowEditor />
            </TabPanel>
          )}
          
          {isAdmin && (
            <TabPanel>
              <FAQManager />
            </TabPanel>
          )}
          
          {isAdmin && (
            <TabPanel>
              <PersonalitySelector />
            </TabPanel>
          )}
          
          {isAdmin && (
            <TabPanel>
              <ConversionMetrics />
            </TabPanel>
          )}
        </TabPanels>
      </Tabs>
      
      <Box position="fixed" bottom={4} right={4}>
        <Button 
          colorScheme={isAdmin ? "red" : "green"} 
          onClick={() => setIsAdmin(!isAdmin)}
        >
          {isAdmin ? "Modo Usuario" : "Modo Admin"}
        </Button>
      </Box>
    </Box>
  );
}

export default App;