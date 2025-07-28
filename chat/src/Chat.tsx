import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, List, ListItem, ListItemText, Paper, Typography } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import axios from 'axios';

interface Message {
  text: string;
  sender: 'user' | 'bot';
}

const Chat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [clientId, setClientId] = useState('');
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session
    const initChat = async () => {
      try {
        const response = await axios.get('http://localhost:8000/start_chat');
        setClientId(response.data.client_id);
        
        // Connect to WebSocket
        const ws = new WebSocket(`ws://localhost:8000/ws/${response.data.client_id}`);
        setSocket(ws);

        ws.onmessage = (event) => {
          setMessages(prev => [...prev, { text: event.data, sender: 'bot' }]);
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
        };

        return () => {
          ws.close();
        };
      } catch (error) {
        console.error('Error initializing chat:', error);
      }
    };

    initChat();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = () => {
    if (input.trim() && socket) {
      const newMessage: Message = { text: input, sender: 'user' };
      setMessages(prev => [...prev, newMessage]);
      socket.send(input);
      setInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      height: '80vh', 
      maxWidth: '800px', 
      margin: '0 auto',
      border: '1px solid #ddd',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      <Box sx={{ 
        flexGrow: 1, 
        overflowY: 'auto', 
        padding: '16px',
        backgroundColor: '#f9f9f9'
      }}>
        {messages.length === 0 ? (
          <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 4 }}>
            Start chatting with the AI assistant
          </Typography>
        ) : (
          <List>
            {messages.map((message, index) => (
              <ListItem key={index} sx={{ 
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                padding: '8px 16px'
              }}>
                <Paper elevation={1} sx={{
                  padding: '8px 16px',
                  backgroundColor: message.sender === 'user' ? '#e3f2fd' : '#f5f5f5',
                  borderRadius: message.sender === 'user' ? '18px 18px 0 18px' : '18px 18px 18px 0',
                  maxWidth: '70%'
                }}>
                  <ListItemText 
                    primary={message.text} 
                    primaryTypographyProps={{ 
                      color: message.sender === 'user' ? 'primary' : 'text.primary',
                      sx: { wordBreak: 'break-word' }
                    }} 
                  />
                </Paper>
              </ListItem>
            ))}
            <div ref={messagesEndRef} />
          </List>
        )}
      </Box>
      <Box sx={{ 
        display: 'flex', 
        padding: '16px', 
        borderTop: '1px solid #ddd',
        backgroundColor: 'white'
      }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{ marginRight: '8px' }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleSend}
          disabled={!input.trim()}
          endIcon={<SendIcon />}
        >
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default Chat;