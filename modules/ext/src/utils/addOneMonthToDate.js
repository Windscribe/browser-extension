import { addMonths, format, parse } from 'date-fns'

export default date => {
  // adds 1 month to resetDate
  const dateObj = parse(date)
  const nextResetDateObj = addMonths(dateObj, 1)
  return format(nextResetDateObj, 'YYYY-MM-DD')
}
