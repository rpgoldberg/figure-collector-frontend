import React, { useState, useEffect } from 'react';
import {
  Box,
  Flex,
  Input,
  Select,
  Button,
  FormControl,
  FormLabel,
  useDisclosure,
  Collapse,
  IconButton,
  SimpleGrid,
} from '@chakra-ui/react';
import { FaFilter, FaTimes } from 'react-icons/fa';
import { useQuery } from 'react-query';
import { getFigureStats } from '../api';

interface FilterValues {
  manufacturer?: string;
  scale?: string;
  location?: string;
  boxNumber?: string;
}

interface FilterBarProps {
  onFilter: (filters: FilterValues) => void;
  initialFilters?: FilterValues;
}

const FilterBar: React.FC<FilterBarProps> = ({ onFilter, initialFilters = {} }) => {
  const { isOpen, onToggle, onClose } = useDisclosure();
  const [filters, setFilters] = useState<FilterValues>(initialFilters);
  
  const { data: stats } = useQuery('figureStats', getFigureStats, {
    enabled: isOpen,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter(filters);
  };

  const handleReset = () => {
    setFilters({});
    onFilter({});
  };

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  return (
    <Box mb={4}>
      <Flex justify="space-between" align="center" mb={2}>
        <Button 
          leftIcon={<FaFilter />} 
          size="sm" 
          variant="ghost" 
          onClick={onToggle}
          color={isOpen ? 'brand.500' : 'gray.500'}
        >
          Filters
        </Button>
        
        {Object.values(filters).some(v => v) && (
          <Button 
            rightIcon={<FaTimes />} 
            size="sm" 
            variant="ghost" 
            onClick={handleReset}
            color="red.500"
          >
            Clear Filters
          </Button>
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity>
        <Box 
          as="form" 
          onSubmit={handleSubmit} 
          p={4} 
          bg="white" 
          borderRadius="md" 
          shadow="sm" 
          mb={4}
        >
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={4}>
            <FormControl>
              <FormLabel fontSize="sm">Manufacturer</FormLabel>
              <Select 
                name="manufacturer" 
                placeholder="All Manufacturers" 
                value={filters.manufacturer || ''}
                onChange={handleInputChange}
                size="sm"
              >
                {stats?.manufacturerStats.map(({ _id, count }) => (
                  <option key={_id} value={_id}>
                    {_id} ({count})
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Scale</FormLabel>
              <Select 
                name="scale" 
                placeholder="All Scales" 
                value={filters.scale || ''}
                onChange={handleInputChange}
                size="sm"
              >
                {stats?.scaleStats.map(({ _id, count }) => (
                  <option key={_id} value={_id}>
                    {_id} ({count})
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Location</FormLabel>
              <Select 
                name="location" 
                placeholder="All Locations" 
                value={filters.location || ''}
                onChange={handleInputChange}
                size="sm"
              >
                {stats?.locationStats.map(({ _id, count }) => (
                  <option key={_id} value={_id}>
                    {_id} ({count})
                  </option>
                ))}
              </Select>
            </FormControl>

            <FormControl>
              <FormLabel fontSize="sm">Box Number</FormLabel>
              <Input 
                name="boxNumber" 
                placeholder="Any box" 
                value={filters.boxNumber || ''}
                onChange={handleInputChange}
                size="sm"
              />
            </FormControl>
          </SimpleGrid>

          <Flex justify="flex-end" mt={4}>
            <Button 
              variant="outline" 
              size="sm" 
              mr={2} 
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              size="sm" 
              colorScheme="brand"
            >
              Apply Filters
            </Button>
          </Flex>
        </Box>
      </Collapse>
    </Box>
  );
};

export default FilterBar;
