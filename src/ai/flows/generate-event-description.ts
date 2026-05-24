'use server';
/**
 * @fileOverview This file implements a Genkit flow for generating engaging event descriptions and taglines.
 *
 * - generateEventDescription - A function that orchestrates the generation of event descriptions and taglines.
 * - GenerateEventDescriptionInput - The input type for the generateEventDescription function.
 * - GenerateEventDescriptionOutput - The return type for the generateEventDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEventDescriptionInputSchema = z.object({
  eventType: z
    .string()
    .describe('The type of the event (e.g., "Wedding", "Birthday Party", "Corporate Event").'),
  eventDate: z
    .string()
    .describe('The date of the event in YYYY-MM-DD format (e.g., "2024-12-31").'),
  moodPreferences: z
    .string()
    .describe('Keywords describing the desired mood and vibe for the event (e.g., "energetic, luxurious, romantic").'),
  packageType: z
    .string()
    .describe('The booking package chosen for the event (e.g., "Silver", "Gold").'),
});
export type GenerateEventDescriptionInput = z.infer<
  typeof GenerateEventDescriptionInputSchema
>;

const GenerateEventDescriptionOutputSchema = z.object({
  tagline: z.string().describe('A short, catchy, and compelling tagline for the event.'),
  description: z
    .string()
    .describe('A detailed, engaging, and unique description for promotional material.'),
});
export type GenerateEventDescriptionOutput = z.infer<
  typeof GenerateEventDescriptionOutputSchema
>;

export async function generateEventDescription(
  input: GenerateEventDescriptionInput
): Promise<GenerateEventDescriptionOutput> {
  return generateEventDescriptionFlow(input);
}

const generateEventDescriptionPrompt = ai.definePrompt({
  name: 'generateEventDescriptionPrompt',
  input: {schema: GenerateEventDescriptionInputSchema},
  output: {schema: GenerateEventDescriptionOutputSchema},
  prompt: `You are an expert marketing copywriter for a premium DJ service named "DJ SANJAY". Your task is to craft compelling promotional content for an event.

Based on the following details, generate a unique and engaging tagline and a detailed description for the event:

Event Type: {{{eventType}}}
Event Date: {{{eventDate}}}
Desired Mood/Vibe: {{{moodPreferences}}}
Booking Package: {{{packageType}}}

Ensure the tone is sophisticated, exciting, and reflects the premium quality of DJ Sanjay's services. The tagline should be short and memorable, while the description should captivate potential attendees and clients.`,
});

const generateEventDescriptionFlow = ai.defineFlow(
  {
    name: 'generateEventDescriptionFlow',
    inputSchema: GenerateEventDescriptionInputSchema,
    outputSchema: GenerateEventDescriptionOutputSchema,
  },
  async input => {
    const {output} = await generateEventDescriptionPrompt(input);
    return output!;
  }
);
