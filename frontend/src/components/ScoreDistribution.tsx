import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { ScoreDistribution } from '../lib/api'

type Props = {
  score: number
  distribution: ScoreDistribution
}

export default function ScoreDistribution({ score, distribution }: Props) {
  const data = distribution.distribution.map((bin) => ({
    ...bin,
    label: `${bin.min}-${bin.max}`,
  }))

  const userBinMin = Math.floor(score / 100) * 100
  const userBinIndex = data.findIndex((bin) => bin.min === userBinMin)

  return (
    <div className="score-distribution">
      <p className="score-distribution-title"><b>Your score: {score}</b></p>
      {distribution.total === 0 ? (
        <p className="score-distribution-subtitle">Be the first to solve today's grid!</p>
      ) : (
        <>
          {distribution.user_rank !== null && distribution.percentile !== null && (
            <p className="score-distribution-subtitle"> 
              Rank #{distribution.user_rank} of {distribution.total}: top {distribution.percentile}%
            </p>
          )}
          <div className="score-distribution-chart">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" name="players">
                  {data.map((bin, index) => (
                    <Cell key={bin.min} fill={index === userBinIndex ? '#005d72' : '#3C64B4'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}
