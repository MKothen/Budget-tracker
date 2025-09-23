import React, { useMemo } from 'react'
import { Line } from 'react-chartjs-2'
import { Chart, registerables } from 'chart.js'
import { computeDailyBalances } from '../utils'
Chart.register(...registerables)

export default function CashflowChart({ events, forecastDays = 30 }) {
  const daily = computeDailyBalances(events) // returns next 60 days or based on utils
  // Ensure daily is ordered by date
  const ordered = daily.slice().sort((a,b) => new Date(a.date) - new Date(b.date))
  const labels = ordered.map(d => (new Date(d.date)).toISOString().slice(0,10))
  const running = ordered.map(d => d.balance)

  // Rolling average daily change over lookback window
  const lookback = Math.min(30, ordered.length)
  let avgDailyChange = 0
  if (lookback > 1) {
    const recent = ordered.slice(-lookback)
    const delta = recent[recent.length - 1].balance - recent[0].balance
    avgDailyChange = delta / (recent.length - 1)
  }

  // Build predicted projection starting from last known balance
  const projections = []
  const lastDate = ordered.length ? new Date(ordered[ordered.length - 1].date) : new Date()
  let projBalance = ordered.length ? ordered[ordered.length - 1].balance : 0
  for (let i=1;i<=forecastDays;i++) {
    projBalance += avgDailyChange
    const d = new Date(lastDate)
    d.setDate(d.getDate() + i)
    projections.push({ date: d.toISOString().slice(0,10), balance: Math.round(projBalance*100)/100 })
  }

  const allLabels = labels.concat(projections.map(p => p.date))
  const allRunning = running.concat(projections.map(p => null)) // null to create gap between actual and proj
  const predicted = Array(labels.length - 1).fill(null).concat(projections.map(p => p.balance))

  const data = {
    labels: allLabels,
    datasets: [
      {
        label: 'Running balance',
        data: allRunning,
        fill: false,
        tension: 0.2,
        borderWidth: 2
      },
      {
        label: 'Predicted available',
        data: predicted,
        fill: false,
        borderDash: [6,6],
        tension: 0.2,
        borderWidth: 1
      }
    ]
  }

  const options = {
    responsive: true,
    animation: { duration: 800, easing: 'easeOutQuart' },
    plugins: {
      legend: { display: true }
    },
    scales: {
      x: { display: true, title: { display: true, text: 'Date' } },
      y: { display: true, title: { display: true, text: 'Money' } }
    }
  }
  return (
    <div>
      <Line data={data} options={options} />
    </div>
  )
}