import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Icon,
  Button,
  Flex,
  Text,
  Divider,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { FaCube, FaPlus, FaSearch, FaChartBar, FaBoxOpen } from 'react-icons/fa';
import { useQuery } from 'react-query';
import { getFigures, getFigureStats } from '../api';
import FigureCard from '../components/FigureCard';
import SearchBar from '../components/SearchBar';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  const { data: figuresData } = useQuery('recentFigures', () => getFigures(1, 4));
  const { data: statsData } = useQuery('dashboardStats', getFigureStats);
  
  const handleSearch = (query: string) => {
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <Box>
      <Heading size="lg" mb={6}>Dashboard</Heading>
      
      <Box mb={8}>
        <SearchBar onSearch={handleSearch} placeholder="Search your entire collection..." />
      </Box>
      
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={5} mb={8}>
        <Stat
          bg="white"
          p={5}
          shadow="sm"
          borderRadius="lg"
          borderLeft="4px solid"
          borderLeftColor="brand.500"
        >
          <StatLabel>Total Figures</StatLabel>
          <Flex align="center" mt={2}>
            <Icon as={FaCube} color="brand.500" boxSize={6} mr={2} />
            <StatNumber>{statsData?.totalCount || 0}</StatNumber>
          </Flex>
          <StatHelpText>In your collection</StatHelpText>
        </Stat>
        
        <Stat
          bg="white"
          p={5}
          shadow="sm"
          borderRadius="lg"
          borderLeft="4px solid"
          borderLeftColor="purple.500"
        >
          <StatLabel>Manufacturers</StatLabel>
          <Flex align="center" mt={2}>
            <Icon as={FaBoxOpen} color="purple.500" boxSize={6} mr={2} />
            <StatNumber>{statsData?.manufacturerStats.length || 0}</StatNumber>
          </Flex>
          <StatHelpText>Different brands</StatHelpText>
        </Stat>
        
        <Stat
          bg="white"
          p={5}
          shadow="sm"
          borderRadius="lg"
          borderLeft="4px solid"
          borderLeftColor="green.500"
        >
          <StatLabel>Scales</StatLabel>
          <Flex align="center" mt={2}>
            <Icon as={FaChartBar} color="green.500" boxSize={6} mr={2} />
            <StatNumber>{statsData?.scaleStats.length || 0}</StatNumber>
          </Flex>
          <StatHelpText>Different sizes</StatHelpText>
        </Stat>
        
        <Stat
          bg="white"
          p={5}
          shadow="sm"
          borderRadius="lg"
          borderLeft="4px solid"
          borderLeftColor="orange.500"
        >
          <StatLabel>Locations</StatLabel>
          <Flex align="center" mt={2}>
            <Icon as={FaSearch} color="orange.500" boxSize={6} mr={2} />
            <StatNumber>{statsData?.locationStats.length || 0}</StatNumber>
          </Flex>
          <StatHelpText>Storage areas</StatHelpText>
        </Stat>
      </SimpleGrid>
      
      <Grid templateColumns={{ base: '1fr', lg: '2fr 1fr' }} gap={6}>
        <GridItem>
          <Box bg="white" p={5} shadow="sm" borderRadius="lg">
            <Flex justify="space-between" align="center" mb={4}>
              <Heading size="md">Recent Figures</Heading>
              <Button 
                as={RouterLink} 
                to="/figures" 
                variant="outline" 
                size="sm"
                aria-label="View All Figures"
              >
                View All
              </Button>
            </Flex>
            
            <Divider mb={4} />
            
            {figuresData?.data.length === 0 ? (
              <Flex direction="column" align="center" justify="center" py={8}>
                <Text color="gray.500" mb={4}>You haven't added any figures yet.</Text>
                <Button 
                  as={RouterLink} 
                  to="/figures/add" 
                  leftIcon={<FaPlus />} 
                  colorScheme="brand"
                >
                  Add Your First Figure
                </Button>
              </Flex>
            ) : (
              <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                {figuresData?.data.map((figure) => (
                  <FigureCard key={figure._id} figure={figure} />
                ))}
              </SimpleGrid>
            )}
          </Box>
        </GridItem>
        
        <GridItem>
          <Box bg="white" p={5} shadow="sm" borderRadius="lg" height="100%">
            <Heading size="md" mb={4}>Top Manufacturers</Heading>
            <Divider mb={4} />
            
            {!statsData?.manufacturerStats.length ? (
              <Text color="gray.500" textAlign="center" py={8}>
                No manufacturer data available.
              </Text>
            ) : (
              <Box>
                {statsData.manufacturerStats.slice(0, 5).map((stat) => (
                  <Flex key={stat._id} justify="space-between" py={2}>
                    <Text>{stat._id}</Text>
                    <Text fontWeight="bold">{stat.count}</Text>
                  </Flex>
                ))}
                
                <Button 
                  as={RouterLink} 
                  to="/statistics" 
                  variant="outline" 
                  size="sm" 
                  width="100%" 
                  mt={4}
                  aria-label="View Detailed Figure Statistics"
                >
                  View All Statistics
                </Button>
              </Box>
            )}
          </Box>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default Dashboard;
