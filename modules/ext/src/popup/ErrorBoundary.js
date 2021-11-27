import React from 'react'
import pushToDebugLog from 'utils/debugLogger'
import CriticalError from 'views/CriticalError'

export default class ErrorBoundary extends React.Component {
  state = {
    hasError: false,
    error: null,
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error }
  }

  componentDidCatch(error) {
    pushToDebugLog({
      tag: 'popup',
      level: 'ERROR',
      activity: this.props.ACTIVITY,
      message: `React rendering error boundry: ${JSON.stringify(error)}`,
    })
  }

  render = () =>
    this.state.hasError ? (
      <CriticalError error={this.state.error} />
    ) : (
      this.props.children
    )
}
