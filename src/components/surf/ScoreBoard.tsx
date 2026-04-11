import { Card, CardContent } from "../ui/card"
import { Trophy, Zap, Timer, Target } from "lucide-react"
import type { TradingSetup } from "./TradingSetupModal"

interface ScoreBoardProps {
  score: number
  combo: number
  duration: number
  bestRide: number
  activeSetup?: TradingSetup | null
  currentPrice?: number
  startPrice?: number
}

export default function ScoreBoard({ score, combo, duration, bestRide, activeSetup, currentPrice, startPrice }: ScoreBoardProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="absolute top-4 right-4 z-30 space-y-2">
      {/* Main Score Card */}
      <Card style={{
        borderRadius: "16px",
        border: "2px solid #0EA5E9",
        boxShadow: "0 8px 24px rgba(14, 165, 233, 0.3)",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
      }}>
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Score */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5" style={{ color: "#FBBF24" }} />
                <span className="text-sm font-medium" style={{ color: "#0C4A6E" }}>
                  Score
                </span>
              </div>
              <span className="text-2xl font-bold" style={{ color: "#0EA5E9" }}>
                {score.toLocaleString()}
              </span>
            </div>

            <div className="h-px" style={{ backgroundColor: "#E0F2FE" }} />

            {/* Combo */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5" style={{ color: "#8B5CF6" }} />
                <span className="text-sm font-medium" style={{ color: "#0C4A6E" }}>
                  Combo
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xl font-bold" style={{ color: combo > 0 ? "#8B5CF6" : "#6B7280" }}>
                  {combo}x
                </span>
                {combo > 0 && (
                  <div className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold animate-pulse" style={{
                    backgroundColor: "#8B5CF6",
                    color: "white",
                  }}>
                    ACTIVE
                  </div>
                )}
              </div>
            </div>

            <div className="h-px" style={{ backgroundColor: "#E0F2FE" }} />

            {/* Duration */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Timer className="w-5 h-5" style={{ color: "#0EA5E9" }} />
                <span className="text-sm font-medium" style={{ color: "#0C4A6E" }}>
                  Time
                </span>
              </div>
              <span className="text-lg font-bold" style={{ color: "#0EA5E9" }}>
                {formatTime(duration)}
              </span>
            </div>

            <div className="h-px" style={{ backgroundColor: "#E0F2FE" }} />

            {/* Best Ride */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5" style={{ color: "#10B981" }} />
                <span className="text-sm font-medium" style={{ color: "#0C4A6E" }}>
                  Best
                </span>
              </div>
              <span className="text-lg font-bold" style={{ color: "#10B981" }}>
                {bestRide.toLocaleString()}
              </span>
            </div>

            {/* Trading PnL Display */}
            {activeSetup && startPrice !== undefined && currentPrice !== undefined && (
              <>
                <div className="h-px" style={{ backgroundColor: "#E0F2FE" }} />
                <div className={`p-3 rounded-xl border-2 ${
                  (activeSetup.prediction === "UP" && currentPrice > startPrice) ||
                  (activeSetup.prediction === "DOWN" && currentPrice < startPrice)
                    ? "bg-emerald-50 border-emerald-500"
                    : "bg-rose-50 border-rose-500"
                }`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-slate-500">TRADE PNL</span>
                    <span className="text-xs font-medium text-slate-600">
                      Stake: ${activeSetup.stake} | {activeSetup.prediction}
                    </span>
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-bold text-slate-700">
                      {currentPrice > startPrice ? "▲" : "▼"} {Math.abs((currentPrice - startPrice) / startPrice * 100).toFixed(3)}%
                    </span>
                    <span className={`text-xl font-bold ${
                      (activeSetup.prediction === "UP" && currentPrice > startPrice) ||
                      (activeSetup.prediction === "DOWN" && currentPrice < startPrice)
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}>
                      {((activeSetup.prediction === "UP" && currentPrice > startPrice) ||
                        (activeSetup.prediction === "DOWN" && currentPrice < startPrice))
                        ? `+$${(activeSetup.stake * 0.85).toFixed(2)}`
                        : `-$${activeSetup.stake.toFixed(2)}`}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Combo Multiplier Display */}
      {combo > 0 && (
        <Card style={{
          borderRadius: "16px",
          border: "2px solid #8B5CF6",
          boxShadow: "0 8px 24px rgba(139, 92, 246, 0.3)",
          backgroundColor: "rgba(139, 92, 246, 0.95)",
        }}>
          <CardContent className="p-3">
            <div className="text-center">
              <div className="text-white text-xs font-medium mb-1">
                MULTIPLIER
              </div>
              <div className="text-white text-3xl font-bold animate-pulse">
                {combo}x
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
