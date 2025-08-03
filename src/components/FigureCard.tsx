import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Image, Text, Badge, Link, Flex, IconButton, useToast } from '@chakra-ui/react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { Figure } from '../types';
import { deleteFigure } from '../api';
import { useMutation, useQueryClient } from 'react-query';

interface FigureCardProps {
  figure: Figure;
}

const FigureCard: React.FC<FigureCardProps> = ({ figure }) => {
  const toast = useToast();
  const queryClient = useQueryClient();
  
  const deleteMutation = useMutation(() => deleteFigure(figure._id), {
    onSuccess: () => {
      // Invalidate all queries that might contain figure data
      queryClient.invalidateQueries('figures');
      queryClient.invalidateQueries('recentFigures');
      queryClient.invalidateQueries('dashboardStats');
      
      toast({
        title: 'Figure deleted',
        description: `${figure.name} has been removed from your collection.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to delete figure',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${figure.name}?`)) {
      deleteMutation.mutate();
    }
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      overflow="hidden"
      bg="white"
      shadow="md"
      transition="all 0.3s"
      _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
    >
      <Box position="relative" pb="60%">
        <Image
          src={figure.imageUrl || '/placeholder-figure.png'}
          alt={figure.name}
          position="absolute"
          top="0"
          left="0"
          w="100%"
          h="100%"
          objectFit="cover"
          fallbackSrc="https://via.placeholder.com/300x200?text=No+Image"
        />
      </Box>

      <Box p={4}>
        <Badge colorScheme="brand" mb={2}>
          {figure.scale}
        </Badge>
        <Link
          as={RouterLink}
          to={`/figures/${figure._id}`}
          fontWeight="semibold"
          fontSize="lg"
          lineHeight="tight"
          display="block"
          noOfLines={1}
          mb={1}
        >
          {figure.name}
        </Link>
        <Text fontSize="sm" color="gray.600" mb={2}>
          {figure.manufacturer}
        </Text>

        <Text fontSize="xs" color="gray.500">
          Location: {figure.location} (Box {figure.boxNumber})
        </Text>

        <Flex mt={4} justify="space-between">
                      <Link
            as={RouterLink}
            to={`/figures/edit/${figure._id}`}
            fontSize="sm"
            color="brand.600"
          >
            <IconButton
              aria-label="Edit figure"
              icon={<FaEdit />}
              size="sm"
              variant="ghost"
              colorScheme="brand"
            />
          </Link>
          <IconButton
            aria-label="Delete figure"
            icon={<FaTrash />}
            size="sm"
            variant="ghost"
            colorScheme="red"
            onClick={handleDelete}
            isLoading={deleteMutation.isLoading}
          />
        </Flex>
      </Box>
    </Box>
  );
};

export default FigureCard;
