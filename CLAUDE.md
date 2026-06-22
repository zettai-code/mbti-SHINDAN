# CLAUDE.md

## Project Overview

This is a Japanese job-fit diagnosis app built with Next.js, React, TypeScript, and Tailwind CSS.

The app combines MBTI-style personality diagnosis with career and company matching for job hunting. It scores users across multiple work-related parameters, then compares them against job and company profiles.

## Development Commands

```bash
npm run dev
npm run build
npm run lint
npm run scrape:universities
```

## Architecture Notes

- App Router pages live in `src/app`.
- Shared UI components live in `src/components`.
- Diagnosis and matching logic lives in `src/lib`.
- Static diagnosis, company, job, and hiring datasets live in `src/data`.
- Type definitions live in `src/types`.

## Important Logic

- `src/lib/diagnosis.ts` handles MBTI-style axis scoring.
- `src/lib/job-fit-engine.ts` handles job/company match scoring.
- `src/lib/job-fit-types.ts` defines job-fit related types and answer scale options.
- `src/lib/companies.ts` handles company data access.
- `src/lib/access-stats.ts` handles local access tracking.

## Data Notes

- Company and hiring datasets are JSON files under `src/data`.
- Do not change the shape of JSON data without updating related TypeScript types and consumers.
- Keep Japanese labels and user-facing text consistent.

## Coding Guidelines

- Prefer existing patterns before adding new abstractions.
- Keep changes scoped to the requested feature or fix.
- Use TypeScript types instead of loose objects where practical.
- Keep UI text in Japanese.
- Run `npm run lint` and `npm run build` before finishing larger changes.

## Git Notes

- Do not overwrite unrelated local changes.
- This repo may contain generated or scraped data. Confirm before deleting large data files.
