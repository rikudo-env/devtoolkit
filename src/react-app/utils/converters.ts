// Unit converters and number system converters

// Number system conversions
export const convertNumberSystem = (value: string, fromBase: number, toBase: number): string => {
  if (fromBase < 2 || fromBase > 36 || toBase < 2 || toBase > 36) {
    throw new Error('Base must be between 2 and 36');
  }
  
  const decimal = parseInt(value, fromBase);
  if (isNaN(decimal)) {
    throw new Error('Invalid number for given base');
  }
  
  return decimal.toString(toBase).toUpperCase();
};

export const decimalToBinary = (decimal: number): string => {
  return decimal.toString(2);
};

export const binaryToDecimal = (binary: string): number => {
  return parseInt(binary, 2);
};

export const decimalToHex = (decimal: number): string => {
  return decimal.toString(16).toUpperCase();
};

export const hexToDecimal = (hex: string): number => {
  return parseInt(hex, 16);
};

export const decimalToOctal = (decimal: number): string => {
  return decimal.toString(8);
};

export const octalToDecimal = (octal: string): number => {
  return parseInt(octal, 8);
};

// Data size conversions
export const convertBytes = (bytes: number, from: string, to: string): number => {
  const units: Record<string, number> = {
    'B': 1,
    'KB': 1024,
    'MB': 1024 * 1024,
    'GB': 1024 * 1024 * 1024,
    'TB': 1024 * 1024 * 1024 * 1024,
    'PB': 1024 * 1024 * 1024 * 1024 * 1024,
    // Decimal units
    'kB': 1000,
    'MB_decimal': 1000 * 1000,
    'GB_decimal': 1000 * 1000 * 1000,
    'TB_decimal': 1000 * 1000 * 1000 * 1000
  };
  
  const fromMultiplier = units[from];
  const toMultiplier = units[to];
  
  if (!fromMultiplier || !toMultiplier) {
    throw new Error('Invalid unit');
  }
  
  return (bytes * fromMultiplier) / toMultiplier;
};

export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

// Time conversions
export const convertTime = (value: number, from: string, to: string): number => {
  const units: Record<string, number> = {
    'ms': 1,
    'second': 1000,
    'minute': 60 * 1000,
    'hour': 60 * 60 * 1000,
    'day': 24 * 60 * 60 * 1000,
    'week': 7 * 24 * 60 * 60 * 1000,
    'month': 30 * 24 * 60 * 60 * 1000,
    'year': 365 * 24 * 60 * 60 * 1000
  };
  
  const fromMultiplier = units[from];
  const toMultiplier = units[to];
  
  if (!fromMultiplier || !toMultiplier) {
    throw new Error('Invalid time unit');
  }
  
  return (value * fromMultiplier) / toMultiplier;
};

// Color conversions
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const rgbToHex = (r: number, g: number, b: number): string => {
  return "#" + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join("");
};

export const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;
  
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min);
    
    switch (max) {
      case r:
        h = (g - b) / diff + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / diff + 2;
        break;
      case b:
        h = (r - g) / diff + 4;
        break;
    }
    h /= 6;
  }
  
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
};

// Temperature conversions
export const celsiusToFahrenheit = (celsius: number): number => {
  return (celsius * 9/5) + 32;
};

export const fahrenheitToCelsius = (fahrenheit: number): number => {
  return (fahrenheit - 32) * 5/9;
};

export const celsiusToKelvin = (celsius: number): number => {
  return celsius + 273.15;
};

export const kelvinToCelsius = (kelvin: number): number => {
  return kelvin - 273.15;
};

// Distance conversions
export const convertDistance = (value: number, from: string, to: string): number => {
  const units: Record<string, number> = {
    'mm': 0.001,
    'cm': 0.01,
    'm': 1,
    'km': 1000,
    'in': 0.0254,
    'ft': 0.3048,
    'yd': 0.9144,
    'mi': 1609.344
  };
  
  const fromMultiplier = units[from];
  const toMultiplier = units[to];
  
  if (!fromMultiplier || !toMultiplier) {
    throw new Error('Invalid distance unit');
  }
  
  return (value * fromMultiplier) / toMultiplier;
};

// Weight conversions
export const convertWeight = (value: number, from: string, to: string): number => {
  const units: Record<string, number> = {
    'mg': 0.001,
    'g': 1,
    'kg': 1000,
    't': 1000000,
    'oz': 28.3495,
    'lb': 453.592,
    'st': 6350.29
  };
  
  const fromMultiplier = units[from];
  const toMultiplier = units[to];
  
  if (!fromMultiplier || !toMultiplier) {
    throw new Error('Invalid weight unit');
  }
  
  return (value * fromMultiplier) / toMultiplier;
};
