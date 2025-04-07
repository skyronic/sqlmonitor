import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import Database from '@tauri-apps/plugin-sql';
import CryptoJS from 'crypto-js';

interface VaultContextType {
  unlocked: boolean;
  isSetup: boolean;
  tryUnlock: (passphrase: string) => Promise<boolean>;
  setSecret: (key: string, value: string) => Promise<void>;
  getSecret: (key: string) => Promise<string>;
  resetVault: (newPassphrase?: string) => Promise<void>;
  // Test helpers
  _setIsSetup: (value: boolean) => void;
}

const VaultContext = createContext<VaultContextType | null>(null);

// Salt for additional security
const SALT = "sqlmonitor_vault_salt";
// DB connection
let db: any = null;

export function VaultProvider({ children }: { children: ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [passphrase, setPassphrase] = useState<string | null>(null);

  // Initialize database connection
  useEffect(() => {
    const initDb = async () => {
      try {
        db = await Database.load('sqlite:sqlmonitor.db');
        
        // Check if vault is set up
        const result = await db.select('SELECT * FROM vaults LIMIT 1');
        setIsSetup(result.length > 0);
      } catch (error) {
        console.error('Failed to initialize database:', error);
      }
    };
    
    initDb();
  }, []);

  // Hash passphrase with salt
  const hashPassphrase = (pass: string): string => {
    return CryptoJS.PBKDF2(pass, SALT, { keySize: 8, iterations: 1000 }).toString();
  };

  // Encrypt value with passphrase
  const encrypt = (value: string, pass: string): string => {
    return CryptoJS.AES.encrypt(value, pass).toString();
  };

  // Decrypt value with passphrase
  const decrypt = (encrypted: string, pass: string): string => {
    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, pass);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Decryption failed:', error);
      return '';
    }
  };

  const tryUnlock = async (attempt: string): Promise<boolean> => {
    if (!db) return false;
    
    try {
      const hashedAttempt = hashPassphrase(attempt);
      const result = await db.select('SELECT passphrase_hash FROM vaults LIMIT 1');
      
      if (result.length === 0) return false;
      
      const isCorrect = result[0].passphrase_hash === hashedAttempt;
      
      if (isCorrect) {
        setUnlocked(true);
        setPassphrase(attempt);
      }
      
      return isCorrect;
    } catch (error) {
      console.error('Unlock failed:', error);
      return false;
    }
  };

  const setSecret = async (key: string, value: string): Promise<void> => {
    if (!unlocked || !passphrase || !db) return;
    
    try {
      const encryptedValue = encrypt(value, passphrase);
      
      // Check if secret exists
      const existing = await db.select('SELECT * FROM secrets WHERE key = $1', [key]);
      
      if (existing.length > 0) {
        await db.execute(
          'UPDATE secrets SET encrypted_value = $1 WHERE key = $2',
          [encryptedValue, key]
        );
      } else {
        await db.execute(
          'INSERT INTO secrets (key, encrypted_value) VALUES ($1, $2)',
          [key, encryptedValue]
        );
      }
    } catch (error) {
      console.error('Failed to set secret:', error);
    }
  };

  const getSecret = async (key: string): Promise<string> => {
    if (!unlocked || !passphrase || !db) return "";
    
    try {
      const result = await db.select('SELECT encrypted_value FROM secrets WHERE key = $1', [key]);
      
      if (result.length === 0) return "";
      
      return decrypt(result[0].encrypted_value, passphrase);
    } catch (error) {
      console.error('Failed to get secret:', error);
      return "";
    }
  };

  const resetVault = async (newPassphrase?: string): Promise<void> => {
    if (!db) return;
    
    try {
      // Clear existing data
      await db.execute('DELETE FROM secrets');
      await db.execute('DELETE FROM vaults');
      
      setUnlocked(false);
      setPassphrase(null);
      
      if (newPassphrase) {
        const hashedPass = hashPassphrase(newPassphrase);
        await db.execute('INSERT INTO vaults (passphrase_hash) VALUES ($1)', [hashedPass]);
        setIsSetup(true);
        setPassphrase(newPassphrase);
        setUnlocked(true);
      } else {
        setIsSetup(false);
      }
    } catch (error) {
      console.error('Failed to reset vault:', error);
    }
  };

  // Test helpers
  const _setIsSetup = (value: boolean) => setIsSetup(value);

  const value = {
    unlocked,
    isSetup,
    tryUnlock,
    setSecret,
    getSecret,
    resetVault,
    _setIsSetup,
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
