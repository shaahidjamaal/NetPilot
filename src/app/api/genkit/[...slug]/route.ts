import {createAppHostingHandler} from '@genkit-ai/next';
import '@/ai/dev'; // This imports and registers the flows

export const {GET, POST} = createAppHostingHandler();
