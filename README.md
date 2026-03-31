# N1 Vocabulary App

A mobile-first vocabulary learning platform built with Next.js, TypeScript, Tailwind CSS, Prisma, and Stripe. The product is designed for Japanese language learners and includes a production-ready checkout flow that supports PayPay in Japan through Stripe Checkout.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Prisma with SQLite for local development
- Stripe Checkout + webhooks
- Zod validation

## Features Included

- Mobile-first landing page and pricing flow
- Study screen with vocabulary browsing, search, bookmarking, and progress tracking in the UI
- Server-side checkout endpoint
- Stripe webhook handler for purchase fulfillment
- Local database schema for purchases and study progress
- Environment template for Stripe and app configuration

## PayPay Notes

The current payment integration uses Stripe Checkout with `paypay` enabled for one-time payments in JPY. This is a practical way to launch online payments for customers in Japan.

Important limitation:

- PayPay through Stripe is for one-time payments, not subscriptions

If you later want recurring billing, we should add card subscriptions separately while keeping PayPay for one-time purchases.

## PDF Import

The current app includes sample N1 vocabulary data so the product is immediately usable. Once you add your PDF to the workspace, we can replace the sample content with your actual reference data and build a proper import pipeline.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Copy the environment template:

```bash
cp .env.example .env
```

3. Generate Prisma client and create the local database:

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```

4. Start the app:

```bash
npm run dev
```

## Stripe Webhook

For local webhook testing with Stripe CLI:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

Then add the signing secret shown by Stripe CLI into `STRIPE_WEBHOOK_SECRET`.
