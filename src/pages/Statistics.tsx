import React from 'react';
import { useQuery } from 'react-query';
import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  Spinner,
  Center,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Flex,
  IconButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Divider,
} from '@chakra-ui/react';
import { FaDownload } from 'react-icons/fa';
import { getFigureStats } from '../api';

const Statistics: React.FC = () => {
  const { data: stats, isLoading, error } = useQuery('figureStats', getFigureStats) || { data: null, isLoading: false, error: null };

  const downloadCsv = () => {
    if (!stats) return;
    
    // Prepare CSV content
    const headers = ["Category", "Value", "Count"];
    const rows = [
      ...stats.manufacturerStats.map((s) => ["Manufacturer", s._id, s.count]),
      ...stats.scaleStats.map((s) => ["Scale", s._id, s.count]),
      ...stats.locationStats.map((s) => ["Location", s._id, s.count]),
    ];
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create a download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'figure_statistics.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <Center h="50vh">
        <Spinner size="xl" color="brand.500" thickness="4px" />
      </Center>
    );
  }

  if (error || !stats) {
    return (
      <Box textAlign="center" py={10}>
        <Heading size="md" color="red.500">
          Error loading statistics
        </Heading>
        <Text mt={4}>Please try again later</Text>
      </Box>
    );
  }

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading size="lg">Collection Statistics</Heading>
        <IconButton
          aria-label="Download statistics as CSV"
          icon={<FaDownload />}
          onClick={downloadCsv}
          colorScheme="brand"
          variant="outline"
        />
      </Flex>
      
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={10}>
        <Stat
          bg="white"
          p={6}
          shadow="sm"
          borderRadius="lg"
          textAlign="center"
        >
          <StatLabel fontSize="lg">Total Figures</StatLabel>
          <StatNumber fontSize="5xl" fontWeight="bold" color="brand.500">
            {stats.totalCount}
          </StatNumber>
          <StatHelpText>In your collection</StatHelpText>
        </Stat>
        
        <Stat
          bg="white"
          p={6}
          shadow="sm"
          borderRadius="lg"
          textAlign="center"
        >
          <StatLabel fontSize="lg">Manufacturers</StatLabel>
          <StatNumber fontSize="5xl" fontWeight="bold" color="purple.500">
            {stats.manufacturerStats.length}
          </StatNumber>
          <StatHelpText>Different brands</StatHelpText>
        </Stat>
        
        <Stat
          bg="white"
          p={6}
          shadow="sm"
          borderRadius="lg"
          textAlign="center"
        >
          <StatLabel fontSize="lg">Scales</StatLabel>
          <StatNumber fontSize="5xl" fontWeight="bold" color="green.500">
            {stats.scaleStats.length}
          </StatNumber>
          <StatHelpText>Different sizes</StatHelpText>
        </Stat>
      </SimpleGrid>
      
      <SimpleGrid columns={{ base: 1, lg: 3 }} spacing={8}>
        <Box bg="white" p={5} shadow="sm" borderRadius="lg">
          <Heading size="md" mb={4}>Manufacturers</Heading>
          <Divider mb={4} />
          
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Manufacturer</Th>
                  <Th isNumeric>Count</Th>
                  <Th isNumeric>Percentage</Th>
                </Tr>
              </Thead>
              <Tbody>
                {stats.manufacturerStats.map((stat) => (
                  <Tr key={stat._id}>
                    <Td>{stat._id}</Td>
                    <Td isNumeric>{stat.count}</Td>
                    <Td isNumeric>
                      {((stat.count / stats.totalCount) * 100).toFixed(1)}%
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
        
        <Box bg="white" p={5} shadow="sm" borderRadius="lg">
          <Heading size="md" mb={4}>Scales</Heading>
          <Divider mb={4} />
          
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Scale</Th>
                  <Th isNumeric>Count</Th>
                  <Th isNumeric>Percentage</Th>
                </Tr>
              </Thead>
              <Tbody>
                {stats.scaleStats.map((stat) => (
                  <Tr key={stat._id}>
                    <Td>{stat._id}</Td>
                    <Td isNumeric>{stat.count}</Td>
                    <Td isNumeric>
                      {((stat.count / stats.totalCount) * 100).toFixed(1)}%
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
        
        <Box bg="white" p={5} shadow="sm" borderRadius="lg">
          <Heading size="md" mb={4}>Storage Locations</Heading>
          <Divider mb={4} />
          
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Location</Th>
                  <Th isNumeric>Count</Th>
                  <Th isNumeric>Percentage</Th>
                </Tr>
              </Thead>
              <Tbody>
                {stats.locationStats.map((stat) => (
                  <Tr key={stat._id}>
                    <Td>{stat._id}</Td>
                    <Td isNumeric>{stat.count}</Td>
                    <Td isNumeric>
                      {((stat.count / stats.totalCount) * 100).toFixed(1)}%
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </Box>
      </SimpleGrid>
    </Box>
  );
};

export default Statistics;
