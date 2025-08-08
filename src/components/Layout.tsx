import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Text, Flex } from '@chakra-ui/react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  const [versionInfo, setVersionInfo] = useState<any>(null);

  useEffect(() => {
    // Fetch version info on app load
    fetch('/version')
      .then(res => res.json())
      .then(data => {
        setVersionInfo(data);
        // Console log for developers
        console.log(`App v${data.application?.version || 'unknown'}, Backend v${data.services?.backend?.version || 'unknown'}, Scraper v${data.services?.scraper?.version || 'unknown'}`);
      })
      .catch(err => console.error('Failed to fetch version info:', err));
  }, []);

  return (
    <Box minH="100vh" display="flex" flexDirection="column">
      <Navbar />
      <Container maxW="container.xl" pt={5} pb={10} flex="1">
        <Box display="flex" gap={5}>
          <Box w="250px" display={{ base: 'none', md: 'block' }}>
            <Sidebar />
          </Box>
          <Box flex="1">
            <Outlet />
          </Box>
        </Box>
      </Container>
      
      {/* Footer with version info */}
      <Box as="footer" py={4} borderTop="1px" borderColor="gray.200" bg="gray.50">
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <Text fontSize="sm" color="gray.600">
              Figure Collector
            </Text>
            {versionInfo && (
              <Text fontSize="xs" color="gray.500">
                v{versionInfo.application?.version || 'unknown'} • {versionInfo.application?.releaseDate || 'unknown'}
              </Text>
            )}
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
