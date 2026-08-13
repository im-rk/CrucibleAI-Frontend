/**
 * Utility formatters for scientific data visualization.
 */

export function formatSimilarity(similarity: number): string {
  if (typeof similarity !== 'number' || isNaN(similarity)) return 'N/A';
  return `${(similarity * 100).toFixed(1)}%`;
}

export function formatArxivUrl(arxivId: string): string {
  const cleanId = arxivId.replace(/^arxiv:/i, '');
  return `https://arxiv.org/abs/${cleanId}`;
}

export function getConfidenceBadgeColor(confidence?: string): {
  bg: string;
  text: string;
  border: string;
} {
  const norm = (confidence || '').toLowerCase();
  if (norm.includes('high')) {
    return {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
    };
  }
  if (norm.includes('medium') || norm.includes('med')) {
    return {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
    };
  }
  if (norm.includes('low')) {
    return {
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      border: 'border-rose-500/30',
    };
  }
  return {
    bg: 'bg-cyan-500/10',
    text: 'text-cyan-400',
    border: 'border-cyan-500/30',
  };
}

export function truncateText(text: string, maxLength = 160): string {
  if (!text || text.length <= maxLength) return text || '';
  return `${text.slice(0, maxLength)}...`;
}
