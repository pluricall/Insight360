'use client'
import { set, subDays, subHours, subMonths, subYears } from 'date-fns'
import { useEffect } from 'react'

interface useTimeSplitDimensionProps {
  watch: any
  setValue: any
}

export const useTimeSplitDimension = ({
  watch,
  setValue,
}: useTimeSplitDimensionProps) => {
  const timeSplitDimension = watch('timeSplitDimension')

  useEffect(() => {
    const now = new Date()
    let newStartMoment

    switch (timeSplitDimension || 'Hour') {
      case 'QuarterHour':
        newStartMoment = set(now, {
          hours: 9,
          minutes: 0,
          seconds: 0,
          milliseconds: 0,
        })
        break
      case 'Hour':
        newStartMoment = set(now, {
          hours: 8,
          minutes: 0,
          seconds: 0,
          milliseconds: 0,
        })
        break
      case 'Day':
        newStartMoment = subDays(now, 1)
        break
      case 'Month':
        newStartMoment = subMonths(now, 1)
        break
      case 'Year':
        newStartMoment = subYears(now, 1)
        break
      case 'Life':
        newStartMoment = now
        break
      default:
        newStartMoment = subHours(now, 1)
    }

    const formattedDate = newStartMoment.toISOString().slice(0, 16)
    setValue('startGmtMoment', formattedDate)
  }, [timeSplitDimension, setValue])

  return timeSplitDimension
}
