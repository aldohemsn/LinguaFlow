export const PASSPHRASE_KEY = 'linguaFlow_passphrase';

export const getStoredPassphrase = (): string => {
  return localStorage.getItem(PASSPHRASE_KEY) || '';
};

export const setStoredPassphrase = (passphrase: string) => {
  if (passphrase) {
    localStorage.setItem(PASSPHRASE_KEY, passphrase);
  } else {
    localStorage.removeItem(PASSPHRASE_KEY);
  }
};

export const verifyPassphrase = async (passphrase: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${passphrase}`
      }
    });

    if (response.ok) {
      return true;
    }
    return false;
  } catch (error) {
    console.error("Verification Error:", error);
    return false;
  }
};

export const getAuthHeaders = (): HeadersInit => {
  const passphrase = getStoredPassphrase();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (passphrase) {
    headers['Authorization'] = `Bearer ${passphrase}`;
  }
  
  return headers;
};
