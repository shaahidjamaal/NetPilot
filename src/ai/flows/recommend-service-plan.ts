// This file is machine-generated - edit at your own risk!

'use server';

/**
 * @fileOverview An AI agent that recommends service plans based on customer usage patterns.
 *
 * - recommendServicePlan - A function that handles the service plan recommendation process.
 * - RecommendServicePlanInput - The input type for the recommendServicePlan function.
 * - RecommendServicePlanOutput - The return type for the recommendServicePlan function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendServicePlanInputSchema = z.object({
  customerUsageData: z
    .string()
    .describe(
      'A string containing customer usage data, including bandwidth consumption, data usage, and frequently used services.'
    ),
  currentServicePlan: z.string().describe('The name of the customer\'s current service plan.'),
  availableServicePlans: z
    .array(z.string())
    .describe('A list of available service plans that can be recommended.'),
});
export type RecommendServicePlanInput = z.infer<typeof RecommendServicePlanInputSchema>;

const RecommendServicePlanOutputSchema = z.object({
  recommendedServicePlan: z
    .string()
    .describe(
      'The name of the recommended service plan, selected from the availableServicePlans, that best fits the customer\'s usage patterns.'
    ),
  reasoning: z
    .string()
    .describe(
      'A detailed explanation of why the recommended service plan is the best fit for the customer, based on their usage data.'
    ),
  potentialBenefits: z
    .string()
    .describe(
      'A summary of the potential benefits to the customer of switching to the recommended service plan, such as cost savings or improved performance.'
    ),
});
export type RecommendServicePlanOutput = z.infer<typeof RecommendServicePlanOutputSchema>;

export async function recommendServicePlan(
  input: RecommendServicePlanInput
): Promise<RecommendServicePlanOutput> {
  return recommendServicePlanFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendServicePlanPrompt',
  input: {schema: RecommendServicePlanInputSchema},
  output: {schema: RecommendServicePlanOutputSchema},
  prompt: `You are an AI assistant that specializes in recommending service plans to customers based on their usage patterns.

  Analyze the customer's usage data and current service plan to determine if there is a more suitable plan among the available options.
  Provide a clear and concise recommendation, along with a detailed explanation of your reasoning and the potential benefits to the customer.

  Customer Usage Data: {{{customerUsageData}}}
  Current Service Plan: {{{currentServicePlan}}}
  Available Service Plans: {{#each availableServicePlans}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Based on this information, which service plan would you recommend, and why?
  Reasoning should reference data points from customerUsageData.
  Potential benefits should focus on cost savings and performance improvements.
  Ensure that the output is well formatted and easy to understand.
  Output ONLY the recommended service plan, reasoning, and potential benefits. Do not output conversational elements.
  `,
});

const recommendServicePlanFlow = ai.defineFlow(
  {
    name: 'recommendServicePlanFlow',
    inputSchema: RecommendServicePlanInputSchema,
    outputSchema: RecommendServicePlanOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
