import { useState, useEffect } from "react";
import { useVault } from "../store/VaultContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { KeyRound, AlertCircle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function VaultPage() {
  const { isSetup, tryUnlock, resetVault } = useVault();
  const [passphrase, setPassphrase] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resetKey, setResetKey] = useState(0); // Force re-render when this changes
  const [showResetDialog, setShowResetDialog] = useState(false);

  useEffect(() => {
    // Reset form fields when setup state changes
    setPassphrase("");
    setConfirmPassphrase("");
    setError(null);
  }, [isSetup]);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase.length < 8) {
      setError("Passphrase must be at least 8 characters long");
      return;
    }
    if (passphrase !== confirmPassphrase) {
      setError("Passphrases do not match");
      return;
    }
    
    setIsLoading(true);
    try {
      await resetVault(passphrase);
      await tryUnlock(passphrase);
    } catch (err) {
      setError("Failed to set up vault");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const success = await tryUnlock(passphrase);
      if (!success) {
        setError("Invalid passphrase");
        setPassphrase("");
      }
    } catch (err) {
      setError("Failed to unlock vault");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    try {
      await resetVault();
      setResetKey(prev => prev + 1); // Force re-render
    } catch (err) {
      setError("Failed to reset vault");
    } finally {
      setIsLoading(false);
      setShowResetDialog(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4" key={resetKey}>
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
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? "Processing..." : isSetup ? "Unlock Credentials" : "Secure Credentials"}
              </Button>
              {isSetup && (
                <Button 
                  type="button" 
                  variant="outline"
                  disabled={isLoading}
                  onClick={() => setShowResetDialog(true)}
                >
                  Reset
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Vault</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete all stored database credentials. This action cannot be undone. Your monitors and measurements will not be affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleReset}
              disabled={isLoading}
              className={isLoading ? "opacity-50 cursor-not-allowed" : ""}
            >
              {isLoading ? "Processing..." : "Reset Vault"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
