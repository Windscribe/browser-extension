import { useEffect } from 'react'
import pushToDebugLog from 'utils/debugLogger'
import { useDispatch } from 'react-redux'

export const useLogger = (options, deps = []) => {
  const dispatch = useDispatch()
  useEffect(() => {
    pushToDebugLog({ ...options, dispatch })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps])
}
