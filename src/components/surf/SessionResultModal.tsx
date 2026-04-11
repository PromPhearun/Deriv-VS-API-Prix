import { Button } from "../ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { TrendingUp, TrendingDown, Trophy, Target, Zap, Clock } from "lucide-react"
import { formatCurrency } from "../../lib/utils"

interface SessionResultModalProps {
  isOpen: boolean
  onClose: () => void
  session: {
    score: number
    duration: number
    maxCombo: number
    tricksPerformed: number
    powerUpsCollected: number
    stake?: number
    prediction?: "UP" | "DOWN"
    startPrice: number
    endPrice: number
    profitLoss?: number
  }
}

export default function SessionResultModal({
  isOpen,
  onClose,
  session,
}: SessionResultModalProps) {
  if (!isOpen) return null

  const priceChange = session.endPrice - session.startPrice
  const priceChangePercent = (priceChange / session.startPrice) * 100
  const isCorrectPrediction = session.prediction 
    ? (session.prediction === "UP" && priceChange > 0) || (session.prediction === "DOWN" && priceChange < 0)
    : null

  // Calculate P/L
  const stake = session.stake || 10
  const baseMultiplier = isCorrectPrediction ? 1.85 : 0
  const scoreBonus = session.score / 1000 // Bonus based on score
  const comboBonus = session.maxCombo * 0.05 // 5% per combo level
  const finalMultiplier = baseMultiplier * (1 + scoreBonus * 0.1 + comboBonus)
  const profitLoss = session.profitLoss !== undefined 
    ? session.profitLoss 
    : (isCorrectPrediction ? stake * finalMultiplier - stake : -stake)

  const isWin = profitLoss > 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        backdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      <Card
        className="w-full max-w-md shadow-2xl animate-in zoom-in-95"
        style={{
          backgroundColor: isWin ? "#F0FDF4" : "#FEF2F2",
          border: `4px solid ${isWin ? "#10B981" : "#EF4444"}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="text-center pb-4">
          <div className="text-6xl mb-2">{isWin ? "🎉" : "😔"}</div>
          <CardTitle className="text-3xl font-bold" style={{ color: isWin ? "#065F46" : "#991B1B" }}>
            {isWin ? "Epic Ride!" : "Wipeout!"}
          </CardTitle>
          <div className="mt-4 p-4 rounded-xl" style={{ 
            backgroundColor: isWin ? "#D1FAE5" : "#FEE2E2",
            border: `2px solid ${isWin ? "#10B981" : "#EF4444"}`
          }}>
            <div className="text-sm font-medium mb-1" style={{ color: isWin ? "#065F46" : "#991B1B" }}>
              {isWin ? "Profit" : "Loss"}
            </div>
            <div className="text-4xl font-bold" style={{ color: isWin ? "#10B981" : "#EF4444" }}>
              {isWin ? "+" : ""}{formatCurrency(profitLoss)}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Prediction Result */}
          {session.prediction && (
            <div className="rounded-lg p-3" style={{ 
              backgroundColor: isCorrectPrediction ? "#DBEAFE" : "#FEE2E2",
              border: `2px solid ${isCorrectPrediction ? "#0EA5E9" : "#F87171"}`
            }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {session.prediction === "UP" ? (
                    <TrendingUp className="h-5 w-5" style={{ color: "#10B981" }} />
                  ) : (
                    <TrendingDown className="h-5 w-5" style={{ color: "#EF4444" }} />
                  )}
                  <span className="font-medium" style={{ color: "#0C4A6E" }}>
                    Predicted {session.prediction}
                  </span>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-bold ${isCorrectPrediction ? 'bg-green-500' : 'bg-red-500'} text-white`}>
                  {isCorrectPrediction ? "✓ Correct" : "✗ Wrong"}
                </div>
              </div>
              <div className="mt-2 text-sm" style={{ color: "#6B7280" }}>
                Price moved {priceChange > 0 ? "+" : ""}{priceChangePercent.toFixed(2)}% 
                ({session.startPrice.toFixed(4)} → {session.endPrice.toFixed(4)})
              </div>
            </div>
          )}

          {/* Session Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg p-3 text-center" style={{ backgroundColor: "#F0F9FF", border: "2px solid #BFDBFE" }}>
              <Trophy className="h-5 w-5 mx-auto mb-1" style={{ color: "#FBBF24" }} />
              <div className="text-2xl font-bold" style={{ color: "#0C4A6E" }}>{session.score.toLocaleString()}</div>
              <div className="text-xs" style={{ color: "#6B7280" }}>Score</div>
            </div>

            <div className="rounded-lg p-3 text-center" style={{ backgroundColor: "#F0F9FF", border: "2px solid #BFDBFE" }}>
              <Clock className="h-5 w-5 mx-auto mb-1" style={{ color: "#0EA5E9" }} />
              <div className="text-2xl font-bold" style={{ color: "#0C4A6E" }}>{session.duration}s</div>
              <div className="text-xs" style={{ color: "#6B7280" }}>Duration</div>
            </div>

            <div className="rounded-lg p-3 text-center" style={{ backgroundColor: "#F0F9FF", border: "2px solid #BFDBFE" }}>
              <Target className="h-5 w-5 mx-auto mb-1" style={{ color: "#F59E0B" }} />
              <div className="text-2xl font-bold" style={{ color: "#0C4A6E" }}>{session.maxCombo}x</div>
              <div className="text-xs" style={{ color: "#6B7280" }}>Max Combo</div>
            </div>

            <div className="rounded-lg p-3 text-center" style={{ backgroundColor: "#F0F9FF", border: "2px solid #BFDBFE" }}>
              <Zap className="h-5 w-5 mx-auto mb-1" style={{ color: "#8B5CF6" }} />
              <div className="text-2xl font-bold" style={{ color: "#0C4A6E" }}>{session.tricksPerformed}</div>
              <div className="text-xs" style={{ color: "#6B7280" }}>Tricks</div>
            </div>
          </div>

          {/* Calculation Breakdown */}
          <div className="rounded-lg p-3 space-y-2 text-sm" style={{ backgroundColor: "#F9FAFB", border: "1px solid #E5E7EB" }}>
            <div className="font-medium" style={{ color: "#0C4A6E" }}>Calculation:</div>
            <div className="flex justify-between" style={{ color: "#6B7280" }}>
              <span>Base Stake:</span>
              <span>{formatCurrency(stake)}</span>
            </div>
            <div className="flex justify-between" style={{ color: "#6B7280" }}>
              <span>Prediction Bonus:</span>
              <span>{isCorrectPrediction ? "+85%" : "0%"}</span>
            </div>
            <div className="flex justify-between" style={{ color: "#6B7280" }}>
              <span>Score Bonus:</span>
              <span>+{(scoreBonus * 10).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between" style={{ color: "#6B7280" }}>
              <span>Combo Bonus:</span>
              <span>+{(comboBonus * 100).toFixed(0)}%</span>
            </div>
            <div className="border-t pt-2 flex justify-between font-bold" style={{ 
              borderColor: "#E5E7EB",
              color: isWin ? "#10B981" : "#EF4444"
            }}>
              <span>Final P/L:</span>
              <span>{isWin ? "+" : ""}{formatCurrency(profitLoss)}</span>
            </div>
          </div>

          {/* Close Button */}
          <Button
            onClick={onClose}
            className="w-full rounded-xl font-bold text-lg py-6"
            style={{
              backgroundColor: isWin ? "#10B981" : "#EF4444",
              color: "#FFFFFF",
            }}
          >
            {isWin ? "Surf Again! 🏄‍♂️" : "Try Again 💪"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
