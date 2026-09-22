import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading catalog data...' }: LoadingStateProps) {
  return (
    <div className="state-container" aria-live="polite">
      <div className="state-icon">⏳</div>
      <div className="state-title">{message}</div>
      <div className="state-description">Connecting to server for real-time inventory updates.</div>
    </div>
  );
}

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  title = 'No Fish Available',
  description = 'There are currently no items matching your criteria in the store catalogue.',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="state-container">
      <div className="state-icon">🐟</div>
      <div className="state-title">{title}</div>
      <div className="state-description">{description}</div>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-primary">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = 'Unable to Load Data',
  message = 'We encountered an issue connecting to the PondFish backend API. Please check your network or try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="state-container" role="alert">
      <div className="state-icon">⚠️</div>
      <div className="state-title">{title}</div>
      <div className="state-description">{message}</div>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-primary">
          Try Again
        </button>
      )}
    </div>
  );
}
