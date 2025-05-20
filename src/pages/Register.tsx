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
import { registerUser } from '../api';
import { useAuthStore } from '../stores/authStore';

interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = React.useState(false);
  const { setUser } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });
  
  const password = watch('password');
  
  const mutation = useMutation(
    (data: RegisterFormData) => registerUser(data.username, data.email, data.password),
    {
      onSuccess: (userData) => {
        setUser(userData);
        toast({
          title: 'Success',
          description: 'Account created successfully!',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        navigate('/');
      },
      onError: (error: any) => {
        toast({
          title: 'Error',
          description: error.response?.data?.message || 'Registration failed',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      },
    }
  );

  const onSubmit = (data: RegisterFormData) => {
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
            Create an account to start your collection
          </Text>
        </Flex>
        
        <Box as="form" onSubmit={handleSubmit(onSubmit)}>
          <FormControl isInvalid={!!errors.username} mb={4}>
            <FormLabel>Username</FormLabel>
            <Input
              placeholder="Choose a username"
              size="lg"
              {...register('username', {
                required: 'Username is required',
                minLength: {
                  value: 3,
                  message: 'Username must be at least 3 characters',
                },
              })}
            />
            <FormErrorMessage>{errors.username?.message}</FormErrorMessage>
          </FormControl>
          
          <FormControl isInvalid={!!errors.email} mb={4}>
            <FormLabel>Email</FormLabel>
            <Input
              type="email"
              placeholder="Your email address"
              size="lg"
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
          
          <FormControl isInvalid={!!errors.password} mb={4}>
            <FormLabel>Password</FormLabel>
            <InputGroup>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                size="lg"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
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
          
          <FormControl isInvalid={!!errors.confirmPassword} mb={6}>
            <FormLabel>Confirm Password</FormLabel>
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              size="lg"
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === password || 'Passwords do not match',
              })}
            />
            <FormErrorMessage>{errors.confirmPassword?.message}</FormErrorMessage>
          </FormControl>
          
          <Button
            type="submit"
            colorScheme="brand"
            size="lg"
            width="full"
            isLoading={mutation.isLoading}
            mb={4}
          >
            Create Account
          </Button>
          
          <Text textAlign="center">
            Already have an account?{' '}
            <Link as={RouterLink} to="/login" color="brand.500">
              Sign In
            </Link>
          </Text>
        </Box>
      </Box>
    </Flex>
  );
};

export default Register;
