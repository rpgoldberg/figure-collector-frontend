import React from 'react';
import { Button, Flex, Text, IconButton } from '@chakra-ui/react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  // Generate page buttons
  const renderPageButtons = () => {
    const buttons = [];
    
    // Always show first page
    buttons.push(
      <Button
        key={1}
        onClick={() => onPageChange(1)}
        size="sm"
        variant={currentPage === 1 ? 'solid' : 'outline'}
        colorScheme={currentPage === 1 ? 'brand' : 'gray'}
        mx={1}
      >
        1
      </Button>
    );

    // If there are many pages, add ellipsis
    if (currentPage > 3) {
      buttons.push(
        <Text key="ellipsis1" mx={1}>
          ...
        </Text>
      );
    }

    // Show pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i >= 2 && i <= totalPages - 1) {
        buttons.push(
          <Button
            key={i}
            onClick={() => onPageChange(i)}
            size="sm"
            variant={currentPage === i ? 'solid' : 'outline'}
            colorScheme={currentPage === i ? 'brand' : 'gray'}
            mx={1}
          >
            {i}
          </Button>
        );
      }
    }

    // If there are many pages, add ellipsis
    if (currentPage < totalPages - 2) {
      buttons.push(
        <Text key="ellipsis2" mx={1}>
          ...
        </Text>
      );
    }

    // Always show last page if there's more than one page
    if (totalPages > 1) {
      buttons.push(
        <Button
          key={totalPages}
          onClick={() => onPageChange(totalPages)}
          size="sm"
          variant={currentPage === totalPages ? 'solid' : 'outline'}
          colorScheme={currentPage === totalPages ? 'brand' : 'gray'}
          mx={1}
        >
          {totalPages}
        </Button>
      );
    }

    return buttons;
  };

  // Don't render pagination if there's only one page
  if (totalPages <= 1) return null;

  return (
    <Flex justify="center" align="center" mt={8} mb={4}>
      <IconButton
        aria-label="Previous page"
        icon={<FaChevronLeft />}
        onClick={handlePrevious}
        isDisabled={currentPage === 1}
        size="sm"
        variant="outline"
        mr={2}
      />
      
      {renderPageButtons()}
      
      <IconButton
        aria-label="Next page"
        icon={<FaChevronRight />}
        onClick={handleNext}
        isDisabled={currentPage === totalPages}
        size="sm"
        variant="outline"
        ml={2}
      />
    </Flex>
  );
};

export default Pagination;
