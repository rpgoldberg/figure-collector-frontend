import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Container } from '@chakra-ui/react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

const Layout: React.FC = () => {
  return (
    <Box minH="100vh">
      <Navbar />
      <Container maxW="container.xl" pt={5} pb={10}>
        <Box display="flex" gap={5}>
          <Box w="250px" display={{ base: 'none', md: 'block' }}>
            <Sidebar />
          </Box>
          <Box flex="1">
            <Outlet />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Layout;
