import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTargetWordCount,
  formatDuration,
  estimateSpokenDurationSec,
  calculateChapterTimestamps,
  getCurrentChapterIndex,
  parseDialogueTurns,
} from './commuteLogic';

test('calculateTargetWordCount computes word budgets accurately for different formats', () => {
  // 10 min at solo (145 wpm)
  assert.equal(calculateTargetWordCount(10, 'solo'), 1450);
  // 5 min at executive (165 wpm)
  assert.equal(calculateTargetWordCount(5, 'executive'), 825);
  // Clamping min and max
  assert.equal(calculateTargetWordCount(0, 'solo'), 145); // clamped to 1 min
  assert.equal(calculateTargetWordCount(100, 'solo'), 60 * 145); // clamped to 60 min
});

test('formatDuration formats seconds into clean mm:ss and hh:mm:ss', () => {
  assert.equal(formatDuration(0), '0:00');
  assert.equal(formatDuration(45), '0:45');
  assert.equal(formatDuration(65), '1:05');
  assert.equal(formatDuration(600), '10:00');
  assert.equal(formatDuration(3665), '1:01:05');
  assert.equal(formatDuration(-10), '0:00');
});

test('estimateSpokenDurationSec estimates duration based on word count', () => {
  const sample = 'This is a ten word test sentence for the commute calculation';
  // 10 words at 150 wpm = (10 / 150) * 60 = 4 seconds
  const sec = estimateSpokenDurationSec(sample, 150);
  assert.equal(sec, 4);
  assert.equal(estimateSpokenDurationSec(''), 0);
});

test('calculateChapterTimestamps accurately accumulates offsets and total duration', () => {
  const intro = 'Good morning. Welcome to your daily commute briefing.'; // 8 words -> ~3s at 150wpm
  const chapters = [
    { title: 'Tech Story 1', text: 'This story has ten words to test duration calculation easily now.', articleId: 'art-1' },
    { title: 'Market Story 2', text: 'Another story with ten words to test second chapter offset now.', articleId: 'art-2' },
  ];
  const outro = 'That concludes your commute brief. Drive safely.';

  const result = calculateChapterTimestamps(intro, chapters, outro, 150);
  assert.equal(result.chaptersWithTimestamps.length, 2);
  assert.ok(result.chaptersWithTimestamps[0].startTimeSec >= 0);
  assert.ok(result.chaptersWithTimestamps[1].startTimeSec > result.chaptersWithTimestamps[0].startTimeSec);
  assert.ok(result.totalDurationSec > result.chaptersWithTimestamps[1].startTimeSec);
});

test('getCurrentChapterIndex finds active chapter based on time', () => {
  const dummyChapters = [
    { id: '1', title: 'Chapter 1', startTimeSec: 10, durationSec: 30, text: '' },
    { id: '2', title: 'Chapter 2', startTimeSec: 40, durationSec: 40, text: '' },
    { id: '3', title: 'Chapter 3', startTimeSec: 80, durationSec: 50, text: '' },
  ];

  assert.equal(getCurrentChapterIndex(5, dummyChapters), 0); // Before chapter 1 (intro)
  assert.equal(getCurrentChapterIndex(15, dummyChapters), 0);
  assert.equal(getCurrentChapterIndex(45, dummyChapters), 1);
  assert.equal(getCurrentChapterIndex(85, dummyChapters), 2);
  assert.equal(getCurrentChapterIndex(200, dummyChapters), 2);
});

test('parseDialogueTurns handles single and multi-speaker dialogue lines', () => {
  const dialogue = `Alex: Welcome to the commute podcast!
Today we have thrilling news.
Sam: That's right, Alex. Let us dive in.`;

  const parsed = parseDialogueTurns(dialogue);
  assert.equal(parsed.length, 2);
  assert.equal(parsed[0].speaker, 'Alex');
  assert.ok(parsed[0].text.includes('Welcome'));
  assert.ok(parsed[0].text.includes('Today we have thrilling news'));
  assert.equal(parsed[1].speaker, 'Sam');
  assert.ok(parsed[1].text.includes('diving in') || parsed[1].text.includes('dive in'));
});
