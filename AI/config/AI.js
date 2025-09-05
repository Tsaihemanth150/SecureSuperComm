;
import { googleAI } from '@genkit-ai/googleai';
import { genkit, z } from 'genkit';

const ai = genkit({
    plugins: [googleAI()],
    model: googleAI.model('gemini-2.5-flash', {
      temperature: 0.8
    }),
  });

  export default ai;
