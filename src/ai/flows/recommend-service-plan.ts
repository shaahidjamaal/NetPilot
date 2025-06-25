'use server';

/**
 * @fileOverview An AI agent that recommends service packages based on customer usage patterns.
 *
 * - recommendServicePackage - A function that handles the service package recommendation process.
 * - RecommendServicePackageInput - The input type for the recommendServicePackage function.
 * - RecommendServicePackageOutput - The return type for the recommendServicePackage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendServicePackageInputSchema = z.object({
  customerUsageData: z
    .string()
    .describe(
      'A string containing customer usage data, including bandwidth consumption, data usage, and frequently used services.'
    ),
  currentServicePackage: z.string().describe("The name of the customer's current service package."),
  availableServicePackages: z
    .array(z.string())
    .describe('A list of available service packages that can be recommended.'),
});
export type RecommendServicePackageInput = z.infer<typeof RecommendServicePackageInputSchema>;

const RecommendServicePackageOutputSchema = z.object({
  recommendedServicePackage: z
    .string()
    .describe(
      'The name of the recommended service package, selected from the availableServicePackages, that best fits the customer\'s usage patterns.'
    ),
  reasoning: z
    .string()
    .describe(
      'A detailed explanation of why the recommended service package is the best fit for the customer, based on their usage data.'
    ),
  potentialBenefits: z
    .string()
    .describe(
      'A summary of the potential benefits to the customer of switching to the recommended service package, such as cost savings or improved performance.'
    ),
});
export type RecommendServicePackageOutput = z.infer<typeof RecommendServicePackageOutputSchema>;

export async function recommendServicePackage(
  input: RecommendServicePackageInput
): Promise<RecommendServicePackageOutput> {
  return recommendServicePackageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendServicePackagePrompt',
  input: {schema: RecommendServicePackageInputSchema},
  output: {schema: RecommendServicePackageOutputSchema},
  prompt: `You are an AI assistant that specializes in recommending service packages to customers based on their usage patterns.

  Analyze the customer's usage data and current service package to determine if there is a more suitable package among the available options.
  Provide a clear and concise recommendation, along with a detailed explanation of your reasoning and the potential benefits to the customer.

  Customer Usage Data: {{{customerUsageData}}}
  Current Service Package: {{{currentServicePackage}}}
  Available Service Packages: {{#each availableServicePackages}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}

  Based on this information, which service package would you recommend, and why?
  Reasoning should reference data points from customerUsageData.
  Potential benefits should focus on cost savings and performance improvements.
  Ensure that the output is well formatted and easy to understand.
  Output ONLY the recommended service package, reasoning, and potential benefits. Do not output conversational elements.
  `,
});

const recommendServicePackageFlow = ai.defineFlow(
  {
    name: 'recommendServicePackageFlow',
    inputSchema: RecommendServicePackageInputSchema,
    outputSchema: RecommendServicePackageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
