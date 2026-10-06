import { Component } from 'react'
import './ErrorBoundary.css'

/**
 * Catches rendering errors in any child component and shows a fallback
 * UI with a way to recover, instead of a blank screen.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unhandled UI error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" role="alert">
          <p className="error-boundary__title">Something went wrong</p>
          <p className="not-found-page__message">
            An unexpected error occurred while rendering the page.
          </p>
          <button
            type="button"
            className="error-boundary__reset-button"
            onClick={this.handleReset}
          >
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
