/**
 * Pure calculation and parsing utilities for commute audio briefings
 */

export interface ArticleInput {
  id: string;
  title: string;
  source?: string;
  category: string;
  content: string;
  included: boolean;
}

export interface BriefingChapter {
  id: string;
  title: string;
  articleId?: string;
  startTimeSec: number;
  durationSec: number;
  speaker?: string;
  text: string;
  takeaways?: string[];
}

export interface BriefingScript {
  id: string;
  createdAt: string;
  title: string;
  targetDurationMinutes: number;
  estimatedDurationSec: number;
  format: 'solo' | 'duo' | 'executive' | 'storyteller';
  tone: string;
  intro: {
    speaker?: string;
    text: string;
  };
  chapters: BriefingChapter[];
  outro: {
    speaker?: string;
    text: string;
  };
  fullTranscriptText: string;
  audioUrl?: string; // Data URL or object URL
  articlesIncluded: number;
}

/**
 * Average speaking rates (words per minute) based on format and speed
 */
export const BASE_WPM: Record<string, number> = {
  solo: 145,
  duo: 155,
  executive: 165,
  storyteller: 135,
};

/**
 * Calculates target word budget for a desired commute duration
 */
export function calculateTargetWordCount(durationMinutes: number, format: 'solo' | 'duo' | 'executive' | 'storyteller' = 'solo'): number {
  const safeMinutes = Math.max(1, Math.min(60, durationMinutes));
  const rate = BASE_WPM[format] || 150;
  return Math.round(safeMinutes * rate);
}

/**
 * Formats seconds into human-readable MM:SS or HH:MM:SS
 */
export function formatDuration(totalSeconds: number): string {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '0:00';
  const rounded = Math.floor(totalSeconds);
  const minutes = Math.floor(rounded / 60);
  const seconds = rounded % 60;
  const paddedSeconds = seconds < 10 ? `0${seconds}` : `${seconds}`;

  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const paddedMinutes = remainingMinutes < 10 ? `0${remainingMinutes}` : `${remainingMinutes}`;
    return `${hours}:${paddedMinutes}:${paddedSeconds}`;
  }

  return `${minutes}:${paddedSeconds}`;
}

/**
 * Estimates reading/spoken time in seconds from text content
 */
export function estimateSpokenDurationSec(text: string, wpm = 150): number {
  if (!text) return 0;
  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  if (wordCount === 0) return 0;
  return Math.round((wordCount / wpm) * 60);
}

/**
 * Computes chapter start timestamps sequentially
 */
export function calculateChapterTimestamps(
  introText: string,
  chapters: Array<{ title: string; text: string; articleId?: string; speaker?: string; takeaways?: string[] }>,
  outroText: string,
  wpm = 150
): {
  chaptersWithTimestamps: BriefingChapter[];
  totalDurationSec: number;
} {
  const introDuration = estimateSpokenDurationSec(introText, wpm);
  let currentOffset = introDuration;

  const chaptersWithTimestamps: BriefingChapter[] = chapters.map((ch, idx) => {
    const chDuration = estimateSpokenDurationSec(ch.text, wpm);
    const item: BriefingChapter = {
      id: `ch-${idx + 1}`,
      title: ch.title,
      articleId: ch.articleId,
      startTimeSec: currentOffset,
      durationSec: Math.max(5, chDuration),
      speaker: ch.speaker,
      text: ch.text,
      takeaways: ch.takeaways || [],
    };
    currentOffset += item.durationSec;
    return item;
  });

  const outroDuration = estimateSpokenDurationSec(outroText, wpm);
  const totalDurationSec = currentOffset + outroDuration;

  return {
    chaptersWithTimestamps,
    totalDurationSec,
  };
}

/**
 * Finds current chapter based on audio playback time
 */
export function getCurrentChapterIndex(
  currentTimeSec: number,
  chapters: BriefingChapter[]
): number {
  if (!chapters.length) return -1;
  if (currentTimeSec < (chapters[0]?.startTimeSec ?? 0)) {
    return 0; // In intro or start
  }

  for (let i = chapters.length - 1; i >= 0; i--) {
    if (currentTimeSec >= chapters[i].startTimeSec) {
      return i;
    }
  }
  return 0;
}

/**
 * Parses raw text or dialogue into speaker turns if present (e.g. "Alex: ... \n Sam: ...")
 */
export function parseDialogueTurns(text: string): Array<{ speaker: string; text: string }> {
  if (!text) return [];
  const lines = text.split('\n');
  const turns: Array<{ speaker: string; text: string }> = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const speakerMatch = trimmed.match(/^([A-Za-z0-9_\s]{2,15}):\s*(.+)$/);
    if (speakerMatch) {
      turns.push({
        speaker: speakerMatch[1].trim(),
        text: speakerMatch[2].trim(),
      });
    } else {
      if (turns.length > 0) {
        turns[turns.length - 1].text += ' ' + trimmed;
      } else {
        turns.push({ speaker: 'Host', text: trimmed });
      }
    }
  }

  return turns;
}
