# Case study: an intent-first contact experience

**Role:** Product manager, concept through working prototype
**Stack:** React, TypeScript, Vite, Vitest
**Status:** Prototype with mock data

## The problem

On large B2B sites, "Contact us" is often the least designed page. Visitors face one generic form that asks for everything up front. Requests land in a central queue and get rerouted by hand, sometimes days later. The visitor has no idea where their request went, and the receiving team has no idea what the visitor actually needed.

The cost is real but hard to see: abandoned forms, slow response, and leads that go to a competitor first.

## The approach

I treated contact as a routing problem, not a form problem. The question is not "what fields do we need?" It is "what do we need to know to put this request in front of the right person, fast?"

That led to four decisions:

1. **Lead with intent.** Ask what the visitor needs before asking who they are. Intent decides everything that follows.
2. **Make it a conversation.** One question at a time, with options as pills where the answer is a choice, and a text field only when typing is required. This keeps each step light and lets the flow branch without showing irrelevant fields.
3. **Keep the logic in data.** The whole conversation lives in one config file. Owners can change copy and structure without touching components. The flow map and tests read the same file, so documentation cannot drift from behaviour.
4. **Guarantee delivery.** Routing falls back from regional team, to a global desk, to a triage desk. The system is built so that "no team" is impossible, and a test proves it across 2,000 simulated requests.

## Trade-offs I made

| Decision | Why | What it costs |
|---|---|---|
| Conversational, one question at a time | Lower effort per step, easy branching | More steps than a single form for visitors who know exactly what they want |
| Confirm region instead of assuming it | Avoids wrong routing and respects the visitor | One extra tap |
| Priority lane for large opportunities | The most valuable requests should not wait in line | Needs a clear, auditable threshold so it is not gamed |
| Free text country on the change region step | Fast to build in a prototype | Some entries go to triage. A picker would fix this in production. |

## What I would measure first

- Completion rate by step and by market
- Time to first response, by intent and market
- Fallback rate by market, as a signal of missing regional coverage
- Triage rate, as a signal of weak region capture
- Priority lane response time against standard

## What I learned

The hardest part was not the interface. It was agreeing what the routing rules should be, and being honest about where coverage had gaps. The treemap made that conversation easy, because gaps became visible as large blocks on global desks. Making the rules visible is what gets them fixed.
