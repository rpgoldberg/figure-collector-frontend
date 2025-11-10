import theme from '../theme';

describe('Theme Configuration', () => {
  it('should have color mode configuration', () => {
    expect(theme.config).toBeDefined();
    expect(theme.config.initialColorMode).toBeDefined();
    expect(theme.config.useSystemColorMode).toBeDefined();
  });

  it('should use system color mode by default', () => {
    expect(theme.config.useSystemColorMode).toBe(true);
  });

  it('should have global styles function for color mode', () => {
    expect(theme.styles.global).toBeInstanceOf(Function);
  });

  it('should have brand colors', () => {
    expect(theme.colors.brand).toBeDefined();
    expect(theme.colors.brand['500']).toBe('#0967d2');
  });

  it('should return different background colors for light and dark modes', () => {
    const lightStyles = theme.styles.global({ colorMode: 'light' });
    const darkStyles = theme.styles.global({ colorMode: 'dark' });

    expect(lightStyles.body.bg).not.toBe(darkStyles.body.bg);
    expect(darkStyles.body.bg).toBe('gray.900');
    expect(lightStyles.body.bg).toBe('white');
  });

  it('should return different text colors for light and dark modes', () => {
    const lightStyles = theme.styles.global({ colorMode: 'light' });
    const darkStyles = theme.styles.global({ colorMode: 'dark' });

    expect(lightStyles.body.color).not.toBe(darkStyles.body.color);
    expect(darkStyles.body.color).toBe('gray.50');
    expect(lightStyles.body.color).toBe('gray.900');
  });
});
