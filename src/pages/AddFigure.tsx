import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Heading,
  Button,
  Flex,
  useToast,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { FaArrowLeft } from 'react-icons/fa';
import { createFigure } from '../api';
import FigureForm from '../components/FigureForm';
import { FigureFormData } from '../types';

const AddFigure: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  
  const mutation = useMutation(createFigure, {
    onSuccess: () => {
      // Invalidate all queries that might contain figure data
      queryClient.invalidateQueries('figures');
      queryClient.invalidateQueries('recentFigures');
      queryClient.invalidateQueries('dashboardStats');
      
      toast({
        title: 'Success',
        description: 'Figure added successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      navigate('/figures');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to add figure',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const handleSubmit = (data: FigureFormData) => {
    mutation.mutate(data);
  };

  return (
    <Box>
      <Breadcrumb spacing="8px" separator={<ChevronRightIcon color="gray.500" />} mb={5}>
        <BreadcrumbItem>
          <BreadcrumbLink as={RouterLink} to="/">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink as={RouterLink} to="/figures">Figures</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>Add New Figure</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Add New Figure</Heading>
        <Button
          leftIcon={<FaArrowLeft />}
          as={RouterLink}
          to="/figures"
          variant="outline"
        >
          Back to Figures
        </Button>
      </Flex>
      
      <Box bg="white" p={6} borderRadius="lg" shadow="md">
        <FigureForm
          onSubmit={handleSubmit}
          isLoading={mutation.isLoading}
        />
      </Box>
    </Box>
  );
};

export default AddFigure;
