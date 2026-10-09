# Domain Docs

## Layout

This repo uses a single-context layout:

- `GLOSSARY.md` at the repo root for shared domain vocabulary.
- `docs/adr/` for architectural decision records.

## Before exploring

Read the root glossary and ADRs relevant to the area being explored.

If these files do not exist, proceed silently. Do not flag their absence or suggest creating them
upfront. The domain-modeling skill creates them lazily when terms or decisions are resolved.

## Use the glossary's vocabulary

Use defined domain terms in issue titles, refactor proposals, hypotheses, and test names. Avoid
synonyms the glossary explicitly rejects.

If a concept is missing, reconsider whether the project uses it or note the gap for domain-modeling.

## Flag ADR conflicts

Explicitly identify any proposal that contradicts an existing ADR, including the ADR identifier and
why the decision should be revisited.
