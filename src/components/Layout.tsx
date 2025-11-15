import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container, Text, Flex, Popover, PopoverTrigger, PopoverContent, PopoverBody, VStack, Badge, HStack, useColorModeValue } from '@chakra-ui/react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

// Import package.json to get version
const packageJson = require('../../package.json');

const Layout: React.FC = () => {
  const [versionInfo, setVersionInfo] = useState<any>(null);

  // Dark mode colors
  const footerBg = useColorModeValue('gray.50', 'gray.800');
  const footerBorder = useColorModeValue('gray.200', 'gray.700');
  const footerText = useColorModeValue('gray.600', 'gray.400');
  const footerTextHover = useColorModeValue('gray.700', 'gray.300');
  const popoverBorder = useColorModeValue('gray.200', 'gray.600');

  useEffect(() => {
    const registerFrontend = async (): Promise<boolean> => {
      try {
        const response = await fetch('/register-frontend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            serviceName: 'frontend',
            version: packageJson.version,
            name: packageJson.name
          }),
        });

        await response.json();
        return response.ok;
      } catch {
        return false;
      }
    };

    const fetchVersionInfo = async (): Promise<void> => {
      try {
        const response = await fetch('/version');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setVersionInfo(data);
      } catch {
        setVersionInfo(null);
      }
    };

    const initializeVersionInfo = async (): Promise<void> => {
      await registerFrontend();
      setTimeout(() => {
        fetchVersionInfo();
      }, 100);
    };

    initializeVersionInfo();
  }, []);

  return (
    <Box data-testid="layout" minH="100vh" display="flex" flexDirection="column">
      <Box data-testid="navbar">
        <Navbar />
      </Box>
      <Container maxW="container.xl" pt={5} pb={10} flex="1">
        <Box display="flex" gap={5}>
          <Box data-testid="sidebar" w="250px" display={{ base: 'none', md: 'block' }}>
            <Sidebar />
          </Box>
          <Box data-testid="outlet" flex="1">
            <Outlet />
          </Box>
        </Box>
      </Container>
      
      {/* Footer with version info */}
      <Box data-testid="footer" role="contentinfo" as="footer" py={4} borderTop="1px" borderColor={footerBorder} bg={footerBg}>
        <Container maxW="container.xl">
          <Flex justify="space-between" align="center">
            <Text fontSize="sm" color={footerText}>
              Figure Collector
            </Text>
            {versionInfo && (
              <Popover trigger="hover" placement="top-end">
                <PopoverTrigger>
                  <Text fontSize="xs" color={footerText} cursor="pointer" _hover={{ color: footerTextHover }}>
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
                      
                      {versionInfo.validation && (
                        <>
                          <Box borderTop="1px" borderColor={popoverBorder} pt={2} mt={2}>
                            <HStack>
                              <Text fontSize="xs" fontWeight="semibold">Validation:</Text>
                              <Badge 
                                colorScheme={versionInfo.validation.valid ? 'green' : versionInfo.validation.status === 'warning' ? 'yellow' : 'red'} 
                                size="sm"
                              >
                                {versionInfo.validation.status === 'tested' ? 'Tested' : 
                                 versionInfo.validation.status === 'compatible' ? 'Compatible' :
                                 versionInfo.validation.status === 'warning' ? 'Warning' : 'Invalid'}
                              </Badge>
                            </HStack>
                            {versionInfo.validation.message && (
                              <Text fontSize="xs" color="gray.600" mt={1}>
                                {versionInfo.validation.message}
                              </Text>
                            )}
                            {versionInfo.validation.warnings && versionInfo.validation.warnings.length > 0 && (
                              <VStack align="start" mt={1} spacing={0}>
                                {versionInfo.validation.warnings.map((warning: string, index: number) => (
                                  <Text key={index} fontSize="xs" color="orange.600">
                                    • {warning}
                                  </Text>
                                ))}
                              </VStack>
                            )}
                          </Box>
                        </>
                      )}
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
