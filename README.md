This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## ML Engineering Roadmap

Sonique is being extended from an AI voice application into an
evaluation-driven ML engineering project. See
[`docs/ml-engineering-relevance-roadmap.md`](docs/ml-engineering-relevance-roadmap.md)
for the planned TTS benchmark harness, PyTorch/Hugging Face experiments,
synthetic data generation, failure analysis, and production observability work.

The first evaluation artifact lives in [`ml/evals`](ml/evals): a reproducible
TTS prompt suite and Python benchmark runner for latency, failure rate, audio
duration, loudness, clipping, and prompt robustness.

The research write-up is in [`docs/research-report.md`](docs/research-report.md),
and the first PyTorch model-development baseline is in
[`ml/experiments/001_voice_quality_classifier`](ml/experiments/001_voice_quality_classifier).

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

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

Sonique can run on Vercel with a hosted PostgreSQL database and the existing
Supabase Storage, Clerk, Polar, and Chatterbox services.

1. Import this repository into Vercel and keep the detected Next.js defaults.
2. Copy every variable from `.env.example` into **Project Settings →
   Environment Variables**. Replace the examples with real credentials.
3. Set `APP_URL` to the production deployment URL, for example
   `https://sonique.vercel.app`.
4. Use a pooled PostgreSQL connection string for `DATABASE_URL`. Supabase and
   Neon both provide serverless-compatible pooled URLs.
5. Apply the committed migrations once before serving production traffic:

   ```bash
   DATABASE_URL="postgresql://..." npx prisma migrate deploy
   ```

6. In Clerk, allow the Vercel production domain and configure the organization
   feature used by the app. If Polar or Chatterbox use callback/domain allow
   lists, add the same production URL there.
7. Deploy. The build command is already `npm run build`; it generates Prisma
   Client before running the Next.js production build.

The tRPC function is configured for Vercel Hobby's 60-second maximum duration
because text-to-speech generation waits for the external Chatterbox API.
Requests that consistently take longer than 60 seconds should be converted to
an asynchronous job flow.

For preview deployments, either add each preview URL to the external services'
allow lists or limit sensitive environment variables to Production.
