import { api } from '@/lib/axios'

export enum TimeSplitDimensionEnum {
  QuarterHour = 'QuarterHour',
  Hour = 'Hour',
  Day = 'Day',
  Month = 'Month',
  Year = 'Year',
  Life = 'Life',
}

export interface DimensionRequest {
  SqlFilter: string
  Dimension: string
  EntityIdFilter: number[]
  discriminator: string
}

export interface OpenCubeData {
  dimensionRequests: DimensionRequest[]
  timeSplitDimension: TimeSplitDimensionEnum
  startGmtMoment: string | Date
  endGmtMoment: string
  startDayTime: string | null
  endDayTime: string | null
  columns: string
  discriminator: string
}

export const openCube = async (data: OpenCubeData) => {
  try {
    const formattedData = {
      ...data,
      columns: data.columns.split(',').map((col: string) => col.trim()),
    }

    const response = await api.post(
      '/api/instance/instanceManager/newCubeCursor',
      formattedData,
    )
    return response.data
  } catch (error: any) {
    console.error(error.response?.data || 'Error creating cube cursor')
    throw error
  }
}
