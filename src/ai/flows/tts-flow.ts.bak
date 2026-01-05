'use server';

/**
 * @fileOverview A flow for generating audio from text using a Text-to-Speech (TTS) model.
 *
 * - generateAudioFromText - A function that handles the TTS process.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { googleAI } from '@genkit-ai/google-genai';
import wav from 'wav';

const GenerateAudioInputSchema = z.object({
  text: z.string().describe('The text to convert to speech.'),
  voice: z.enum(['Algenib', 'Achernar', 'Sirius', 'Vega']).default('Algenib').describe('The prebuilt voice to use.'),
});
export type GenerateAudioInput = z.infer<typeof GenerateAudioInputSchema>;

const GenerateAudioOutputSchema = z.object({
  audioDataUri: z.string().describe('The generated audio as a data URI in WAV format.'),
});
export type GenerateAudioOutput = z.infer<typeof GenerateAudioOutputSchema>;


export async function generateAudioFromText(input: GenerateAudioInput): Promise<GenerateAudioOutput> {
    const { media } = await ai.generate({
        model: googleAI.model('gemini-2.5-flash-preview-tts'),
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: input.voice },
            },
          },
        },
        prompt: input.text,
      });

      if (!media || !media.url) {
        throw new Error('No audio was returned from the model.');
      }
      
      const audioBuffer = Buffer.from(
        media.url.substring(media.url.indexOf(',') + 1),
        'base64'
      );

      const wavBase64 = await toWav(audioBuffer);
      
      return {
        audioDataUri: 'data:audio/wav;base64,' + wavBase64,
      };
}

async function toWav(
    pcmData: Buffer,
    channels = 1,
    rate = 24000,
    sampleWidth = 2
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const writer = new wav.Writer({
        channels,
        sampleRate: rate,
        bitDepth: sampleWidth * 8,
      });
  
      let bufs: any[] = [];
      writer.on('error', reject);
      writer.on('data', function (d) {
        bufs.push(d);
      });
      writer.on('end', function () {
        resolve(Buffer.concat(bufs).toString('base64'));
      });
  
      writer.write(pcmData);
      writer.end();
    });
}
