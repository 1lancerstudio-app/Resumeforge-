'use client'

import { Chart as ChartJS, RadarController, PointElement, LineElement, Filler, Legend, Tooltip } from 'chart.js'
import { Radar } from 'react-chartjs-2'
import { RADAR_DIMENSIONS } from '@/lib/xrivu/types'

ChartJS.register(RadarController, PointElement, LineElement, Filler, Legend, Tooltip)

interface RadarChartProps {
  title: string
  data: number[]
  borderColor: string
  backgroundColor: string
  secondaryData?: number[]
  secondaryBorderColor?: string
  secondaryBackgroundColor?: string
}

export function RadarChart({
  title,
  data,
  borderColor,
  backgroundColor,
  secondaryData,
  secondaryBorderColor,
  secondaryBackgroundColor
}: RadarChartProps) {
  const labels = RADAR_DIMENSIONS.map(d => d.label)

  const datasets: any[] = [
    {
      label: title,
      data: data,
      borderColor: borderColor,
      backgroundColor: backgroundColor,
      borderWidth: 2,
      pointBackgroundColor: borderColor,
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: borderColor,
      tension: 0.1
    }
  ]

  if (secondaryData && secondaryBorderColor && secondaryBackgroundColor) {
    datasets.push({
      label: 'Company Requirements',
      data: secondaryData,
      borderColor: secondaryBorderColor,
      backgroundColor: secondaryBackgroundColor,
      borderWidth: 2,
      pointBackgroundColor: secondaryBorderColor,
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: secondaryBorderColor,
      tension: 0.1
    })
  }

  const chartData = {
    labels,
    datasets
  }

  const options: any = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 15,
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.8)',
        padding: 12,
        titleFont: { size: 12 },
        bodyFont: { size: 11 },
        callbacks: {
          label: function(context: any) {
            return context.dataset.label + ': ' + context.parsed.r.toFixed(0) + '%'
          }
        }
      }
    },
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          font: { size: 10 },
          color: '#999'
        },
        grid: {
          color: '#e0e0e0'
        },
        pointLabels: {
          font: { size: 11, weight: '500' }
        }
      }
    }
  }

  return (
    <div className="w-full h-80">
      <Radar data={chartData} options={options} />
    </div>
  )
}
