// frontend/src/components/HumanLikeChatBot.jsx
import { useEffect, useRef, useState } from 'react';
import {
  Box, Input, Button, VStack, Text, Spinner, Flex, 
  useColorModeValue, Avatar, InputGroup, InputRightElement,
  HStack, Badge, useToast
} from '@chakra-ui/react';
import ProductSuggestion from './ProductSuggestion';

const HumanLikeChatBot = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: '¡Hola! Soy Alexa, del equipo PokerProTrack. ¿Te interesa saber más sobre nuestros bonos, rakeback o cómo mejorar tu juego?' }
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [typingText, setTypingText] = useState('');
  const [currentBotMessage, setCurrentBotMessage] = useState('');
  const [typingSpeed, setTypingSpeed] = useState({ min: 30, max: 70 });
  const [quickReplies, setQuickReplies] = useState([]);
  const [currentIntent, setCurrentIntent] = useState(null);
  const [relatedKeywords, setRelatedKeywords] = useState([]);
  const [isConversationFinished, setIsConversationFinished] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const messagesEndRef = useRef();
  const toast = useToast();

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingText]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const simulateTyping = (text) => {
    setTyping(true);
    setCurrentBotMessage(text);
    setTypingText('');
    
    let i = 0;
    const maxChars = text.length;
    
    const timer = setInterval(() => {
      if (i < maxChars) {
        setTypingText(prev => prev + text.charAt(i));
        i++;
        
        // Variación de velocidad sin interrupciones críticas
        if (i % 5 === 0) {
          const newSpeed = {
            min: Math.floor(Math.random() * 20) + 20,
            max: Math.floor(Math.random() * 30) + 60
          };
          setTypingSpeed(newSpeed);
        }
        
        // Solo pausa si no estamos cerca del final
        if (i % 15 === 0 && Math.random() > 0.7 && i < maxChars - 20) {
          // Pausa sin recursión
          clearInterval(timer);
          setTimeout(() => {
            // Continuar con el mismo intervalo
            const newTimer = setInterval(() => {
              if (i < maxChars) {
                setTypingText(prev => prev + text.charAt(i));
                i++;
              } else {
                clearInterval(newTimer);
                setTyping(false);
                setMessages(prev => [...prev, { sender: 'bot', text }]);
                setTypingText('');
              }
            }, Math.floor(Math.random() * (typingSpeed.max - typingSpeed.min + 1)) + typingSpeed.min);
          }, 800);
          return;
        }
      } else {
        clearInterval(timer);
        setTyping(false);
        setMessages(prev => [...prev, { sender: 'bot', text }]);
        setTypingText('');
      }
    }, Math.floor(Math.random() * (typingSpeed.max - typingSpeed.min + 1)) + typingSpeed.min);
  
    return () => clearInterval(timer);
  };

  // Generar quick replies basados en la intención
  const generateQuickReplies = (intentAnalysis) => {
    if (!intentAnalysis || !intentAnalysis.hasPurchaseIntent) {
      return [];
    }

    // Palabras clave detectadas
    const keywords = intentAnalysis.detectedKeywords || [];
    setRelatedKeywords(keywords);

    // Categorías relacionadas
    const categories = intentAnalysis.categories || [];
    
    // Generar respuestas rápidas según la intención
    const replies = [];
    
    if (categories.includes('bonos')) {
      replies.push('Ver bonos disponibles');
    }
    
    if (categories.includes('rakeback')) {
      replies.push('Cómo funciona el rakeback');
    }
    
    if (categories.includes('torneos')) {
      replies.push('Torneos próximos');
    }
    
    if (categories.includes('estrategia')) {
      replies.push('Consejos para mejorar');
    }
    
    // Añadir opciones genéricas si no hay categorías específicas
    if (replies.length === 0 && intentAnalysis.hasPurchaseIntent) {
      replies.push('Ver catálogo completo');
      replies.push('Productos recomendados');
    }
    
    return replies;
  };
  
  const handleSend = async () => {
    if (!input.trim() || isConversationFinished) return;

    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTyping(true);
    setQuickReplies([]);

    try {
      const response = await fetch('http://localhost:4000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'cliente-prueba',
          message: input
        })
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const data = await response.json();
      
      // Manejar diferentes tipos de respuestas
      if (typeof data === 'object' && data.reply) {
        // Respuesta de objeto con formato {reply, intentAnalysis}
        
        // Actualizar la intención detectada
        if (data.intentAnalysis) {
          setCurrentIntent(data.intentAnalysis);
          
          // Generar respuestas rápidas
          const replies = generateQuickReplies(data.intentAnalysis);
          setQuickReplies(replies);
        }
        
        // Simular un retraso como si el bot estuviera "pensando"
        setTimeout(() => {
          simulateTyping(data.reply);
        }, 1000 + Math.random() * 1000);
      } else if (typeof data === 'string') {
        // Caso para manejar respuestas simples (string)
        setTimeout(() => {
          simulateTyping(data);
        }, 1000 + Math.random() * 1000);
      } else {
        // Caso de respuesta no esperada
        throw new Error('Formato de respuesta no válido');
      }
    } catch (error) {
      console.error('Error en chat:', error);
      setTyping(false);
      setMessages(prev => [...prev, { 
        sender: 'bot', 
        text: '❌ Parece que tengo problemas para comunicarme con el servidor. ¿Podrías intentarlo de nuevo en unos momentos?' 
      }]);
    }
  };

  const handleQuickReply = (reply) => {
    // Manejar el clic en respuesta rápida
    setInput(reply);
    handleSend();
  };

  const handleProductSelect = (product) => {
    // Añadir mensaje al chat sobre el producto seleccionado
    const productMsg = { 
      sender: 'bot', 
      text: `Te recomiendo: ${product.name} - $${product.price}\n${product.description}`, 
      product
    };
    setMessages(prev => [...prev, productMsg]);
  };
  
  const handleEndConversation = async () => {
    if (isConversationFinished || messages.length <= 1) return;
    
    setIsSaving(true);
    
    try {
      // Añadir mensaje de cierre
      const finalMsg = { 
        sender: 'bot', 
        text: '¡Gracias por chatear con PokerProTrack! Espero haberte ayudado. Si tienes más preguntas, no dudes en iniciar un nuevo chat.' 
      };
      
      const updatedMessages = [...messages, finalMsg];
      setMessages(updatedMessages);
      
      // Guardar la conversación
      const response = await fetch('http://localhost:4000/api/chat/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'cliente-prueba',
          messages: updatedMessages
        })
      });
      
      if (!response.ok) {
        throw new Error('Error guardando la conversación');
      }
      
      setIsConversationFinished(true);
      
      toast({
        title: 'Conversación finalizada',
        description: 'La conversación ha sido guardada correctamente.',
        status: 'success',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error finalizando conversación:', error);
      
      toast({
        title: 'Error',
        description: 'No se pudo guardar la conversación.',
        status: 'error',
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleNewConversation = () => {
    setMessages([
      { sender: 'bot', text: '¡Hola! Soy Alexa, del equipo PokerProTrack. ¿Te interesa saber más sobre nuestros bonos, rakeback o cómo mejorar tu juego?' }
    ]);
    setCurrentIntent(null);
    setQuickReplies([]);
    setRelatedKeywords([]);
    setIsConversationFinished(false);
  };

  const getMessageTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  };

  const bgColor = useColorModeValue('gray.50', 'gray.800');
  const userBubbleColor = useColorModeValue('blue.100', 'blue.700');
  const botBubbleColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box 
      p={4} 
      bg={bgColor} 
      borderRadius="lg" 
      boxShadow="md"
      maxW="500px" 
      mx="auto" 
      minH="80vh"
      display="flex"
      flexDirection="column"
    >
      <Box 
        p={2} 
        bg={useColorModeValue('teal.500', 'teal.600')} 
        color="white" 
        borderRadius="md" 
        mb={4}
      >
        <Flex align="center" justify="space-between" gap={2}>
          <Flex align="center" gap={2}>
            <Avatar size="sm" name="Alexa" bg="teal.300" />
            <Text fontWeight="bold">Alexa - Asistente PokerProTrack</Text>
          </Flex>
          {isConversationFinished ? (
            <Button 
              size="sm" 
              colorScheme="green" 
              onClick={handleNewConversation}
            >
              Nueva Conversación
            </Button>
          ) : (
            <Button 
              size="sm" 
              colorScheme="red" 
              onClick={handleEndConversation}
              isLoading={isSaving}
              isDisabled={typing || messages.length <= 1}
            >
              Finalizar
            </Button>
          )}
        </Flex>
      </Box>

      <Box 
        flex="1" 
        overflowY="auto" 
        mb={4} 
        css={{
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            width: '10px',
            background: useColorModeValue('gray.100', 'gray.700'),
          },
          '&::-webkit-scrollbar-thumb': {
            background: useColorModeValue('gray.300', 'gray.600'),
            borderRadius: '24px',
          },
        }}
      >
        <VStack spacing={4} align="stretch">
          {messages.map((msg, i) => (
            <Flex 
              key={i} 
              justify={msg.sender === 'bot' ? 'flex-start' : 'flex-end'}
            >
              <Box 
                maxW="80%" 
                bg={msg.sender === 'bot' ? botBubbleColor : userBubbleColor}
                p={3}
                borderRadius={msg.sender === 'bot' ? "lg 2xl 2xl 0" : "2xl 2xl 0 2xl"}
                boxShadow="sm"
              >
                <Text>{msg.text}</Text>
                {msg.product && (
                  <Badge mt={2} colorScheme="green">Producto Recomendado</Badge>
                )}
                <Text fontSize="xs" color="gray.500" textAlign="right" mt={1}>
                  {getMessageTime()}
                </Text>
              </Box>
            </Flex>
          ))}
          
          {typing && (
            <Flex justify="flex-start">
              <Box 
                maxW="80%" 
                bg={botBubbleColor}
                p={3}
                borderRadius="lg 2xl 2xl 0"
                boxShadow="sm"
              >
                {typingText ? (
                  <>
                    <Text>{typingText}</Text>
                    <Text fontSize="xs" color="gray.500" textAlign="right" mt={1}>
                      {getMessageTime()}
                    </Text>
                  </>
                ) : (
                  <Flex align="center" h="24px">
                    <Spinner size="xs" mr={2} />
                    <Text fontSize="sm">Escribiendo</Text>
                  </Flex>
                )}
              </Box>
            </Flex>
          )}
          
          {/* Sugerencias de productos basadas en intención */}
          {currentIntent && currentIntent.hasPurchaseIntent && !typing && !isConversationFinished && (
            <ProductSuggestion 
              message={messages[messages.length - 1]?.text || ''} 
              onProductSelect={handleProductSelect}
              relatedKeywords={relatedKeywords}
            />
          )}
          
          {/* Quick replies */}
          {quickReplies.length > 0 && !typing && !isConversationFinished && (
            <HStack spacing={2} mt={2} overflowX="auto" p={1}>
              {quickReplies.map((reply, i) => (
                <Button 
                  key={i}
                  size="sm"
                  colorScheme="teal"
                  variant="outline"
                  whiteSpace="nowrap"
                  onClick={() => handleQuickReply(reply)}
                >
                  {reply}
                </Button>
              ))}
            </HStack>
          )}
          
          <div ref={messagesEndRef} />
        </VStack>
      </Box>

      <InputGroup size="md">
        <Input
          pr="4.5rem"
          placeholder={isConversationFinished ? "Conversación finalizada" : "Escribe tu mensaje..."}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          isDisabled={isConversationFinished || typing}
        />
        <InputRightElement width="4.5rem">
          <Button 
            h="1.75rem" 
            size="sm" 
            colorScheme="teal"
            isDisabled={!input.trim() || typing || isConversationFinished}
            onClick={handleSend}
          >
            Enviar
          </Button>
        </InputRightElement>
      </InputGroup>
    </Box>
  );
};

export default HumanLikeChatBot;