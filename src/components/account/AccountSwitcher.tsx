import React, { useEffect, useCallback, useState } from "react"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { useAccount } from "../../contexts/AccountContext"
import { Wallet, LogOut, User, ShieldCheck, Loader2, RotateCcw } from "lucide-react"
import { formatCurrency } from "../../lib/utils"
import { cn } from "../../lib/utils"

interface AccountSwitcherProps {
  className?: string
}

const AccountSwitcher: React.FC<AccountSwitcherProps> = ({ className }) => {
  const { accountType, balance, currency, loginId, isConnecting, setAccountType, connectReal, disconnect, resetBalance } = useAccount()
  const [error, setError] = useState<string | null>(null)

  const isDemo = accountType === "demo"

  // Check for PKCE OAuth callback on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")
    
    if (code) {
      console.log("[AccountSwitcher] Received OAuth code, exchanging for token...")
      handleOAuthCallback(code)
      // Clean up URL to remove code
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const handleOAuthCallback = useCallback(async (code: string) => {
    try {
      setError(null)
      console.log("[AccountSwitcher] Processing OAuth callback...")
      
      const codeVerifier = localStorage.getItem("deriv_code_verifier")
      if (!codeVerifier) {
        throw new Error("Missing code verifier. Please try connecting again.")
      }

      const redirectUri = window.location.origin
      const clientId = import.meta.env.VITE_DERIV_APP_ID

      const response = await fetch("/api/exchange-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          codeVerifier,
          clientId,
          redirectUri,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to exchange token")
      }

      const data = await response.json()
      console.log("[AccountSwitcher] Token exchange successful, passing access_token to connectReal:", data.access_token ? "Found" : "Missing")
      
      // Only pass the access_token string to connectReal!
      if (!data.access_token) {
        throw new Error("Invalid token response from server")
      }
      
      await connectReal(data.access_token)
      
      // Cleanup
      localStorage.removeItem("deriv_code_verifier")
    } catch (error) {
      console.error("[AccountSwitcher] OAuth callback failed:", error)
      const errorMessage = error instanceof Error ? error.message : "OAuth authentication failed"
      setError(errorMessage)
    }
  }, [connectReal])

  const handleConnectReal = useCallback(async () => {
    try {
      setError(null)
      const appId = import.meta.env.VITE_DERIV_APP_ID

      console.log("[AccountSwitcher] Starting PKCE OAuth flow...")
      console.log("[AccountSwitcher] Client ID:", appId)

      if (!appId) {
        throw new Error("OAuth App ID not configured")
      }

      // Generate PKCE challenge
      const { generatePKCEChallenge, getAuthorizationUrl } = await import("../../lib/auth")
      const pkce = await generatePKCEChallenge()
      
      // Store verifier for later
      localStorage.setItem("deriv_code_verifier", pkce.codeVerifier)

      const redirectUri = window.location.origin
      const oauthUrl = getAuthorizationUrl({
        clientId: appId,
        redirectUri,
      }, pkce)
      
      console.log("[AccountSwitcher] Redirecting to:", oauthUrl)
      window.location.href = oauthUrl
    } catch (err) {
      console.error("[AccountSwitcher] Failed to start OAuth flow:", err)
      setError(err instanceof Error ? err.message : "Failed to start connection process")
    }
  }, [])

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-4">
        {/* Account Type Toggle */}
        <div className="flex gap-1 p-1 bg-muted rounded-lg mb-4">
          <Button
            variant={isDemo ? "default" : "ghost"}
            size="sm"
            onClick={() => setAccountType("demo")}
            className="flex-1 text-xs gap-1.5"
          >
            <User className="h-3.5 w-3.5" />
            Demo
          </Button>
          <Button
            variant={!isDemo ? "default" : "ghost"}
            size="sm"
            onClick={() => setAccountType("real")}
            className="flex-1 text-xs gap-1.5"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Real
          </Button>
        </div>

        {/* Account Info */}
        <div className="space-y-3">
          {/* Balance Display */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className={cn(
                "h-5 w-5",
                isDemo ? "text-muted-foreground" : "text-yellow-500"
              )} />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    {isDemo ? "Demo Balance" : "Real Balance"}
                  </p>
                  {isDemo && (
                    <div className="relative flex items-center group">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-4 w-4 rounded-full transition-colors hover:bg-muted"
                        onClick={resetBalance}
                      >
                        <RotateCcw className="h-3 w-3" />
                      </Button>
                      <span className="absolute left-6 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded shadow-md pointer-events-none z-10 border border-border">
                        Reset Balance
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-lg font-bold">
                  {formatCurrency(balance, currency || "USD")}
                </p>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="text-xs text-muted-foreground">
            {isDemo ? (
              <p className="flex items-center gap-1.5">
                <User className="h-3 w-3" />
                Demo Account
              </p>
            ) : (
              <p className="flex items-center gap-1.5">
                <ShieldCheck className="h-3 w-3 text-green-500" />
                {loginId ? `Real Account: ${loginId}` : "Not connected"}
              </p>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="text-xs text-red-500 bg-red-500/10 p-2 rounded">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            {isDemo ? (
              <Button
                variant="default"
                size="sm"
                onClick={handleConnectReal}
                disabled={isConnecting}
                className="w-full text-xs gap-1.5"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Connect to Deriv
                  </>
                )}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={disconnect}
                className="w-full text-xs gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                Switch to Demo
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default AccountSwitcher
