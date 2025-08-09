import React from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import {
  Box,
  Heading,
  Button,
  Flex,
  useToast,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Spinner,
  Center,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';
import { FaArrowLeft } from 'react-icons/fa';
import { getFigureById, updateFigure } from '../api';
import FigureForm from '../components/FigureForm';
import { FigureFormData } from '../types';

const EditFigure: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  
  const { data: figure, isLoading, error } = useQuery(
    ['figure', id],
    () => getFigureById(id!),
    {
      enabled: !!id,
      onError: (err: any) => {
        toast({
          title: 'Error',
          description: err.response?.data?.message || 'Failed to load figure details',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      },
    }
  );
  
  const mutation = useMutation(
    (data: FigureFormData) => updateFigure(id!, data),
    {
      onSuccess: () => {
        // Invalidate all queries that might contain figure data
        queryClient.invalidateQueries(['figure', id]);
        queryClient.invalidateQueries('figures');
        queryClient.invalidateQueries('recentFigures');
        queryClient.invalidateQueries('dashboardStats');
        
        toast({
          title: 'Success',
          description: 'Figure updated successfully',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        navigate(`/figures/${id}`);
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Failed to update figure',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      },
    }
  );

  const handleSubmit = (data: FigureFormData) => {
    mutation.mutate(data);
  };

  if (isLoading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Center>
    );
  }

  if (error || !figure) {
    return (
      <Box>
        <Alert status="error" borderRadius="md" mb={4}>
          <AlertIcon />
          Failed to load figure details. Please try again.
        </Alert>
        <Button as={RouterLink} to="/figures">
          Back to Figures
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Breadcrumb spacing="8px" separator={<ChevronRightIcon color="gray.500" />} mb={5}>
        <BreadcrumbItem>
          <BreadcrumbLink as={RouterLink} to="/">Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink as={RouterLink} to="/figures">Figures</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink as={RouterLink} to={`/figures/${id}`}>{figure.name}</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>Edit</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
      
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Edit Figure</Heading>
        <Button
          leftIcon={<FaArrowLeft />}
          as={RouterLink}
          to={`/figures/${id}`}
          variant="outline"
        >
          Cancel
        </Button>
      </Flex>
      
      <Box bg="white" p={6} borderRadius="lg" shadow="md">
        <FigureForm
          initialData={figure}
          onSubmit={handleSubmit}
          isLoading={mutation.isLoading}
        />
      </Box>
    </Box>
  );
};

export default EditFigure;
