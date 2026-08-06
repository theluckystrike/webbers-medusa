import {format} from "date-fns"

export const useDate = () => {
  const getFullDate = ({
    date,
    includeTime = false,
  }: {
    date: string | Date
    includeTime?: boolean
  }) => {
    const ensuredDate = new Date(date)

    if (isNaN(ensuredDate.getTime())) {
      return ""
    }

    const timeFormat = includeTime ? "p" : ""

    return format(ensuredDate, `PP ${timeFormat}`)
  }

  return {
    getFullDate,
  }
}
