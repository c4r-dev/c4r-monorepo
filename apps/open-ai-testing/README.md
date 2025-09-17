## Instructions for implementing API
- Environment variables
    - Add the openAI API key to both your local environment and Vercel upon deployment
    - OPENAI_API_KEY="key here"
- Add the code to handle the API route to the OpenAI API
    - Typical file path in nextJS: app/api/openAiAPI/route.js
    - See examples in open-ai-testing
        - Examples differ in…
- Utilize the API in a component
    - See example components
        - ChatDemo - component for single use chat
        - OngoingChat - component for ongoing chat
        - AlliterationChat - component for rewriting a sentence to make it as alliterative as possible
        - SentenceComplete - component for sentence completion upon detection of ... in the text area

    - Note: The exact functionality depends on both the API implementation and the component usage
        - For example, some API routes may have a hardcoded system prompt, while others expect system prompts or other parameters to be included in the request body
        - The API route may require a different set of parameters depending on the model used



Each call to the 


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More