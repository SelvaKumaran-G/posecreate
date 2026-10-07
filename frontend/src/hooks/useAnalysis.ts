import { useState, useEffect, useCallback } from 'react';
import { analysisService } from '../services/analysis';
import { AnalysisSession, FullAnalysisResult } from '../types';

export function useAnalysis(id: string) {
  const [analysis, setAnalysis] = useState<FullAnalysisResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchAnalysis = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data = await analysisService.getAnalysis(id);
      setAnalysis(data);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(err?.message || 'Failed to fetch analysis'));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchAnalysis();
  }, [fetchAnalysis]);

  return { analysis, loading, error, refetch: fetchAnalysis };
}

export function useAnalysisHistory() {
  const [history, setHistory] = useState<AnalysisSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await analysisService.getAnalysisHistory();
      setHistory(data as unknown as AnalysisSession[]);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(err?.message || 'Failed to fetch history'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  return { history, loading, error, refetch: fetchHistory };
}
