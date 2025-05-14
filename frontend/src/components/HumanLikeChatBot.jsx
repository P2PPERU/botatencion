import { useEffect, useRef, useState } from 'react';
import {
  Box, Input, Button, VStack, Text, Spinner, Flex, useColorModeValue
} from '@chakra-ui/react';

const HumanLikeChatBot = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: '¡Hola! Soy Alexa, del equipo PokerProTrack. ¿Te interesa saber más sobre nuestros bonos, rakeback o cómo mejorar tu juego?' }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const chatBoxRef = useRef();

  useEffect(() => {
    chatBoxRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true);

    try {
      const response = await fetch('http://localhost:4000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'cliente-prueba',
          message: input
        })
      });

      const data = await response.json();
      const botMsg = { sender: 'bot', text: data.reply };

      setMessages((prev) => [...prev, botMsg]);
    } catch (error) {
      setMessages((prev) => [...prev, { sender: 'bot', text: '❌ Error al conectar con el servidor.' }]);
    } finally {
      setTyping(false);
    }
  };

  const bgColor = useColorModeValue('gray.100', 'gray.800');

  return (
    <Box p={4} bg={bgColor} borderRadius="md" maxW="500px" mx="auto" minH="80vh">
      <VStack spacing={3} align="stretch">
        {messages.map((msg, i) => (
          <Text key={i} align={msg.sender === 'bot' ? 'left' : 'right'}>
            <strong>{msg.sender === 'bot' ? 'Alexa' : 'Tú'}:</strong> {msg.text}
          </Text>
        ))}
        {typing && (
          <Flex align="center" gap={2}><Spinner size="sm" /> <Text>Alexa está escribiendo...</Text></Flex>
        )}
        <Input
          placeholder="Escribe tu mensaje..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <Button colorScheme="teal" onClick={handleSend}>Enviar</Button>
      </VStack>
      <div ref={chatBoxRef} />
    </Box>
  );
};

export default HumanLikeChatBot;
