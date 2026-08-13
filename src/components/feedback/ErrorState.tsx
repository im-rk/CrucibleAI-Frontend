import React from 'react';
import { Card, CardContent } from '../common/Card';
import { Button } from '../common/Button';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface ErrorStateProps {
  error: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <Card className="border-rose-300 dark:border-rose-900/80 bg-rose-50/50 dark:bg-rose-950/30">
      <CardContent className="p-6 text-center space-y-4">
        <div className="mx-auto w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-rose-600 dark:text-rose-400" />
        </div>

        <div className="space-y-1 max-w-md mx-auto">
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 font-sans">
            Research Execution Error
          </h3>
          <p className="text-xs text-rose-700 dark:text-rose-300 font-mono bg-rose-100 dark:bg-rose-950/80 p-3 rounded-lg border border-rose-200 dark:border-rose-900 text-left overflow-x-auto">
            {error}
          </p>
        </div>

        {onRetry && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              sounds.playClick();
              onRetry();
            }}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Retry Research Pipeline
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
