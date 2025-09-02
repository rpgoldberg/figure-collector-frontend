import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useMutation } from 'react-query';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Heading,
  Text,
  Flex,
  Link,
  Icon,
  InputGroup,
  InputRightElement,
  useToast,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { FaEye, FaEyeSlash, FaCube } from 'react-icons/fa';
import { loginUser } from '../api';
import { useAuthStore } from '../stores/authStore';

interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const { setUser } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  const mutation = useMutation(
    (data: LoginFormData) => loginUser(data.email, data.password),
    {
      onSuccess: (userData) => {
        setUser(userData);
        toast({
          title: 'Success',
          description: 'You are now logged in!',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        navigate('/');
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Invalid email or password',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      },
    }
  );

  const onSubmit = (data: LoginFormData) => {
    mutation.mutate(data);
  };

  return (
    <Flex minH="100vh" align="center" justify="center" bg="gray.50">
      <Box
        bg="white"
        p={8}
        rounded="lg"
        shadow="lg"
        maxW="md"
        w="full"
      >
        <Flex direction="column" align="center" mb={8}>
          <Icon as={FaCube} boxSize={12} color="brand.500" mb={2} />
          <Heading size="xl" textAlign="center" color="gray.800">
            FigureCollector
          </Heading>
          <Text color="gray.600" mt={2}>
            Sign in to manage your collection
          </Text>
        </Flex>
        
        <Box as="form" role="form" onSubmit={handleSubmit(onSubmit)}>
          <FormControl isInvalid={!!errors.email} mb={4}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              placeholder="Your email address"
              size="lg"
              autoComplete="email"
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />
            <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
          </FormControl>
          
          <FormControl isInvalid={!!errors.password} mb={6}>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Your password"
                size="lg"
                autoComplete="current-password"
                {...register('password', {
                  required: 'Password is required',
                })}
              />
              <InputRightElement h="full">
                <Button
                  variant="ghost"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <Icon
                    as={showPassword ? FaEyeSlash : FaEye}
                    color="gray.500"
                  />
                </Button>
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
          </FormControl>
          
          <Button
            type="submit"
            colorScheme="brand"
            size="lg"
            width="full"
            isLoading={mutation.isLoading}
            mb={4}
          >
            Sign In
          </Button>
          
          <Text textAlign="center">
            Don't have an account?{' '}
            <Link as={RouterLink} to="/register" color="brand.500">
              Register
            </Link>
          </Text>
        </Box>
      </Box>
    </Flex>
  );
};

export default Login;
