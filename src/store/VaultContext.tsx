import { createContext, useContext, useState, ReactNode } from 'react';

interface VaultContextType {
  unlocked: boolean;
  isSetup: boolean;
  tryUnlock: (passphrase: string) => boolean;
  setSecret: (key: string, value: string) => void;
  getSecret: (key: string) => string;
  resetVault: (newPassphrase?: string) => void;
  // Test helpers
  _setIsSetup: (value: boolean) => void;
  _setPassphrase: (value: string) => void;
}

const VaultContext = createContext<VaultContextType | null>(null);

export function VaultProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [secrets, setSecrets] = useState<Record<string, string>>({});
  const [passphrase, setPassphrase] = useState("test123");

  const tryUnlock = (attempt: string): boolean => {
    const isCorrect = attempt === passphrase;
    setUnlocked(isCorrect);
    return isCorrect;
  };

  const setSecret = (key: string, value: string) => {
    if (!unlocked) return;
    setSecrets(prev => ({ ...prev, [key]: value }));
  };

  const getSecret = (key: string): string => {
    if (!unlocked) return "";
    return secrets[key] ?? "";
  };

  const resetVault = (newPassphrase?: string) => {
    setUnlocked(false);
    setSecrets({});
    if (newPassphrase) {
      setPassphrase(newPassphrase);
      setIsSetup(true);
    }
  };

  // Test helpers
  const _setIsSetup = (value: boolean) => setIsSetup(value);
  const _setPassphrase = (value: string) => setPassphrase(value);

  const value = {
    unlocked,
    isSetup,
    tryUnlock,
    setSecret,
    getSecret,
    resetVault,
    _setIsSetup,
    _setPassphrase,
  };

  return (
    <VaultContext.Provider value={value}>
      {children}
    </VaultContext.Provider>
  );
}

export function useVault() {
  const context = useContext(VaultContext);
  if (!context) {
    throw new Error('useVault must be used within a VaultProvider');
  }
  return context;
}
