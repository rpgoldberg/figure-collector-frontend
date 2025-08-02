import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  VStack,
  Grid,
  GridItem,
  InputGroup,
  InputRightElement,
  IconButton,
  Tooltip,
  Text,
  useToast,
  Spinner,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { FaLink, FaQuestionCircle, FaImage } from 'react-icons/fa';
import { Figure, FigureFormData } from '../types';

interface FigureFormProps {
  initialData?: Figure;
  onSubmit: (data: FigureFormData) => void;
  isLoading: boolean;
}

const FigureForm: React.FC<FigureFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const [isScrapingMFC, setIsScrapingMFC] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues,
  } = useForm<FigureFormData>({
    defaultValues: initialData || {
      manufacturer: '',
      name: '',
      scale: '',
      mfcLink: '',
      location: '',
      boxNumber: '',
      imageUrl: '',
    },
  });

  const toast = useToast();
  const mfcLink = watch('mfcLink');
  const imageUrl = watch('imageUrl');

  const openMfcLink = () => {
    if (mfcLink) {
      window.open(mfcLink, '_blank');
    }
  };

  const openImageLink = () => {
    if (imageUrl) {
      window.open(imageUrl, '_blank');
    }
  };

  const validateUrl = (value: string | undefined) => {
    if (!value) return true;
    
    try {
      new URL(value);
      return true;
    } catch (e) {
      return 'Please enter a valid URL';
    }
  };

  const formatScale = (input: string) => {
    // Convert to fraction format (e.g., 1/8, 1/7, etc.)
    if (!input.includes('/')) {
      const num = parseFloat(input);
      if (!isNaN(num) && num > 0 && num <= 1) {
        return `1/${Math.round(1 / num)}`;
      }
    }
    return input;
  };

  const handleScaleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const formattedScale = formatScale(e.target.value);
    setValue('scale', formattedScale);
  };

  // Function to scrape MFC data and populate fields
  const handleMFCLinkBlur = async () => {
    const currentMfcLink = getValues('mfcLink');

    if (!currentMfcLink || !currentMfcLink.trim() || !currentMfcLink.includes('myfigurecollection.net')) {
      return;
    }

    setIsScrapingMFC(true);

    try {
      const response = await fetch('/api/figures/scrape-mfc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` // Adjust based on your auth setup
        },
        body: JSON.stringify({ mfcLink: currentMfcLink })
      });

      const result = await response.json();

      if (result.success && result.data) {
        const scrapedData = result.data;

        // Only populate empty fields
        if (!getValues('imageUrl') && scrapedData.imageUrl) {
          setValue('imageUrl', scrapedData.imageUrl);
        }
        if (!getValues('manufacturer') && scrapedData.manufacturer) {
          setValue('manufacturer', scrapedData.manufacturer);
        }
        if (!getValues('name') && scrapedData.name) {
          setValue('name', scrapedData.name);
        }
        if (!getValues('scale') && scrapedData.scale) {
          setValue('scale', scrapedData.scale);
        }

        toast({
          title: 'Success',
          description: 'Auto-populated fields from MFC!',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('Error scraping MFC data:', error);
      toast({
        title: 'Warning',
        description: 'Could not auto-populate from MFC link',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsScrapingMFC(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit(onSubmit)}>
      <VStack spacing={6} align="stretch">
        <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }} gap={6}>
          <GridItem>
            <FormControl isInvalid={!!errors.manufacturer}>
              <FormLabel>Manufacturer</FormLabel>
              <Input
                {...register('manufacturer', { required: 'Manufacturer is required' })}
                placeholder="e.g., Good Smile Company"
              />
              <FormErrorMessage>{errors.manufacturer?.message}</FormErrorMessage>
            </FormControl>
          </GridItem>

          <GridItem>
            <FormControl isInvalid={!!errors.name}>
              <FormLabel>Figure Name</FormLabel>
              <Input
                {...register('name', { required: 'Figure name is required' })}
                placeholder="e.g., Nendoroid Miku Hatsune"
              />
              <FormErrorMessage>{errors.name?.message}</FormErrorMessage>
            </FormControl>
          </GridItem>

          <GridItem>
            <FormControl isInvalid={!!errors.scale}>
              <FormLabel>
                Scale
                <Tooltip label="Common scales: 1/8, 1/7, 1/6 for scale figures, or enter 'Nendoroid', 'Figma', etc.">
                  <IconButton
                    aria-label="Scale info"
                    icon={<FaQuestionCircle />}
                    size="xs"
                    variant="ghost"
                    ml={1}
                  />
                </Tooltip>
              </FormLabel>
              <Input
                {...register('scale')} //optional
                placeholder="e.g., 1/8, 1/7, Nendoroid"
                onBlur={handleScaleBlur}
              />
              <FormErrorMessage>{errors.scale?.message}</FormErrorMessage>
            </FormControl>
          </GridItem>

          <GridItem>
            <FormControl isInvalid={!!errors.mfcLink}>
              <FormLabel>MyFigureCollection Link</FormLabel>
              <InputGroup>
                <Input
                  {...register('mfcLink', {
                    validate: validateUrl,
                  })}
                  placeholder="https://myfigurecollection.net/item/..."
		  onBlur={handleMFCLinkBlur} // Add blur handler
                />
                <InputRightElement>
		  {isScrapingMFC ? (
                    <Spinner size="sm" />
		  ) : (
                    <IconButton
                      aria-label="Open MFC link"
                      icon={<FaLink />}
                      size="sm"
                      variant="ghost"
                      onClick={openMfcLink}
                      isDisabled={!mfcLink}
                    />
		  )}
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{errors.mfcLink?.message}</FormErrorMessage>
              <Text fontSize="xs" color="gray.500" mt={1}>
                Auto-populates empty fields when you paste an MFC link
              </Text>
            </FormControl>
          </GridItem>

          <GridItem>
            <FormControl isInvalid={!!errors.location}>
              <FormLabel>Storage Location</FormLabel>
              <Input
                {...register('location')} //optional
                placeholder="e.g., Shelf, Display Case, Storage Room"
              />
              <FormErrorMessage>{errors.location?.message}</FormErrorMessage>
            </FormControl>
          </GridItem>

          <GridItem>
            <FormControl isInvalid={!!errors.boxNumber}>
              <FormLabel>Box Number/ID</FormLabel>
              <Input
                {...register('boxNumber')} //optional
                placeholder="e.g., A1, Box 3"
              />
              <FormErrorMessage>{errors.boxNumber?.message}</FormErrorMessage>
            </FormControl>
          </GridItem>

          <GridItem colSpan={{ base: 1, md: 2 }}>
            <FormControl isInvalid={!!errors.imageUrl}>
              <FormLabel>Image URL (Optional)</FormLabel>
              <InputGroup>
                <Input
                  {...register('imageUrl', {
                    validate: validateUrl,
                  })}
                  placeholder="https://example.com/image.jpg"
                />
                <InputRightElement>
                  <IconButton
                    aria-label="Open image link"
                    icon={<FaImage />}
                    size="sm"
                    variant="ghost"
                    onClick={openImageLink}
                    isDisabled={!imageUrl}
                  />
                </InputRightElement>
              </InputGroup>
              <FormErrorMessage>{errors.imageUrl?.message}</FormErrorMessage>
              <Text fontSize="xs" color="gray.500" mt={1}>
                Leave blank to auto-fetch from MFC
              </Text>
            </FormControl>
          </GridItem>
        </Grid>

        <Button
          mt={4}
          colorScheme="brand"
          isLoading={isLoading}
          type="submit"
          size="lg"
        >
          {initialData ? 'Update Figure' : 'Add Figure'}
        </Button>
      </VStack>
    </Box>
  );
};

export default FigureForm;
