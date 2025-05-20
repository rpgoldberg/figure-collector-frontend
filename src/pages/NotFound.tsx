import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Heading, Text, Button, VStack, Icon } from '@chakra-ui/react';
import { FaExclamationTriangle, FaHome } from 'react-icons/fa';

const NotFound: React.FC = () => {
  return (
    <Box textAlign="center" py={10} px={6} minH="70vh" display="flex" alignItems="center" justifyContent="center">
      <VStack spacing={6}>
        <Icon as={FaExclamationTriangle} boxSize={20} color="orange.400" />
        
        <Heading as="h1" size="2xl" mt={6} mb={2}>
          Page Not Found
        </Heading>
        
        <Text color="gray.600" fontSize="lg">
          The page you're looking for doesn't exist or has been moved.
        </Text>
        
        <Button
          as={RouterLink}
          to="/"
          colorScheme="brand"
          size="lg"
          mt={4}
          leftIcon={<FaHome />}
        >
          Go to Dashboard
        </Button>
      </VStack>
    </Box>
  );
};

export default NotFound;
