/**
 * Team logo helper
 * Attempts to guess team logo URLs from known patterns, falls back to provided team.image
 */

export function guessTeamLogo(teamNameOrSlug?: string, fallback?: string) {
  if (!teamNameOrSlug) return fallback || '/default-team-logo.png';
  const slug = teamNameOrSlug.toLowerCase().replace(/[^a-z0-9]/g, '-');

  // Common static pattern (subject to change by Riot):
  // https://static.lolesports.com/teams/{slug}.png
  const candidate = `https://static.lolesports.com/teams/${slug}.png`;

  // Return candidate - components should attempt to use it and fallback on error
  return candidate || fallback || '/default-team-logo.png';
}
