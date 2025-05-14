// frontend/src/App.jsx
import { useState } from 'react';
import { Box, Tabs, TabList, TabPanels, Tab, TabPanel, Button } from '@chakra-ui/react';
import HumanLikeChatBot from './components/HumanLikeChatBot.jsx';
import FAQManager from './components/FAQManager.jsx';

function App() {
  const [isAdmin, setIsAdmin] = useState(false);
  
  return (
    <Box p={4}>
      <Tabs variant="enclosed">
        <TabList>
          <Tab>Chat con Alexa</Tab>
          {isAdmin && <Tab>Gestión de FAQs</Tab>}
        </TabList>
        
        <TabPanels>
          <TabPanel>
            <HumanLikeChatBot />
          </TabPanel>
          
          {isAdmin && (
            <TabPanel>
              <FAQManager />
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