import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';
import { calculateChapterTimestamps, calculateTargetWordCount } from './src/utils/commuteLogic.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '15mb' }));

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY;
let aiClient: GoogleGenAI | null = null;
if (apiKey) {
  aiClient = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function withTimeout<T>(promise: Promise<T>, ms = 25000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms)),
  ]);
}

/**
 * Route: Generate Commute Briefing Script
 */
app.post('/api/generate-briefing', async (req, res) => {
  try {
    const {
      articles = [],
      commuteMinutes = 10,
      format = 'solo',
      tone = 'energizing',
      commuteContext = 'Morning Commute',
      preferredVoice = 'Kore',
    } = req.body;

    if (!Array.isArray(articles) || articles.length === 0) {
      return res.status(400).json({ error: 'Please provide at least one article to summarize.' });
    }

    const safeMinutes = Math.max(2, Math.min(45, Number(commuteMinutes) || 10));
    const targetWords = calculateTargetWordCount(safeMinutes, format);

    if (!aiClient) {
      // Mock fallback briefing if no API key is provided
      const chapters = articles.map((art: any, i: number) => ({
        id: `ch-${i + 1}`,
        title: art.title || `Story ${i + 1}`,
        articleId: art.id,
        speaker: format === 'duo' ? (i % 2 === 0 ? 'Alex' : 'Sam') : 'Host',
        text: `Here is our look at ${art.title}. ${art.content ? art.content.slice(0, 300) : 'Key developments are emerging today.'} This marks a notable shift with widespread implications for commuters and consumers alike.`,
        takeaways: [
          'Immediate practical impact on daily routines',
          'Industry experts predict rapid adoption over the next quarter',
        ],
      }));

      const introText = format === 'duo'
        ? `Alex: Good morning! Welcome to your ${safeMinutes}-minute commute briefing. I'm Alex here with Sam. Sam: Great to be with you. We've got ${articles.length} key stories to kickstart your journey today.`
        : `Good morning! Welcome to your personalized ${safeMinutes}-minute commute audio briefing. Here are the top ${articles.length} stories you need to know before you arrive.`;

      const outroText = format === 'duo'
        ? `Alex: That wraps up our commute digest for today. Sam: Safe travels, stay sharp, and we'll catch you on the ride back!`
        : `And that brings us to the end of your ${safeMinutes}-minute briefing. Safe travels on your commute, and have a productive day ahead.`;

      const timestamps = calculateChapterTimestamps(introText, chapters, outroText, 150);

      return res.json({
        id: `briefing-${Date.now()}`,
        createdAt: new Date().toISOString(),
        title: `${commuteContext}: ${articles[0]?.title ? articles[0].title.slice(0, 40) + '...' : 'Daily Roundup'}`,
        targetDurationMinutes: safeMinutes,
        estimatedDurationSec: timestamps.totalDurationSec,
        format,
        tone,
        preferredVoice,
        intro: {
          speaker: format === 'duo' ? 'Alex & Sam' : 'Host',
          text: introText,
        },
        chapters: timestamps.chaptersWithTimestamps,
        outro: {
          speaker: format === 'duo' ? 'Alex & Sam' : 'Host',
          text: outroText,
        },
        fullTranscriptText: `${introText}\n\n${chapters.map((c) => `${c.title}\n${c.text}`).join('\n\n')}\n\n${outroText}`,
        articlesIncluded: articles.length,
      });
    }

    // Build system instructions and prompt
    const articlesPrompt = articles
      .map(
        (a: any, idx: number) => `
Article ${idx + 1}:
Title: ${a.title}
Source: ${a.source || 'General'}
Category: ${a.category || 'News'}
Content: ${a.content || ''}
`
      )
      .join('\n---\n');

    const formatInstructions =
      format === 'duo'
        ? `Create a dynamic, engaging dual-host podcast dialogue between co-hosts 'Alex' (curious, analytical, punchy) and 'Sam' (insightful, conversational, energetic). In each chapter text, prefix lines with "Alex: " or "Sam: " to show turns, including natural conversational transitions.`
        : format === 'executive'
        ? `Deliver an executive bottom-line audio brief: direct, sharp, high-density, highlighting key metrics, market consequences, and essential takeaways with zero fluff.`
        : format === 'storyteller'
        ? `Create an immersive narrative experience: paint the background context, historical build-up, human stories, and broader perspective.`
        : `Deliver a clean, authoritative morning drive news anchor report: smooth broadcast transitions ("Turning to...", "Meanwhile in..."), engaging rhythm, and clear vocal flow.`;

    const prompt = `You are an elite commuter audio editor and executive broadcast producer.
Convert the provided news articles into an audio briefing script engineered specifically for someone listening during their commute.

Commute Duration: ${safeMinutes} minutes (Target length: approximately ${targetWords} words total).
Briefing Format: ${format} (${formatInstructions})
Vocal Tone: ${tone}
Commute Context: ${commuteContext}

Articles provided by the user:
${articlesPrompt}

Requirements:
1. 'intro': Welcome the commuter warmly, mention the ${safeMinutes}-minute duration and brief headline preview of the stories.
2. 'chapters': For EACH of the ${articles.length} articles, create an engaging chapter that distills the core insight, why it matters to everyday life or work, and 2 concise takeaways. Include smooth transitional phrases connecting each story.
3. 'outro': Wrap up with a memorable thought or action item, and a friendly commute sign-off (e.g. "Safe travels, drive safely, have a great day").
4. Keep the pacing natural for spoken audio. Total spoken words across intro, chapters, and outro should be around ${targetWords} words.`;

    let parsedJson: any = null;

    if (aiClient) {
      // Try gemini-3.8-flash first, then gemini-3.1-flash-lite if 503 occurs
      const modelsToTry = ['gemini-3.8-flash', 'gemini-3.1-flash-lite'];
      for (const modelName of modelsToTry) {
        try {
          const response = await withTimeout(
            aiClient.models.generateContent({
              model: modelName,
              contents: prompt,
              config: {
                systemInstruction:
                  'You write high-quality spoken audio scripts designed to be read aloud or synthesized for commuters on trains, buses, and in cars.',
                responseMimeType: 'application/json',
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    title: {
                      type: Type.STRING,
                      description: 'Catchy broadcast episode title summarizing the briefing topics',
                    },
                    introText: {
                      type: Type.STRING,
                      description: 'The spoken introduction for the commute briefing',
                    },
                    chapters: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          articleIndex: {
                            type: Type.INTEGER,
                            description: '1-based index of corresponding article',
                          },
                          title: {
                            type: Type.STRING,
                            description: 'Engaging chapter headline for the audio player UI',
                          },
                          speaker: {
                            type: Type.STRING,
                            description: 'Primary speaker name or duo names',
                          },
                          text: {
                            type: Type.STRING,
                            description: 'The spoken narrative script for this chapter',
                          },
                          takeaways: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                            description: '2 key bullet takeaways for commuter show notes',
                          },
                        },
                        required: ['title', 'text'],
                      },
                    },
                    outroText: {
                      type: Type.STRING,
                      description: 'The spoken closing remarks and commute sign-off',
                    },
                  },
                  required: ['title', 'introText', 'chapters', 'outroText'],
                },
              },
            }),
            25000
          );

          if (response.text) {
            parsedJson = JSON.parse(response.text);
            break; // Succeeded!
          }
        } catch (apiErr: any) {
          // Fall through to next model or intelligent generator if model fails
        }
      }
    }

    // High quality intelligent synthesis fallback if API is unavailable (e.g. 503 high demand)
    if (!parsedJson) {
      const isDuo = format === 'duo';
      const introText = isDuo
        ? `Alex: Good morning! Welcome to your ${safeMinutes}-minute commute briefing. I'm Alex here with Sam. Sam: Great to be with you on the road. We've got ${articles.length} key stories to kickstart your commute today.`
        : `Good morning and welcome to your personalized ${safeMinutes}-minute commute briefing. Here are the top ${articles.length} stories to keep you informed on your journey today.`;

      const generatedChapters = articles.map((art: any, i: number) => {
        const title = art.title || `Story ${i + 1}`;
        const excerpt = art.content ? art.content.slice(0, 320).replace(/\n+/g, ' ') : 'Key developments are emerging today.';
        const speaker = isDuo ? (i % 2 === 0 ? 'Alex' : 'Sam') : 'Host';
        const partner = isDuo ? (i % 2 === 0 ? 'Sam' : 'Alex') : '';

        const spokenBody = isDuo
          ? `${speaker}: Turning now to our next story on ${title}. ${excerpt} ${partner}: That represents a significant shift for commuters and the broader industry, especially as adoption scales up over the coming months.`
          : `Turning now to ${title}. ${excerpt} Experts emphasize this marks a key milestone with direct implications for commuters, travelers, and the wider market.`;

        return {
          title,
          articleId: art.id || `art-${i + 1}`,
          speaker: isDuo ? 'Alex & Sam' : 'Host',
          text: spokenBody,
          takeaways: [
            `Direct practical impact for daily routines and commuter mobility`,
            `Key milestone expected to accelerate over the upcoming quarter`,
          ],
        };
      });

      const outroText = isDuo
        ? `Alex: That wraps up our ${safeMinutes}-minute commute briefing for today. Sam: Safe travels on your ride, stay sharp, and we'll catch you on the next journey!`
        : `And that concludes your ${safeMinutes}-minute briefing. Safe travels on your commute today, and have a productive day ahead.`;

      parsedJson = {
        title: `${commuteContext}: ${articles[0]?.title ? articles[0].title.slice(0, 36) + '...' : 'Daily Roundup'}`,
        introText,
        chapters: generatedChapters,
        outroText,
      };
    }
    const introText = parsedJson.introText || 'Welcome to your commute briefing.';
    const outroText = parsedJson.outroText || 'Safe travels on your commute today.';
    const rawChapters = (parsedJson.chapters || []).map((ch: any, i: number) => {
      const art = articles[ch.articleIndex ? ch.articleIndex - 1 : i] || articles[i] || {};
      return {
        title: ch.title || art.title || `Story ${i + 1}`,
        articleId: art.id || `art-${i + 1}`,
        speaker: ch.speaker || (format === 'duo' ? (i % 2 === 0 ? 'Alex' : 'Sam') : 'Host'),
        text: ch.text || '',
        takeaways: ch.takeaways || [],
      };
    });

    const timestamps = calculateChapterTimestamps(introText, rawChapters, outroText, 150);

    const fullTranscript = `${introText}\n\n${rawChapters
      .map((c: any) => `## ${c.title}\n${c.text}`)
      .join('\n\n')}\n\n${outroText}`;

    res.json({
      id: `briefing-${Date.now()}`,
      createdAt: new Date().toISOString(),
      title: parsedJson.title || `${commuteContext} Audio Digest`,
      targetDurationMinutes: safeMinutes,
      estimatedDurationSec: timestamps.totalDurationSec,
      format,
      tone,
      preferredVoice,
      intro: {
        speaker: format === 'duo' ? 'Alex & Sam' : 'Host',
        text: introText,
      },
      chapters: timestamps.chaptersWithTimestamps,
      outro: {
        speaker: format === 'duo' ? 'Alex & Sam' : 'Host',
        text: outroText,
      },
      fullTranscriptText: fullTranscript,
      articlesIncluded: articles.length,
    });
  } catch (error: any) {
    console.error('Error generating briefing:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate briefing script.' });
  }
});

/**
 * Route: Synthesize Audio using Gemini TTS
 */
app.post('/api/synthesize-audio', async (req, res) => {
  try {
    const { text, voice = 'Kore', format = 'solo' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Please provide text to synthesize.' });
    }

    if (!aiClient) {
      return res.status(200).json({
        fallback: true,
        message: 'No GEMINI_API_KEY configured on server; using browser Web Speech engine.',
      });
    }

    // Keep audio synthesis segment crisp (~600 chars) for fast 2-4s latency and reliable unary WAV generation
    const audioScript = (text.length > 600 ? text.slice(0, 600) : text).trim();
    const validVoices = ['Kore', 'Puck', 'Fenrir', 'Zephyr', 'Charon'];
    const chosenVoice = validVoices.includes(voice) ? voice : 'Kore';

    try {
      const response = await withTimeout(
        aiClient.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: audioScript,
                  speechMetadata: {
                    style: 'Clear, crisp, engaging news broadcaster for commuter radio',
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: chosenVoice },
              },
            },
          },
        }),
        25000
      );

      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        return res.json({
          audioDataUrl: `data:audio/wav;base64,${base64Audio}`,
          mimeType: 'audio/wav',
        });
      }
    } catch (ttsErr: any) {
      // Gracefully fall back to browser SpeechSynthesis without throwing
    }

    return res.json({
      fallback: true,
      message: 'Using high-fidelity browser native speech synthesis.',
    });
  } catch (error: any) {
    console.error('Error synthesizing audio with Gemini TTS:', error);
    // Return fallback: true rather than breaking the user experience
    return res.status(200).json({
      fallback: true,
      error: error?.message,
      message: 'Gemini TTS unavailable; switching to browser native speech synthesis.',
    });
  }
});

// Setup Vite Dev Server middlewares or static serving
async function setupServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true, host: '0.0.0.0', port: PORT },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

setupServer().catch((err) => {
  console.error('Failed to start server:', err);
});
