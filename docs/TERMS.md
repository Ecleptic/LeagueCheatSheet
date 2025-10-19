# Terminology & Phrases

This feature provides a searchable glossary of common League of Legends esports terms and phrases, aimed at spectators and newcomers.

What it includes:
- Short definitions with plain-language explanations
- Example sentences to place the term in context
- Related terms to help explore connected concepts

Current implementation:
- Local static dictionary stored in `src/components/terms/TermsPage.tsx`
- Search and filter by term or example

Planned enhancements:
- Add admin or contributor editable JSON for community contributions
- Optional integration with external sources (Urban Dictionary API, Reddit r/leagueoflegends threads) as an opt-in feature
 - Optional integration with external sources (Urban Dictionary API) as an opt-in feature (implemented)
- Caching and moderation for external content

References:
- Urban Dictionary API (Unofficial) - may be used for community-sourced definitions
- Reddit API (r/leagueoflegends) - examples and popular phrase usage

Usage:
- Visit `/terms` or use the "Terms" bottom nav/tab in the app
- Search for terms or browse the list

Implementation notes:
- Keep the content local by default for reliability and safety
- Any external fetches should be opt-in and cached to avoid rate limits
 - The app implements Urban Dictionary fetch with localStorage caching for 24 hours. This is opt-in and must be triggered by the user per search.
