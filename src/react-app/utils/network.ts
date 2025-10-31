// Network utilities for DevOps

export const ipv4ToInt = (ip: string): number => {
  const parts = ip.split('.').map(part => parseInt(part, 10));
  if (parts.length !== 4 || parts.some(part => isNaN(part) || part < 0 || part > 255)) {
    throw new Error('Invalid IPv4 address');
  }
  return (parts[0] << 24) + (parts[1] << 16) + (parts[2] << 8) + parts[3];
};

export const intToIpv4 = (int: number): string => {
  if (int < 0 || int > 4294967295) {
    throw new Error('Invalid integer for IPv4');
  }
  return [
    (int >>> 24) & 255,
    (int >>> 16) & 255,
    (int >>> 8) & 255,
    int & 255
  ].join('.');
};

export const ipv4ToBinary = (ip: string): string => {
  const parts = ip.split('.').map(part => parseInt(part, 10));
  if (parts.length !== 4 || parts.some(part => isNaN(part) || part < 0 || part > 255)) {
    throw new Error('Invalid IPv4 address');
  }
  return parts.map(part => part.toString(2).padStart(8, '0')).join('.');
};

export const binaryToIpv4 = (binary: string): string => {
  const cleanBinary = binary.replace(/[^01]/g, '');
  if (cleanBinary.length !== 32) {
    throw new Error('Binary string must be 32 bits');
  }
  const parts = [];
  for (let i = 0; i < 32; i += 8) {
    parts.push(parseInt(cleanBinary.substr(i, 8), 2));
  }
  return parts.join('.');
};

export const ipv4ToHex = (ip: string): string => {
  const int = ipv4ToInt(ip);
  return '0x' + int.toString(16).toUpperCase().padStart(8, '0');
};

export const hexToIpv4 = (hex: string): string => {
  const cleanHex = hex.replace(/^0x/i, '');
  const int = parseInt(cleanHex, 16);
  return intToIpv4(int);
};

// CIDR utilities
export const calculateCIDR = (cidr: string) => {
  const [ip, prefixStr] = cidr.split('/');
  const prefix = parseInt(prefixStr, 10);
  
  if (prefix < 0 || prefix > 32) {
    throw new Error('Invalid CIDR prefix');
  }
  
  const mask = (0xffffffff << (32 - prefix)) >>> 0;
  const subnetMask = intToIpv4(mask);
  const wildcardMask = intToIpv4(~mask >>> 0);
  
  const ipInt = ipv4ToInt(ip);
  const networkInt = (ipInt & mask) >>> 0;
  const broadcastInt = (networkInt | (~mask >>> 0)) >>> 0;
  
  const networkAddress = intToIpv4(networkInt);
  const broadcastAddress = intToIpv4(broadcastInt);
  const firstUsable = intToIpv4(networkInt + 1);
  const lastUsable = intToIpv4(broadcastInt - 1);
  
  const totalHosts = Math.pow(2, 32 - prefix);
  const usableHosts = Math.max(0, totalHosts - 2);
  
  return {
    networkAddress,
    broadcastAddress,
    subnetMask,
    wildcardMask,
    firstUsable: prefix === 31 || prefix === 32 ? networkAddress : firstUsable,
    lastUsable: prefix === 31 || prefix === 32 ? broadcastAddress : lastUsable,
    totalHosts,
    usableHosts: prefix === 31 ? 2 : prefix === 32 ? 1 : usableHosts,
    prefix
  };
};

// Port utilities
export const getPortDescription = (port: number): string => {
  const commonPorts: Record<number, string> = {
    21: 'FTP - File Transfer Protocol',
    22: 'SSH - Secure Shell',
    23: 'Telnet',
    25: 'SMTP - Simple Mail Transfer Protocol',
    53: 'DNS - Domain Name System',
    80: 'HTTP - Hypertext Transfer Protocol',
    110: 'POP3 - Post Office Protocol v3',
    143: 'IMAP - Internet Message Access Protocol',
    443: 'HTTPS - HTTP Secure',
    993: 'IMAPS - IMAP Secure',
    995: 'POP3S - POP3 Secure',
    3306: 'MySQL Database',
    5432: 'PostgreSQL Database',
    6379: 'Redis',
    27017: 'MongoDB',
    3389: 'RDP - Remote Desktop Protocol',
    5984: 'CouchDB',
    8080: 'HTTP Alternate',
    9200: 'Elasticsearch HTTP',
    5601: 'Kibana',
    2181: 'Apache Zookeeper',
    9092: 'Apache Kafka',
    8086: 'InfluxDB',
    3000: 'Grafana',
    9090: 'Prometheus',
    8500: 'Consul HTTP API',
    4646: 'Nomad HTTP API',
    8200: 'HashiCorp Vault',
    2379: 'etcd client communication',
    6443: 'Kubernetes API server',
    10250: 'Kubelet API',
    30000: 'Kubernetes NodePort range start'
  };
  
  return commonPorts[port] || 'Unknown service';
};

export const isPortInRange = (port: number, start: number, end: number): boolean => {
  return port >= start && port <= end;
};

export const getPortCategory = (port: number): string => {
  if (port >= 1 && port <= 1023) return 'Well-known ports (System)';
  if (port >= 1024 && port <= 49151) return 'Registered ports (User)';
  if (port >= 49152 && port <= 65535) return 'Dynamic/Private ports';
  return 'Invalid port';
};

// MAC address utilities
export const formatMacAddress = (mac: string, separator: string = ':'): string => {
  const cleanMac = mac.replace(/[^a-fA-F0-9]/g, '');
  if (cleanMac.length !== 12) {
    throw new Error('Invalid MAC address');
  }
  return cleanMac.match(/.{2}/g)?.join(separator) || '';
};

export const generateRandomMac = (): string => {
  const hexChars = '0123456789ABCDEF';
  let mac = '';
  for (let i = 0; i < 12; i++) {
    mac += hexChars[Math.floor(Math.random() * 16)];
  }
  return formatMacAddress(mac);
};

// Subnet splitting
export const splitSubnet = (cidr: string, newPrefix: number) => {
  const [ip, currentPrefixStr] = cidr.split('/');
  const currentPrefix = parseInt(currentPrefixStr, 10);
  
  if (newPrefix <= currentPrefix) {
    throw new Error('New prefix must be larger than current prefix');
  }
  
  const subnetsCount = Math.pow(2, newPrefix - currentPrefix);
  const hostBits = 32 - newPrefix;
  const subnetSize = Math.pow(2, hostBits);
  
  const baseNetwork = ipv4ToInt(ip) & ((0xffffffff << (32 - currentPrefix)) >>> 0);
  const subnets = [];
  
  for (let i = 0; i < subnetsCount; i++) {
    const subnetNetwork = baseNetwork + (i * subnetSize);
    const subnetIp = intToIpv4(subnetNetwork);
    subnets.push(`${subnetIp}/${newPrefix}`);
  }
  
  return subnets;
};
