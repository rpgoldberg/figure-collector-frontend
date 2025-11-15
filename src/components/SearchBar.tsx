import React, { useState } from 'react';
import {
  InputGroup,
  Input,
  InputRightElement,
  IconButton,
  Box,
  useColorModeValue,
} from '@chakra-ui/react';
import { FaSearch } from 'react-icons/fa';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Search your figures...'
}) => {
  const [query, setQuery] = useState('');
  const inputBg = useColorModeValue('white', 'gray.800');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit} width="100%">
      <InputGroup size="lg">
        <Input
          type="search"
          role="searchbox"
          aria-label="Search your figures"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          bg={inputBg}
          boxShadow="sm"
          borderRadius="lg"
        />
        <InputRightElement>
          <IconButton
            aria-label="Search"
            icon={<FaSearch />}
            size="sm"
            colorScheme="brand"
            type="submit"
          />
        </InputRightElement>
      </InputGroup>
    </Box>
  );
};

export default SearchBar;
