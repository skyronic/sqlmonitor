import { useState } from "react";
import { useVault } from "../store/VaultContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { KeyRound, AlertCircle } from "lucide-react";

export default function VaultPage() {
  const { unlocked, isSetup, tryUnlock, resetVault } = useVault();
  const [passphrase, setPassphrase] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase.length < 8) {
      setError("Passphrase must be at least 8 characters long");
      return;
    }
    if (passphrase !== confirmPassphrase) {
      setError("Passphrases do not match");
      return;
    }
    resetVault(passphrase);
    tryUnlock(passphrase);
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const success = tryUnlock(passphrase);
    if (!success) {
      setError("Invalid passphrase");
      setPassphrase("");
    }
  };

  // Dev controls for testing
  const { _setIsSetup, _setPassphrase } = useVault();
  const showDevControls = process.env.NODE_ENV === 'development';

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <KeyRound className="h-6 w-6" />
            <CardTitle>{isSetup ? "Unlock Database Credentials" : "Secure Your Database Credentials"}</CardTitle>
          </div>
          <CardDescription>
            {isSetup 
              ? "Enter your passphrase to access your encrypted database credentials" 
              : "Create a secure passphrase to encrypt your database credentials. You'll need this passphrase each time you open the app."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isSetup ? handleUnlock : handleSetup} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder={isSetup ? "Enter passphrase" : "Create a strong passphrase"}
                value={passphrase}
                onChange={(e) => {
                  setError(null);
                  setPassphrase(e.target.value);
                }}
                className="w-full"
              />
              {!isSetup && (
                <Input
                  type="password"
                  placeholder="Confirm your passphrase"
                  value={confirmPassphrase}
                  onChange={(e) => {
                    setError(null);
                    setConfirmPassphrase(e.target.value);
                  }}
                  className="w-full"
                />
              )}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">
                {isSetup ? "Unlock Credentials" : "Secure Credentials"}
              </Button>
              {isSetup && (
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => {
                    if (confirm("Reset vault? This will delete all stored database credentials.")) {
                      resetVault();
                      setPassphrase("");
                      setConfirmPassphrase("");
                      setError(null);
                    }
                  }}
                >
                  Reset
                </Button>
              )}
            </div>
          </form>

          {showDevControls && (
            <div className="mt-8 pt-4 border-t">
              <p className="text-sm font-medium mb-2">Dev Controls</p>
              <div className="space-y-2">
                <Button 
                  variant="secondary" 
                  size="sm"
                  className="w-full"
                  onClick={() => _setIsSetup(false)}
                >
                  Reset to Setup
                </Button>
                <Button 
                  variant="secondary"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    _setPassphrase("test123");
                    _setIsSetup(true);
                  }}
                >
                  Set Test Passphrase
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
