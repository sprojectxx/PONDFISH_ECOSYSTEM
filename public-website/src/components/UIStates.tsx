import React from 'react';

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading current availability...' }: LoadingStateProps) {
  return (
    <div className="state-container" aria-live="polite">
      <div className="state-icon" aria-hidden="true">⏳</div>
      <div className="state-title">{message}</div>
      <div className="state-description">Fetching store catalogue inventory details.</div>
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
  title = 'No Items Available',
  description = 'There are currently no items matching your request in the store catalogue.',
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="state-container">
      <div className="state-icon" aria-hidden="true">🐟</div>
      <div className="state-title">{title}</div>
      <div className="state-description">{description}</div>
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn btn-primary" type="button">
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
  message = 'We encountered an issue retrieving data from the store server.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="state-container state-error" role="alert">
      <div className="state-icon" aria-hidden="true">⚠️</div>
      <div className="state-title">{title}</div>
      <div className="state-description">{message}</div>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-primary" type="button" aria-label="Retry loading failed data">
          Retry
        </button>
      )}
    </div>
  );
}
