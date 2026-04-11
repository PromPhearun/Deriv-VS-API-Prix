import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Trophy, Medal, Award, Clock, ChevronDown, ChevronUp } from "lucide-react"
import type { SurfSession } from "../../contexts/SurfContext"

interface SurfLeaderboardProps {
  sessions: SurfSession[]
  totalWaves: number
  surfPoints: number
}

export default function SurfLeaderboard({ sessions, totalWaves, surfPoints }: SurfLeaderboardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const topSessions = [...sessions]
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  const getMedalIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5" style={{ color: "#FBBF24" }} />
      case 1:
        return <Medal className="w-5 h-5" style={{ color: "#9CA3AF" }} />
      case 2:
        return <Award className="w-5 h-5" style={{ color: "#CD7F32" }} />
      default:
        return <div className="w-5 h-5 flex items-center justify-center text-sm font-bold" style={{ color: "#6B7280" }}>
          {index + 1}
        </div>
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "Just now"
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  return (
    <div className="absolute top-20 left-4 z-30 w-80">
      <Card className="backdrop-blur-md overflow-hidden transition-all duration-300" style={{
        borderRadius: "16px",
        border: "2px solid rgba(14, 165, 233, 0.4)",
        boxShadow: "0 8px 24px rgba(14, 165, 233, 0.2)",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        maxHeight: isExpanded ? "1000px" : "140px",
      }}>
        <CardHeader 
          className="pb-3 cursor-pointer select-none" 
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2" style={{ color: "#0C4A6E" }}>
              <Trophy className="w-5 h-5" style={{ color: "#FBBF24" }} />
              Leaderboards
            </CardTitle>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5" style={{ color: "#0C4A6E" }} />
            ) : (
              <ChevronDown className="w-5 h-5" style={{ color: "#0C4A6E" }} />
            )}
          </div>
          <div className="flex flex-col gap-2 mt-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4" style={{ color: "#FBBF24" }} />
                <span className="font-medium" style={{ color: "#6B7280" }}>Points:</span>
              </div>
              <span className="font-bold text-lg" style={{ color: "#FBBF24" }}>{surfPoints.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center justify-between text-xs mt-1">
              <span style={{ color: "#6B7280" }}>Total Waves Surfed:</span>
              <span className="font-bold" style={{ color: "#0EA5E9" }}>{totalWaves}</span>
            </div>
          </div>
        </CardHeader>
        
        <div className={`transition-opacity duration-300 ${isExpanded ? "opacity-100" : "opacity-0"}`}>
          <CardContent className="pt-0">
            <div className="text-sm font-bold mb-3 pb-2 border-b" style={{ color: "#0C4A6E", borderColor: "#E0F2FE" }}>
              Top Surf Sessions
            </div>
            {topSessions.length === 0 ? (
              <div className="text-center py-8" style={{ color: "#6B7280" }}>
                <div className="text-4xl mb-2">🏄</div>
                <p className="text-sm">No rides yet!</p>
                <p className="text-xs mt-1">Start surfing to set records</p>
              </div>
            ) : (
            <div className="space-y-2">
              {topSessions.map((session, index) => (
                <div
                  key={session.id}
                  className="flex items-center gap-3 p-2 rounded-lg transition-all hover:bg-blue-50"
                  style={{
                    backgroundColor: index === 0 ? "#FEF3C7" : index === 1 ? "#F3F4F6" : index === 2 ? "#FEE2E2" : "transparent",
                  }}
                >
                  {/* Rank */}
                  <div className="flex-shrink-0">
                    {getMedalIcon(index)}
                  </div>

                  {/* Session Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold" style={{ color: "#0C4A6E" }}>
                        {session.score.toLocaleString()}
                      </span>
                      <span className="text-xs" style={{ color: "#6B7280" }}>
                        {formatDate(session.timestamp)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs" style={{ color: "#6B7280" }}>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTime(session.duration)}
                      </div>
                      <div className="flex items-center gap-1">
                        <span>🎯</span>
                        {session.maxCombo}x combo
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div
                    className="flex-shrink-0 px-2 py-1 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: session.status === "finished" ? "#D1FAE5" : session.status === "wiped" ? "#FEE2E2" : "#DBEAFE",
                      color: session.status === "finished" ? "#065F46" : session.status === "wiped" ? "#991B1B" : "#1E40AF",
                    }}
                  >
                    {session.status === "finished" ? "✓" : session.status === "wiped" ? "✗" : "~"}
                  </div>
                </div>
              ))}
            </div>
          )}
          </CardContent>
        </div>
      </Card>
    </div>
  )
}
