import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import { getDerivAPI } from "../lib/deriv-api"

export type AccountType = "demo" | "real"

interface AccountInfo {
  accountType: AccountType
  balance: number
  currency: string
  loginId: string | null
  isConnected: boolean
  isConnecting: boolean
  accessToken: string | null
}

interface AccountContextType extends AccountInfo {
  setAccountType: (type: AccountType) => void
  connectReal: (accessToken: string, targetType?: AccountType) => Promise<void>
  disconnect: () => void
  updateBalance: (balance: number) => void
  addBalance: (amount: number) => void
  deductBalance: (amount: number) => void
  resetBalance: () => Promise<void>
  refreshBalance: () => Promise<void>
}

const DEMO_BALANCE = 10000
const DEMO_CURRENCY = "USD"
const DEMO_LOGIN_ID = null

const AccountContext = createContext<AccountContextType | null>(null)

export function useAccount(): AccountContextType {
  const context = useContext(AccountContext)
  if (!context) {
    throw new Error("useAccount must be used within an AccountProvider")
  }
  return context
}

interface AccountProviderProps {
  children: React.ReactNode
}

export function AccountProvider({ children }: AccountProviderProps) {
  const [accountInfo, setAccountInfo] = useState<AccountInfo>(() => {
    // Clear any residual tokens/types for security and regulatory compliance
    localStorage.removeItem("deriv_access_token")
    localStorage.removeItem("account_type")
    return {
      accountType: "demo",
      balance: DEMO_BALANCE,
      currency: DEMO_CURRENCY,
      loginId: DEMO_LOGIN_ID,
      isConnected: false,
      isConnecting: false,
      accessToken: null,
    }
  })

  const authorizeHandlerRef = useRef<((data: any) => void) | null>(null)

  const disconnect = useCallback(() => {
    // Switch back to demo
    localStorage.setItem("account_type", "demo")
    localStorage.removeItem("deriv_access_token")
    sessionStorage.removeItem("has_chosen_login")
    setAccountInfo({
      accountType: "demo",
      balance: DEMO_BALANCE,
      currency: DEMO_CURRENCY,
      loginId: null,
      isConnected: false,
      isConnecting: false,
      accessToken: null,
    })
  }, [])

  const handleAuthorize = useCallback((data: any) => {
    if (data?.account_list && data.loginid) {
      setAccountInfo((prev) => ({
        ...prev,
        loginId: data.loginid,
        currency: data.currency || prev.currency,
        isConnecting: false,
        isConnected: true,
      }))
    }
  }, [])

  const connectReal = useCallback(async (_accessToken: string, _targetType: AccountType = "demo") => {
    console.error("[AccountContext] Real/Connected accounts are disabled due to regulatory compliance.")
    return
  }, [])

  // Set up event handlers for accounts
  useEffect(() => {
    const api = getDerivAPI()

    // Set up authorize response handler
    if (!authorizeHandlerRef.current) {
      authorizeHandlerRef.current = api.on("authorize", handleAuthorize)
    }

    // Auto-reconnect if we have a valid token but aren't connected
    const storedToken = localStorage.getItem("deriv_access_token")
    if (storedToken && storedToken !== "undefined" && storedToken !== "null" && !accountInfo.isConnected && !accountInfo.isConnecting) {
      console.log(`[AccountContext] Found valid stored token, auto-reconnecting to ${accountInfo.accountType}...`)
      connectReal(storedToken, accountInfo.accountType).catch(err => {
        console.error("[AccountContext] Auto-reconnect failed, falling back to demo mock:", err)
        disconnect()
      })
    } else if (accountInfo.isConnected) {
      // Trigger an event so other components know connection is restored
      window.dispatchEvent(new CustomEvent('account_connected', { detail: { accountType: accountInfo.accountType } }))
    }

    return () => {
      // Clean up handlers on unmount
      if (authorizeHandlerRef.current) {
        api.off("authorize", authorizeHandlerRef.current)
        authorizeHandlerRef.current = null
      }
    }
  }, [accountInfo.accountType, accountInfo.isConnected, accountInfo.isConnecting, connectReal, disconnect, handleAuthorize])

  const setAccountType = useCallback((_type: AccountType) => {
    console.warn("[AccountContext] Account type switching is disabled due to regulatory compliance.")
    setAccountInfo((prev) => ({
      ...prev,
      accountType: "demo",
      balance: prev.accountType === "demo" ? prev.balance : 10000,
      currency: "USD",
      loginId: null,
      isConnected: false,
      isConnecting: false,
      accessToken: null,
    }))
  }, [])

  const updateBalance = useCallback((newBalance: number) => {
    setAccountInfo((prev) => {
      // If we are in demo and disconnected, and someone tries to set it to 0 initially, prevent it
      if (prev.accountType === "demo" && !prev.isConnected) {
        if (newBalance === 0 && prev.balance === 10000) {
          return prev;
        }
      }
      return {
        ...prev,
        balance: Math.max(0, newBalance), // Prevent negative balance
      }
    })
  }, [])

  const addBalance = useCallback((amount: number) => {
    setAccountInfo((prev) => ({
      ...prev,
      balance: prev.balance + amount,
    }))
  }, [])

  const deductBalance = useCallback((amount: number) => {
    setAccountInfo((prev) => ({
      ...prev,
      balance: Math.max(0, prev.balance - amount),
    }))
  }, [])

  const refreshBalance = useCallback(async () => {
    if (accountInfo.isConnected) {
      try {
        const api = getDerivAPI()
        const balanceData = await api.getBalance()
        if (balanceData?.balance !== undefined) {
          setAccountInfo(prev => ({
            ...prev,
            balance: Number(balanceData.balance),
            currency: balanceData.currency || prev.currency
          }))
        }
      } catch (err) {
        console.error('[AccountContext] Failed to manually refresh balance', err)
      }
    } else if (accountInfo.accountType === "demo") {
      setAccountInfo(prev => ({ ...prev, balance: 10000 }))
    }
  }, [accountInfo.accountType, accountInfo.isConnected])

  const resetBalance = useCallback(async () => {
    if (!accountInfo.isConnected) {
      if (accountInfo.accountType === "demo") {
        setAccountInfo(prev => ({ ...prev, balance: 10000 }))
      }
      return
    }

    try {
      const api = getDerivAPI()
      // Only reset if it's a demo account and we have a token
      if (accountInfo.accountType === "demo" && accountInfo.accessToken && accountInfo.loginId) {
        await api.resetDemoBalance(accountInfo.accessToken, accountInfo.loginId)
        
        // After reset, refresh the balance to get the accurate amount from server
        await refreshBalance()
      }
    } catch (err) {
      console.error("[AccountContext] Failed to reset demo balance:", err)
    }
  }, [accountInfo.accountType, accountInfo.accessToken, accountInfo.isConnected, accountInfo.loginId, refreshBalance])

  const value: AccountContextType = {
    ...accountInfo,
    setAccountType,
    connectReal,
    disconnect,
    updateBalance,
    addBalance,
    deductBalance,
    resetBalance,
    refreshBalance,
  }

  return (
    <AccountContext.Provider value={value}>
      {children}
    </AccountContext.Provider>
  )
}
