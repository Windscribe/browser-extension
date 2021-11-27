/* This is it */
/* eslint-disable no-console */
export default console.log

export const logger = console

export const logGroup = (groupName, ...str) => {
  console.groupCollapsed(groupName)
  console.log(...str)
  console.groupEnd()
}
