import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { EyeIcon, EyeOffIcon } from "lucide-react";

interface AuthenticationWallProps {
  children: React.ReactNode;
}

export default function AuthenticationWall({ children }: AuthenticationWallProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check if user is already authenticated on component mount
  useEffect(() => {
    const authStatus = localStorage.getItem('site_authenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simple authentication check
    if (username === 'Nakama' && password === 'Client&PasswordIsThis') {
      setIsAuthenticated(true);
      localStorage.setItem('site_authenticated', 'true');
    } else {
      setError('Invalid credentials. Please try again.');
    }
    
    setIsLoading(false);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('site_authenticated');
    setUsername('');
    setPassword('');
  };

  // If authenticated, show the site content
  if (isAuthenticated) {
    return (
      <div>
        {/* Small logout button in top right corner */}
        <div className="fixed top-4 right-4 z-50">
          <Button 
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="bg-black/50 text-white border-green-500 hover:bg-green-500/20"
          >
            Logout
          </Button>
        </div>
        {children}
      </div>
    );
  }

  // If not authenticated, show login form
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.1),transparent_50%)]"></div>
      
      <Card className="w-full max-w-md bg-black/80 border-gray-700 relative z-10">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-white">Access Required</CardTitle>
          <CardDescription className="text-gray-400">
            Please enter your credentials to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-300">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="bg-gray-800 border-gray-600 text-white placeholder-gray-500 focus:border-green-500"
                placeholder="Enter username"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-gray-800 border-gray-600 text-white placeholder-gray-500 focus:border-green-500 pr-10"
                  placeholder="Enter password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <Alert className="bg-red-900/50 border-red-500">
                <AlertDescription className="text-red-200">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={isLoading}
            >
              {isLoading ? 'Authenticating...' : 'Access Site'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}