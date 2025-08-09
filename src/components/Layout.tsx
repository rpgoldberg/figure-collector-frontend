import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Text, Flex, Popover, PopoverTrigger, PopoverContent, PopoverBody, VStack, Badge, HStack } from '@chakra-ui/react';
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
        console.log(`App v${data.application?.version || 'unknown'}, Frontend v${data.services?.frontend?.version || 'unknown'}, Backend v${data.services?.backend?.version || 'unknown'}, Scraper v${data.services?.scraper?.version || 'unknown'}`);
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
              <Popover trigger="hover" placement="top-end">
                <PopoverTrigger>
                  <Text fontSize="xs" color="gray.500" cursor="pointer" _hover={{ color: "gray.700" }}>
                    v{versionInfo.application?.version || 'unknown'} • {versionInfo.application?.releaseDate || 'unknown'}
                  </Text>
                </PopoverTrigger>
                <PopoverContent width="auto" maxW="400px">
                  <PopoverBody>
                    <VStack align="start" spacing={2}>
                      <Text fontWeight="semibold" fontSize="sm">Service Versions</Text>
                      <VStack align="start" spacing={1} fontSize="xs">
                        <HStack>
                          <Text minW="70px">Frontend:</Text>
                          <Badge colorScheme={versionInfo.services?.frontend?.status === 'ok' ? 'green' : 'red'} size="sm">
                            v{versionInfo.services?.frontend?.version || 'unknown'}
                          </Badge>
                          <Text color="gray.500">({versionInfo.services?.frontend?.status || 'unknown'})</Text>
                        </HStack>
                        <HStack>
                          <Text minW="70px">Backend:</Text>
                          <Badge colorScheme={versionInfo.services?.backend?.status === 'ok' ? 'green' : 'red'} size="sm">
                            v{versionInfo.services?.backend?.version || 'unknown'}
                          </Badge>
                          <Text color="gray.500">({versionInfo.services?.backend?.status || 'unknown'})</Text>
                        </HStack>
                        <HStack>
                          <Text minW="70px">Scraper:</Text>
                          <Badge colorScheme={versionInfo.services?.scraper?.status === 'ok' ? 'green' : 'red'} size="sm">
                            v{versionInfo.services?.scraper?.version || 'unknown'}
                          </Badge>
                          <Text color="gray.500">({versionInfo.services?.scraper?.status || 'unknown'})</Text>
                        </HStack>
                      </VStack>
                    </VStack>
                  </PopoverBody>
                </PopoverContent>
              </Popover>
            )}
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
