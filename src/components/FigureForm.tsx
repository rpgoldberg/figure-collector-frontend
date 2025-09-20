import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createLogger } from '../utils/logger';
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
  Image,
} from '@chakra-ui/react';
import { useForm } from 'react-hook-form';
import { FaLink, FaQuestionCircle, FaImage } from 'react-icons/fa';
import { Figure, FigureFormData } from '../types';


interface FigureFormProps {
  initialData?: Figure;
  onSubmit: (data: FigureFormData) => void;
  isLoading: boolean;
}

const logger = createLogger('FIGURE_FORM');

const FigureForm: React.FC<FigureFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const [isScrapingMFC, setIsScrapingMFC] = useState(false);
  const [imageError, setImageError] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    getValues,
    reset,
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

  // Optimized refs for stable references and operation management
  const previousMfcLink = useRef<string>('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentScrapeController = useRef<AbortController | null>(null);
  const isScrapingRef = useRef(false);
  const lastScrapePromise = useRef<Promise<void> | null>(null);
  const mountedRef = useRef(true);

  // Debug: Log every render to see what's happening (commented out to reduce noise)
  // console.log('[FRONTEND DEBUG] Component render, mfcLink:', mfcLink);

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
    console.log('Validating URL:', value);
    if (!value) return true;
    
    try {
      const url = new URL(value);
      console.log('URL Details:', {
        protocol: url.protocol,
        hostname: url.hostname,
        pathname: url.pathname,
        search: url.search
      });
      // More rigorous checks
      if (!['http:', 'https:'].includes(url.protocol)) {
        console.log('Invalid protocol');
        return 'URL must use http or https';
      }
      // Ensure the URL has a domain with at least two parts
      const hostParts = url.hostname.split('.');
      if (hostParts.length < 2 || hostParts.some(part => part.length === 0)) {
        console.log('Invalid domain');
        return 'Please enter a valid URL with a domain';
      }
      return true;
    } catch (e) {
      console.log('URL validation error:', e);
      return 'Please enter a valid URL';
    }
  };

  const validateMfcUrl = (value: string | undefined) => {
    if (!value) return true;

    // First check if it's a valid URL
    const urlValidation = validateUrl(value);
    if (urlValidation !== true) return urlValidation;

    // Accept http/https and optional trailing slash or minor path/query fragments after the numeric id
    const mfcPattern = /^https?:\/\/(?:www\.)?myfigurecollection\.net\/item\/\d+(?:\/.*)?$/i;
    if (!mfcPattern.test(value)) {
      return 'Please enter a valid MFC URL like https://myfigurecollection.net/item/123456';
    }

    return true;
  };

  // Conditional validation for name and manufacturer based on mfcLink presence
  const validateName = (value: string | undefined) => {
    const mfcLinkValue = getValues('mfcLink');
    if (mfcLinkValue && mfcLinkValue.trim()) {
      // If MFC link is present, name can be empty (will be populated from scraping)
      return true;
    }
    // Otherwise, name is required
    if (!value || !value.trim()) {
      return 'Figure name is required';
    }
    return true;
  };

  const validateManufacturer = (value: string | undefined) => {
    const mfcLinkValue = getValues('mfcLink');
    if (mfcLinkValue && mfcLinkValue.trim()) {
      // If MFC link is present, manufacturer can be empty (will be populated from scraping)
      return true;
    }
    // Otherwise, manufacturer is required
    if (!value || !value.trim()) {
      return 'Manufacturer is required';
    }
    return true;
  };
  const formatScale = (input: string) => {
    // Convert to fraction format (e.g., 1/8, 1/7, etc.)
    if (!input.includes('/')) {
      const num = parseFloat(input);
      if (!isNaN(num) && num > 0 && num <= 1) {
        return `1/${Math.round(1 / num)}`;
      }
      // Preserve non-numeric inputs like 'Nendoroid'
      if (isNaN(num)) {
        return input;
      }
    }
    return input;
  };

  const handleScaleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const formattedScale = formatScale(e.target.value);
    setValue('scale', formattedScale);
  };

  // Optimized function to scrape MFC data with proper async queuing and cleanup
  const handleMFCLinkBlur = useCallback(async (targetMfcLink?: string) => {
    const currentMfcLink = targetMfcLink || getValues('mfcLink');
    if (!currentMfcLink?.trim()) return;

    const mfcPattern = /^https?:\/\/(?:www\.)?myfigurecollection\.net\/item\/\d+(?:\/.*)?$/i;
    if (!mfcPattern.test(currentMfcLink)) return;

    if (currentScrapeController.current) {
      currentScrapeController.current.abort();
    }

    if (isScrapingRef.current && lastScrapePromise.current) {
      try { await lastScrapePromise.current; } catch {}
    }

    setIsScrapingMFC(true);
    isScrapingRef.current = true;

    const controller = new AbortController();
    currentScrapeController.current = controller;

    const scrapePromise = (async () => {
      try {
        const requestBody = { mfcLink: currentMfcLink };
        console.log('[FRONTEND] Making request to /api/figures/scrape-mfc with body:', requestBody);

        const response = await fetch('/api/figures/scrape-mfc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mfcLink: currentMfcLink }),
          signal: controller.signal
        });

        if (controller.signal.aborted) return;
        const result = await response.json();
        
        if (!response.ok) {
          if (mountedRef.current) {
            toast({
              title: 'Error',
              description: result.message || 'Failed to scrape MFC data',
              status: 'error',
              duration: 5000,
              isClosable: true,
            });
          }
          return;
        }

        if (result.success && result.data) {
          let fieldsPopulated = 0;
          const currentValues = getValues();
          
          if (!currentValues.imageUrl && result.data.imageUrl) {
            setValue('imageUrl', result.data.imageUrl, { shouldValidate: true, shouldDirty: true });
            fieldsPopulated++;
          }
          if (!currentValues.manufacturer && result.data.manufacturer) {
            setValue('manufacturer', result.data.manufacturer, { shouldValidate: true, shouldDirty: true });
            fieldsPopulated++;
          }
          if (!currentValues.name && result.data.name) {
            setValue('name', result.data.name, { shouldValidate: true, shouldDirty: true });
            fieldsPopulated++;
          }
          if (!currentValues.scale && result.data.scale) {
            setValue('scale', result.data.scale, { shouldValidate: true, shouldDirty: true });
            fieldsPopulated++;
          }

          if (mountedRef.current) {
            toast({
              title: fieldsPopulated > 0 ? 'Success' : 'Info',
              description: fieldsPopulated > 0
                ? `Auto-populated ${fieldsPopulated} fields from MFC!`
                : 'No new data found to populate (fields may already be filled)',
              status: fieldsPopulated > 0 ? 'success' : 'info',
              duration: 3000,
              isClosable: true,
            });
          }
        } else if (mountedRef.current) {
          toast({
            title: 'Warning',
            description: 'No data could be extracted from MFC link',
            status: 'warning',
            duration: 3000,
            isClosable: true,
          });
        }
      } catch (error: any) {
        if (error?.name === 'AbortError') return;
        if (mountedRef.current) {
          toast({
            title: 'Error',
            description: 'Network error while contacting server',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      } finally {
        if (mountedRef.current) {
          setIsScrapingMFC(false);
        }
        isScrapingRef.current = false;
        if (currentScrapeController.current === controller) {
          currentScrapeController.current = null;
        }
      }
    })();

    lastScrapePromise.current = scrapePromise;
    return scrapePromise;
  }, [getValues, setValue, toast]);

  // Optimized useEffect for MFC link changes with stable dependencies
  useEffect(() => {
    const currentMfcLink = mfcLink || '';

    // Skip if no actual change
    if (currentMfcLink === previousMfcLink.current) {
      return;
    }


    // Clear any existing debounce timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
      debounceTimer.current = null;
    }

    // Only trigger if the link is valid and non-empty
    const mfcPattern = /^https?:\/\/(?:www\.)?myfigurecollection\.net\/item\/\d+(?:\/.*)?$/i;
    if (typeof currentMfcLink === 'string' && currentMfcLink.trim() && mfcPattern.test(currentMfcLink)) {

      // Use optimized debounce with stable timer management
      debounceTimer.current = setTimeout(async () => {
        logger.verbose('Debounce timer executed');
        // Capture current values to avoid stale closure
        const linkToScrape = currentMfcLink;
        const currentFormValues = getValues();

        // Only proceed if the link hasn't changed since timer was set
        if (linkToScrape === currentFormValues.mfcLink) {
          logger.verbose('Link unchanged, calling handleMFCLinkBlur');
          await handleMFCLinkBlur(linkToScrape);
        } else {
          logger.verbose('Link changed during debounce, skipping scrape');
        }
        debounceTimer.current = null;
      }, 1000);
    }

    previousMfcLink.current = currentMfcLink;

    // Cleanup function
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        debounceTimer.current = null;
      }
    };
  }, [mfcLink, handleMFCLinkBlur, getValues]); // Include dependencies for stable behavior

  // Reset image error when imageUrl changes
  useEffect(() => {
    setImageError(false);
  }, [imageUrl]);

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      reset({
        manufacturer: '',
        name: '',
        scale: '',
        mfcLink: '',
        location: '',
        boxNumber: '',
        imageUrl: '',
      });
    }
  }, [initialData, reset]);

  // Cleanup effect for component unmount and pending operations
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // Cancel any pending scrape operations
      if (currentScrapeController.current) {
        currentScrapeController.current.abort();
      }

      // Clear any pending debounce timers
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Reset refs
      isScrapingRef.current = false;
      currentScrapeController.current = null;
      debounceTimer.current = null;
      lastScrapePromise.current = null;
    };
  }, []);

  return (
    <Box as="form" onSubmit={handleSubmit((data) => onSubmit(data))} role="form" aria-labelledby="figure-form-title">
      <VStack spacing={6} align="stretch">
        <Text id="figure-form-title" fontSize="xl" fontWeight="bold" className="sr-only">
          {initialData ? 'Edit Figure Form' : 'Add Figure Form'}
        </Text>
        <Text fontSize="sm" color="gray.600" mb={4} aria-describedby="form-instructions">
          Fill out the form below to {initialData ? 'update' : 'add'} a figure to your collection.
          {mfcLink ? ' The form will auto-populate data from the MFC link.' : ''}
        </Text>
        <Text id="form-instructions" className="sr-only">
          Required fields are marked with an asterisk. You can provide an MFC link to auto-populate figure data.
        </Text>
        {/* MFC Link at top - full width */}
        <FormControl isInvalid={!!errors.mfcLink}>
          <FormLabel>MyFigureCollection Link</FormLabel>
          <InputGroup>
            <Input
              {...register('mfcLink', {
                validate: validateMfcUrl
              })}
              placeholder="https://myfigurecollection.net/item/123456"
              data-invalid={!!errors.mfcLink}
            />
            <InputRightElement>
       {isScrapingMFC ? (
                <Spinner size="sm" data-testid="mfc-scraping-spinner" />
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
          <FormErrorMessage data-testid="form-error-message">{errors.mfcLink?.message}</FormErrorMessage>
          <Text fontSize="xs" color="gray.500" mt={1}>
            Click the link icon to open MFC page, then manually copy data if auto-population fails
          </Text>
        </FormControl>

        <Grid templateColumns={{ base: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' }} gap={6}>
          <GridItem>
            <FormControl isInvalid={!!errors.manufacturer}>
              <FormLabel>
                Manufacturer
                {!mfcLink && <Text as="span" color="red.500" ml={1} aria-label="required">*</Text>}
              </FormLabel>
              <Input
                {...register('manufacturer', { validate: validateManufacturer })}
                placeholder="e.g., Good Smile Company"
                aria-describedby={errors.manufacturer ? "manufacturer-error" : undefined}
              />
              <FormErrorMessage id="manufacturer-error" data-testid="form-error-message">{errors.manufacturer?.message}</FormErrorMessage>
            </FormControl>
          </GridItem>

          <GridItem>
            <FormControl isInvalid={!!errors.name}>
              <FormLabel>
                Figure Name
                {!mfcLink && <Text as="span" color="red.500" ml={1} aria-label="required">*</Text>}
              </FormLabel>
              <Input
                {...register('name', { validate: validateName })}
                placeholder="e.g., Nendoroid Miku Hatsune"
                aria-describedby={errors.name ? "name-error" : undefined}
              />
              <FormErrorMessage id="name-error" data-testid="form-error-message">{errors.name?.message}</FormErrorMessage>
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
              {imageUrl && (
                <Box mt={4} p={4} border="1px" borderColor="gray.200" borderRadius="md">
                  <Text fontSize="sm" fontWeight="semibold" mb={2}>Image Preview:</Text>
                  <Box 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="center" 
                    maxH="300px" 
                    bg="gray.50"
                    borderRadius="md"
                    overflow="hidden"
                  >
                    {imageError ? (
                      <Text color="gray.500">Failed to load image</Text>
                    ) : (
                      <Image
                        src={imageUrl}
                        alt="Figure preview"
                        maxH="100%"
                        maxW="100%"
                        objectFit="contain"
                        onError={() => setImageError(true)}
                      />
                    )}
                  </Box>
                </Box>
              )}
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
