import type { ReactChild } from 'react'
import React, { useContext, useEffect, useState } from 'react'
import { useStakePoolLeaderboard } from 'hooks/useStakePoolLeaderboard'
export interface LeaderboardContextValues {
  leaderboard?: any[]
  loading?: boolean
  topScore?: number
}

const LeaderboardContext: React.Context<LeaderboardContextValues> =
  React.createContext<LeaderboardContextValues>({
    loading: undefined,
    leaderboard: undefined,
    topScore: undefined,
  })

export function LeaderboardProvider({ children }: { children: ReactChild }) {
  const { leaderboard, loading, topScore, fetchLeaderboard } =
    useStakePoolLeaderboard()

  return (
    <LeaderboardContext.Provider
      value={{
        leaderboard,
        loading,
        topScore,
      }}
    >
      {children}
    </LeaderboardContext.Provider>
  )
}

export function useLeaderboard(): LeaderboardContextValues {
  const context = useContext(LeaderboardContext)
  return context
}
