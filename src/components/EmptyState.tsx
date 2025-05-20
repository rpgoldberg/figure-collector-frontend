import React from 'react';
import { Box, Text, Button, VStack, Icon } from '@chakra-ui/react';
import { FaPlus, FaCube, FaSearch } from 'react-icons/fa';
import { Link as RouterLink } from 'react-router-dom';

interface EmptyStateProps {
  type: 'collection' | 'search' | 'filter';
  message?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  type,
  message
}) => {
  const getContent = () => {
    switch (type) {
      case 'collection':
        return {
          icon: FaCube,
          title: 'Your collection is empty',
          description: message || 'You haven\'t added any figures to your collection yet.',
          button: {
            text: 'Add Your First Figure',
            icon: FaPlus,
            link: '/figures/add'
          }
        };
      case 'search':
        return {
          icon: FaSearch,
          title: 'No figures found',
          description: message || 'No figures match your search criteria.',
          button: {
            text: 'Clear Search',
            icon: FaTimes,
            onclick: () => window.location.href = '/figures'
          }
        };
      case 'filter':
        return {
          icon: FaFilter,
          title: 'No figures match your filters',
          description: message || 'Try adjusting your filter criteria.',
          button: {
            text: 'Clear Filters',
            icon: FaTimes,
            onclick: () => window.location.href = '/figures'
          }
        };
      default:
        return {
          icon: FaCube,
          title: 'Nothing to display',
          description: message || 'No content available.',
          button: {
            text: 'Go to Dashboard',
            link: '/'
          }
        };
    }
  };

  const content = getContent();

  return (
    <Box
      p={10}
      borderRadius="lg"
      bg="white"
      shadow="sm"
      textAlign="center"
      my={10}
    >
      <VStack spacing={6}>
        <Icon as={content.icon} boxSize={12} color="gray.400" />
        
        <VStack spacing={2}>
          <Text fontSize="xl" fontWeight="bold">
            {content.title}
          </Text>
          <Text color="gray.600">
            {content.description}
          </Text>
        </VStack>
        
        {content.button.link ? (
          <Button
            as={RouterLink}
            to={content.button.link}
            leftIcon={content.button.icon && <Icon as={content.button.icon} />}
            colorScheme="brand"
            size="md"
          >
            {content.button.text}
          </Button>
        ) : (
          <Button
            onClick={content.button.onclick}
            leftIcon={content.button.icon && <Icon as={content.button.icon} />}
            colorScheme="brand"
            size="md"
          >
            {content.button.text}
          </Button>
        )}
      </VStack>
    </Box>
  );
};

export default EmptyState;
