import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  const previousMfcLink = useRef<string>('');

  // Debug: Log every render to see what's happening
  console.log('[FRONTEND DEBUG] Component render, mfcLink:', mfcLink);

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
  const handleMFCLinkBlur = useCallback(async () => {
    const currentMfcLink = getValues('mfcLink');
    console.log('[FRONTEND] MFC link blur triggered with:', currentMfcLink);

    if (!currentMfcLink || !currentMfcLink.trim()) {
      console.log('[FRONTEND] No MFC link provided, skipping scrape');
      return;
    }

    if (!currentMfcLink.includes('myfigurecollection.net')) {
      console.log('[FRONTEND] Not an MFC link, skipping scrape');
      return;
    }

    console.log('[FRONTEND] Starting MFC scraping process...');
    setIsScrapingMFC(true);

    try {
      const requestBody = { mfcLink: currentMfcLink };
      console.log('[FRONTEND] Making request to /api/figures/scrape-mfc with body:', requestBody);

      const response = await fetch('/api/figures/scrape-mfc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('[FRONTEND] Response status:', response.status);
      console.log('[FRONTEND] Response headers:', Object.fromEntries(response.headers.entries()));

      const result = await response.json();
      console.log('[FRONTEND] Response data:', result);

      if (!response.ok) {
        console.error('[FRONTEND] Response not ok:', response.status, result);
        toast({
          title: 'Error',
          description: result.message || 'Failed to scrape MFC data',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
        return;
      }

      if (result.success && result.data) {
        const scrapedData = result.data;
        console.log('[FRONTEND] Processing scraped data:', scrapedData);

        // Check if we got a manual extraction indicator
        if (scrapedData.imageUrl && scrapedData.imageUrl.startsWith('MANUAL_EXTRACT:')) {
          console.log('[FRONTEND] Manual extraction required');
          toast({
            title: 'Auto-scraping blocked',
            description: 'MFC has anti-bot protection. Click the link icon to open the page and manually copy the data.',
            status: 'warning',
            duration: 8000,
            isClosable: true,
          });
          return;
        }

        let fieldsPopulated = 0;

        // Only populate empty fields
        if (!getValues('imageUrl') && scrapedData.imageUrl) {
          setValue('imageUrl', scrapedData.imageUrl);
          fieldsPopulated++;
          console.log('[FRONTEND] Set imageUrl:', scrapedData.imageUrl);
        }
        if (!getValues('manufacturer') && scrapedData.manufacturer) {
          setValue('manufacturer', scrapedData.manufacturer);
          fieldsPopulated++;
          console.log('[FRONTEND] Set manufacturer:', scrapedData.manufacturer);
        }
        if (!getValues('name') && scrapedData.name) {
          setValue('name', scrapedData.name);
          fieldsPopulated++;
          console.log('[FRONTEND] Set name:', scrapedData.name);
        }
        if (!getValues('scale') && scrapedData.scale) {
          setValue('scale', scrapedData.scale);
          fieldsPopulated++;
          console.log('[FRONTEND] Set scale:', scrapedData.scale);
        }

        console.log(`[FRONTEND] Populated ${fieldsPopulated} fields from MFC data`);

        if (fieldsPopulated > 0) {
          toast({
            title: 'Success',
            description: `Auto-populated ${fieldsPopulated} fields from MFC!`,
            status: 'success',
            duration: 3000,
            isClosable: true,
          });
        } else {
          toast({
            title: 'Info',
            description: 'No new data found to populate (fields may already be filled)',
            status: 'info',
            duration: 3000,
            isClosable: true,
          });
        }
      } else {
        console.log('[FRONTEND] No valid data in response:', result);
        toast({
          title: 'Warning',
          description: 'No data could be extracted from MFC link',
          status: 'warning',
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error('[FRONTEND] Error scraping MFC data:', error);
      toast({
        title: 'Error',
        description: 'Network error while contacting server',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      console.log('[FRONTEND] MFC scraping process completed');
      setIsScrapingMFC(false);
    }
  }, [getValues, setValue, toast]);

  // Watch for MFC link changes and trigger scraping
  useEffect(() => {
    const currentMfcLink = mfcLink || '';
    console.log('[FRONTEND] useEffect triggered, current link:', currentMfcLink);
    console.log('[FRONTEND] Previous link:', previousMfcLink.current);
    
    // Only trigger if the link actually changed and it's not empty
    if (currentMfcLink !== previousMfcLink.current && 
        currentMfcLink.trim() && 
        currentMfcLink.includes('myfigurecollection.net')) {
      
      console.log('[FRONTEND] MFC link changed, triggering scrape in 1 second...');
      // Add a delay to let user finish typing
      const timer = setTimeout(() => {
        console.log('[FRONTEND] Executing delayed scrape');
        handleMFCLinkBlur();
      }, 1000);
      
      return () => {
        console.log('[FRONTEND] Cleaning up timer');
        clearTimeout(timer);
      };
    }
    
    previousMfcLink.current = currentMfcLink;
  }, [mfcLink, handleMFCLinkBlur]);

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
                    validate: validateUrl
                  })}
                  placeholder="https://myfigurecollection.net/item/..."
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
                Click the link icon to open MFC page, then manually copy data if auto-population fails
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
