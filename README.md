# Intent-First Contact Prototype

[![Test and deploy](https://github.com/juanwise-br/lumi-labs-contact-prototype/actions/workflows/deploy.yml/badge.svg)](https://github.com/juanwise-br/lumi-labs-contact-prototype/actions/workflows/deploy.yml)

**[Open the live demo →](https://juanwise-br.github.io/lumi-labs-contact-prototype/)**

An intent-first contact experience, built as a working prototype. A visitor tells a conversational form what they need, the form asks only what is relevant, and a routing engine sends the request to the right team with the right context. Nothing gets lost.

This prototype comes from a real problem: generic contact forms sent inquiries to a central team for manual routing, and some never reached the right team. This repo is a rebuilt public version. It uses a fictional company, mock data, and generated test scenarios, and contains no customer records or employer information. The point is the product thinking, and the code that proves it works.

**Run it locally:** `npm install` then `npm run dev`

## What you can do in it

| Tab | What it shows |
|---|---|
| **Contact page** | The full conversational flow: product info, buy or quote, product support, and find a representative. Includes callback scheduling, region confirmation, a review step before sending, and a mock login that skips questions we already know. |
| **Product page** | The same contact component reused on a product page. The product is already known, so the conversation skips that question. |
| **Flow map** | Every path a visitor can take, generated from the flow config. Expand, collapse, or copy it as text. |
| **Routing treemap** | Simulated requests run through the real routing engine and shown as a treemap of teams and request types. |

A side panel called "Under the hood" shows the data collected so far and the routing decision with its reasons.

## The product ideas behind it

1. **Ask for intent before personal details.** The first questions are about what the visitor needs, not who they are. Every later question depends on the answer.
2. **Only ask what is relevant.** A support request and a purchase request do not get the same form. Known details (a logged in visitor) are skipped, not re-asked.
3. **Never apply a region without confirming it.** The site assumes the header region, then asks "Is that right?" and lets the visitor change it.
4. **Show people where their request is going.** A review step summarises everything before sending, with consent copy, and the confirmation includes a reference number.
5. **Route automatically, and never drop a request.** Routing falls back from regional team, to global desk for that function, to a global triage desk. There is no code path that returns "no team".
6. **Large opportunities get a priority lane.** A purchase over 100,000 USD jumps the standard queue.

## How it is built

```
src/lib/flows.ts      The whole conversation as data: steps, options, copy, next steps
src/lib/engine.ts     A small pure state machine that runs any flow in that config
src/lib/routing.ts    Routing rules, coverage map, and the fallback chain
src/lib/flowTree.ts   Builds the flow map straight from the config
src/lib/simulate.ts   Seeded request simulator for the treemap
src/lib/treemap.ts    Squarified treemap layout
src/components/       React UI: chat, panels, contact page, flow map, treemap
```

The key design choice is that **the conversation is data, not code**. A non technical owner can change a question, reorder steps, or add an option by editing one file, and the chat, the flow map, and the tests all update. That is the same principle as the requirement that regional teams configure intake without a code deployment.

React, TypeScript, and Vite. No UI libraries and no charting libraries. The treemap layout is written from scratch.

## Tests

`npm test` runs 25 tests covering:

- **Flow integrity.** Every next step exists, every step has what it needs, nothing is unreachable.
- **Engine behaviour.** Full flows end to end, invalid email handling, skipping known details, product page entry, auto advancing steps, start over.
- **Routing.** Regional match, global fallback, triage fallback, priority lane, callback queue, and 2,000 simulated requests with zero unrouted.
- **Treemap layout.** Fills the area, stays in bounds, sizes in proportion.

## What it maps to in the requirements

This prototype demonstrates requirements from the contact section (RC3) of the sample BRD in my portfolio repo:

| Requirement | Where it shows up |
|---|---|
| 3.1 Intake adapts to the active region | Region drives confirmation, phone numbers, routing |
| 3.3, 3.3b Capture intent first, show only relevant fields | Intent steps come first, fields follow the intent |
| 3.4a Plain language summary before submitting | Review step with consent copy |
| 3.5, 3.9 Automatic routing with qualification by intent | `routing.ts` |
| 3.7, 3.10 Confirmation and traceability | Reference number on every submission |
| 3.9a, 3.11 No interaction lost, fallback for every market | Three level fallback chain |
| 3.14a Callback with preferred window | Day and time steps |

## What I would measure

- Completion rate by step, to find where visitors abandon
- Time from submission to first response, by market and intent
- Share of requests that hit a fallback, by market (a signal that a regional team is missing)
- Share of requests reaching triage (a signal that region capture is weak)
- Priority lane response time against standard

## What this is not

It is a prototype, so some things are deliberately simple:

- No backend. Submissions are not sent anywhere, and the confirmation email is simulated.
- The country is free text on the "change region" step, so unrecognised entries go to triage. A production version would use a picker.
- Live chat is intentionally shown as unavailable, to demonstrate graceful fallback.
- Contacts, phone numbers, and teams are invented placeholders.

## How I built it

I designed the concept and iterated on it with an AI prototyping tool, then rebuilt it here from scratch as a clean, tested codebase using Claude Code and Claude. The routing logic, the treemap, the flow map, and the tests were added in the rebuild. I use AI to move fast, and I keep the decisions, the requirements, and the review for myself.
