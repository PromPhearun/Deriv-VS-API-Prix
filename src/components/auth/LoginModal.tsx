import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { ShieldCheck, User, Loader2 } from 'lucide-react'

export function LoginModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    // Check if user has already chosen a login method
    const hasChosenLogin = sessionStorage.getItem('has_chosen_login')
    
    // Check if we're in the middle of an OAuth callback
    const params = new URLSearchParams(window.location.search)
    const isOAuthCallback = params.has('code') || params.has('token1')

    // If they haven't chosen and aren't in a callback, show the modal
    if (!hasChosenLogin && !isOAuthCallback) {
      setIsOpen(true)
    } else if (isOAuthCallback) {
      // If it is a callback, mark as chosen so it doesn't pop up again
      sessionStorage.setItem('has_chosen_login', 'true')
    }
  }, [])

  const handleGuestLogin = () => {
    sessionStorage.setItem('has_chosen_login', 'true')
    setIsOpen(false)
  }

  const handleDerivLogin = async () => {
    setIsConnecting(true)
    try {
      sessionStorage.setItem('has_chosen_login', 'true')
      
      const clientId = "32VnV8czGxufJh1E0GQUD" // V2 OAuth Client ID
      const { generatePKCEChallenge } = await import("../../lib/auth")
      const pkce = await generatePKCEChallenge()
      
      sessionStorage.setItem("pkce_code_verifier", pkce.codeVerifier)
      sessionStorage.setItem("oauth_state", pkce.state)

      const authUrl = new URL("https://auth.deriv.com/oauth2/auth")
      authUrl.searchParams.set("response_type", "code")
      authUrl.searchParams.set("client_id", clientId)
      
      const redirectUri = window.location.hostname === "localhost"
        ? "http://localhost:5173"
        : "https://promotrades.vercel.app"
        
      authUrl.searchParams.set("redirect_uri", redirectUri)
      authUrl.searchParams.set("scope", "trade")
      authUrl.searchParams.set("state", pkce.state)
      authUrl.searchParams.set("code_challenge", pkce.codeChallenge)
      authUrl.searchParams.set("code_challenge_method", "S256")

      window.location.href = authUrl.toString()
    } catch (err) {
      console.error("Failed to start OAuth flow from login modal:", err)
      setIsConnecting(false)
      // Allow them to try again or choose guest
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <Card className="w-full max-w-lg shadow-lg border-2">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-primary">Welcome to PROMO Trade</CardTitle>
          <CardDescription>
            Please choose how you would like to continue.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <Button 
            className="w-full h-14 text-lg gap-3" 
            onClick={handleDerivLogin}
            disabled={isConnecting}
          >
            {isConnecting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <ShieldCheck className="h-5 w-5" />
            )}
            Log in with Deriv Account
          </Button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full h-14 text-lg gap-3" 
            onClick={handleGuestLogin}
            disabled={isConnecting}
          >
            <User className="h-5 w-5" />
            Log in as a guest
          </Button>
          
          <p className="text-xs text-center text-muted-foreground mt-4">
            You can always switch between accounts later from the top-right menu.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
