import React, { useEffect, useCallback, useState } from "react"
import { Button } from "../ui/button"
import { Card, CardContent } from "../ui/card"
import { useAccount } from "../../contexts/AccountContext"
import { getDerivAPI } from "../../lib/deriv-api"
import { Wallet, User, ShieldCheck, Loader2, RotateCcw, ArrowDownToLine, ArrowUpFromLine } from "lucide-react"
import { formatCurrency } from "../../lib/utils"
import { cn } from "../../lib/utils"

interface AccountSwitcherProps {
  className?: string
}

const AccountSwitcher: React.FC<AccountSwitcherProps> = ({ className }) => {
  const { accountType, balance, currency, loginId, connectReal, resetBalance } = useAccount()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isResetting, setIsResetting] = useState(false)

  const handleResetBalance = async () => {
    setIsResetting(true)
    try {
      await resetBalance()
    } finally {
      setIsResetting(false)
    }
  }

  const isDemo = accountType === "demo"

  const handleDeposit = async () => {
    if (isDemo) return
    setIsLoading(true)
    try {
      const api = getDerivAPI()
      const url = await api.deposit()
      window.open(url, "_blank", "noopener,noreferrer")
    } catch (err) {
      console.error("Failed to open deposit page", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleWithdraw = async () => {
    if (isDemo) return
    setIsLoading(true)
    try {
      const api = getDerivAPI()
      const url = await api.withdraw()
      window.open(url, "_blank", "noopener,noreferrer")
    } catch (err) {
      console.error("Failed to open withdrawal page", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Check for Classic OAuth implicit callback on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token1 = params.get("token1")
    const code = params.get("code")
    const state = params.get("state")
    const authError = params.get("error")
    
    if (token1) {
      console.log("[AccountSwitcher] Received classic OAuth token in URL")
      handleClassicOAuthCallback(token1)
      // Clean up URL to remove sensitive tokens
      window.history.replaceState({}, document.title, window.location.pathname)
    } else if (code) {
      console.log("[AccountSwitcher] Received V2 PKCE OAuth code in URL")
      handleV2OAuthCallback(code, state, authError)
      window.history.replaceState({}, document.title, window.location.pathname)
    }
  }, [])

  const handleV2OAuthCallback = useCallback(async (code: string, state: string | null, authError: string | null) => {
    try {
      setError(null)
      if (authError) {
        throw new Error(`Authorization failed: ${authError}`)
      }
      
      const storedState = sessionStorage.getItem("oauth_state")
      if (state !== storedState) {
        throw new Error("State mismatch! Possible CSRF attack.")
      }
      
      const codeVerifier = sessionStorage.getItem("pkce_code_verifier")
      if (!codeVerifier) {
        throw new Error("No PKCE code verifier found in session.")
      }
      
      const clientId = "32VnV8czGxufJh1E0GQUD"
      const redirectUri = window.location.hostname === "localhost"
        ? "http://localhost:5173"
        : "https://promotrades.vercel.app"
        
      const { exchangeCodeForToken, storeTokens } = await import("../../lib/auth")
      
      console.log("[AccountSwitcher] Exchanging code for token...")
      const tokenResponse = await exchangeCodeForToken(code, {
        clientId,
        redirectUri
      }, codeVerifier)
      
      storeTokens(tokenResponse)
      
      // Clear session variables
      sessionStorage.removeItem("pkce_code_verifier")
      sessionStorage.removeItem("oauth_state")
      
      console.log("[AccountSwitcher] Token received, connecting...")
      await connectReal(tokenResponse.access_token, "demo")
    } catch (err) {
      console.error("[AccountSwitcher] V2 OAuth callback failed:", err)
      setError(err instanceof Error ? err.message : "OAuth authentication failed")
    }
  }, [connectReal])

  const handleClassicOAuthCallback = useCallback(async (token: string) => {
    try {
      setError(null)
      console.log("[AccountSwitcher] Connecting with classic OAuth token...")
      await connectReal(token)
    } catch (error) {
      console.error("[AccountSwitcher] OAuth callback failed:", error)
      const errorMessage = error instanceof Error ? error.message : "OAuth authentication failed"
      
      // Provide user-friendly error messages
      if (errorMessage.includes("timeout")) {
        setError("Connection timeout. Please check your internet and try again.")
      } else if (errorMessage.includes("Authentication failed after")) {
        setError("Unable to connect to your Deriv account. Please try again or contact support.")
      } else {
        setError(errorMessage)
      }
    }
  }, [connectReal])


  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="p-4">
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
                        className={cn("h-4 w-4 rounded-full transition-colors hover:bg-muted", isResetting && "opacity-50")}
                        onClick={handleResetBalance}
                        disabled={isResetting}
                      >
                        <RotateCcw className={cn("h-3 w-3", isResetting && "animate-spin")} />
                      </Button>
                      <span className="absolute left-6 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-popover text-popover-foreground text-[10px] px-2 py-1 rounded shadow-md pointer-events-none z-10 border border-border">
                        Reset Balance
                      </span>
                    </div>
                  )}
                </div>
                <p className="text-lg font-bold">
                  {isDemo || loginId ? formatCurrency(balance, currency || "USD") : "0.00"}
                </p>
              </div>
            </div>
            {!isDemo && loginId && (
              <div className="flex items-center gap-2">
                <Button
                  variant="profit"
                  size="sm"
                  onClick={handleDeposit}
                  disabled={isLoading}
                  className="flex items-center gap-1 h-8 px-2"
                  title="Deposit"
                >
                  {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowDownToLine className="h-3 w-3" />}
                  <span className="text-xs font-bold">Deposit</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleWithdraw}
                  disabled={isLoading}
                  className="flex items-center gap-1 h-8 px-2"
                  title="Withdraw"
                >
                  {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <ArrowUpFromLine className="h-3 w-3" />}
                  <span className="text-xs font-bold">Withdraw</span>
                </Button>
              </div>
            )}
          </div>

          {/* Account Details */}
          <div className="text-xs text-muted-foreground">
            {isDemo ? (
              <p className="flex items-center gap-1.5">
                <User className="h-3 w-3" />
                {loginId ? `Demo Account: ${loginId}` : "Mock Demo Account"}
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

        </div>
      </CardContent>
    </Card>
  )
}

export default AccountSwitcher
