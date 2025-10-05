# LoL Esports API Reference

## Overview
Complete reference for all available LoL Esports API endpoints and data structures.

**Base URLs:**
- Persisted API: `https://esports-api.lolesports.com/persisted/gw`
- Live Stats API: `https://feed.lolesports.com/livestats/v1`
- Highlander API: `https://api.lolesports.com/api/v1`

**Authentication:**
- Header: `x-api-key: 0TvQnueqKa5mxJntVWt0w4LpLfEkrV1Ta8rQBb9Z`

---

## 📊 Live Statistics API

### 1. Window Endpoint - Game Metadata & Team Composition

**Endpoint:** `GET /livestats/v1/window/{gameId}`

**Purpose:** Get champion picks, team composition, and basic game metadata

**Response Structure:**
```json
{
  "esportsGameId": "string",
  "esportsMatchId": "string",
  "gameMetadata": {
    "patchVersion": "14.24.123456",
    "blueTeamMetadata": {
      "esportsTeamId": "string",
      "tricode": "SDM",
      "participantMetadata": [
        {
          "participantId": 1,
          "esportsPlayerId": "string",
          "summonerName": "SDM Jauny",
          "championId": "Renekton",
          "role": "top"
        }
        // ... 4 more players
      ]
    },
    "redTeamMetadata": {
      // Same structure as blue team
    }
  },
  "frames": [] // Snapshot frames
}
```

**Available Data:**
- ✅ Champion picks (`championId`)
- ✅ Player names (`summonerName`)
- ✅ Roles (`top`, `jungle`, `mid`, `bottom`, `support`)
- ✅ Team information
- ✅ Patch version

**Example Champions from Live Game:**
- Blue Team: Renekton (top), Viego (jungle), Aurora (mid), Ezreal (bottom), Alistar (support)
- Red Team: Ambessa (top), Vi (jungle), Leblanc (mid), Kai'Sa (bottom), Rakan (support)

---

### 2. Details Endpoint - Live Game Statistics

**Endpoint:** `GET /livestats/v1/details/{gameId}`

**Purpose:** Get detailed player statistics, items, gold, KDA, and more

**Query Parameters:**
- `startingTime` (optional): ISO timestamp to get data from specific time
- `participantIds` (optional): Comma-separated list to filter specific players

**Response Structure:**
```json
{
  "frames": [
    {
      "rfc460Timestamp": "2025-10-05T12:34:56.789Z",
      "participants": [
        {
          "participantId": 1,
          "level": 12,
          "kills": 3,
          "deaths": 1,
          "assists": 5,
          "totalGoldEarned": 8500,
          "creepScore": 145,
          "items": [
            {
              "itemID": 3078,
              "slot": 0
            }
          ],
          
          // Combat Stats
          "attackDamage": 150,
          "abilityPower": 0,
          "armor": 85,
          "magicResistance": 42,
          "attackSpeed": 1.25,
          "criticalChance": 0.25,
          "lifeSteal": 0.12,
          "tenacity": 0,
          
          // Performance Metrics
          "championDamageShare": 0.23,
          "killParticipation": 0.67,
          
          // Vision
          "wardsPlaced": 12,
          "wardsDestroyed": 3,
          
          // Abilities & Perks
          "abilities": {
            "Q": 5,
            "W": 3,
            "E": 4,
            "R": 2
          },
          "perkMetadata": {
            "styleId": 8100,
            "subStyleId": 8300,
            "perks": [8112, 8143, 8138, 8135, 8306, 8345]
          }
        }
        // ... 9 more participants
      ]
    }
    // ... multiple frames (historical data)
  ]
}
```

**Available Stats Per Player:**
- **Basic:** participantId, level, kills, deaths, assists
- **Economy:** totalGoldEarned, creepScore
- **Items:** Array of {itemID, slot}
- **Combat:** attackDamage, abilityPower, armor, magicResistance, attackSpeed, criticalChance, lifeSteal, tenacity
- **Performance:** championDamageShare, killParticipation
- **Vision:** wardsPlaced, wardsDestroyed
- **Abilities:** Skill level per ability (Q, W, E, R)
- **Perks/Runes:** styleId, subStyleId, perks array

---

## 🗓️ Schedule & Events API

### 3. Get Live Matches

**Endpoint:** `GET /persisted/gw/getLive?hl=en-US`

**Purpose:** Get all currently live matches and shows

**Response:**
```json
{
  "data": {
    "schedule": {
      "events": [
        {
          "id": "115214006911026814",
          "type": "match",
          "state": "inProgress",
          "startTime": "2025-10-05T12:00:00Z",
          "blockName": "Week 1",
          "league": {
            "name": "NACL",
            "slug": "nacl",
            "image": "url"
          },
          "match": {
            "id": "115214006911026814",
            "type": "normal",
            "strategy": {
              "type": "bestOf",
              "count": 5
            },
            "teams": [
              {
                "id": "114194060984264362",
                "name": "SDM Tigres",
                "code": "SDM",
                "image": "url",
                "result": {
                  "outcome": null,
                  "gameWins": 0
                },
                "record": {
                  "wins": 10,
                  "losses": 5
                }
              }
            ],
            "games": [
              {
                "number": 1,
                "id": "115214006911026815",
                "state": "inProgress",
                "teams": [
                  {
                    "id": "114194060984264362",
                    "side": "blue"
                  },
                  {
                    "id": "114058334177574653",
                    "side": "red"
                  }
                ],
                "vods": []
              }
              // ... more games
            ]
          },
          "streams": [
            {
              "parameter": "lolesports",
              "locale": "en-US",
              "provider": "twitch",
              "mediaLocale": {
                "locale": "en-US",
                "englishName": "English",
                "translatedName": "English"
              }
            }
          ]
        }
      ]
    }
  }
}
```

**Key Fields:**
- `state`: "unstarted" | "inProgress" | "completed"
- `type`: "match" | "show"
- `games[].state`: Per-game state
- `games[].teams[].side`: "blue" | "red"
- `streams`: Available broadcast streams

---

### 4. Get Schedule

**Endpoint:** `GET /persisted/gw/getSchedule?hl=en-US&leagueId={leagueIds}`

**Purpose:** Get upcoming, live, and recent matches

**Parameters:**
- `hl`: Locale (default: en-US)
- `leagueId`: Array of league IDs (optional, omit for all)
- `pageToken`: For pagination

**Response:** Same structure as getLive

---

### 5. Get Event Details

**Endpoint:** `GET /persisted/gw/getEventDetails?id={eventId}&hl=en-US`

**Purpose:** Get detailed information about a specific event/match

**Parameters:**
- `id`: Event ID (numeric)
- `hl`: Locale

**Response:** Detailed event data including all games, teams, and metadata

---

### 6. Get Games

**Endpoint:** `GET /persisted/gw/getGames?id={gameIds}&hl=en-US`

**Purpose:** Get details for specific games

**Parameters:**
- `id`: Array of game IDs
- `hl`: Locale

---

## 🏆 League & Tournament API

### 7. Get Leagues

**Endpoint:** `GET /persisted/gw/getLeagues?hl=en-US`

**Purpose:** Get all available leagues

**Response:**
```json
{
  "data": {
    "leagues": [
      {
        "id": "98767991302996019",
        "slug": "lcs",
        "name": "LCS",
        "region": "NORTH AMERICA",
        "image": "url",
        "priority": 100
      }
    ]
  }
}
```

---

### 8. Get Tournaments for League

**Endpoint:** `GET /persisted/gw/getTournamentsForLeague?leagueId={id}&hl=en-US`

**Purpose:** Get tournaments (splits, playoffs) for a league

**Response:**
```json
{
  "data": {
    "leagues": [
      {
        "tournaments": [
          {
            "id": "123456",
            "slug": "lcs_2025_spring",
            "startDate": "2025-01-15",
            "endDate": "2025-04-15"
          }
        ]
      }
    ]
  }
}
```

---

### 9. Get Standings

**Endpoint:** `GET /persisted/gw/getStandings?tournamentId={tournamentIds}&hl=en-US`

**Purpose:** Get team standings for tournaments

**Parameters:**
- `tournamentId`: Array of tournament IDs
- `hl`: Locale

**Response:**
```json
{
  "data": {
    "standings": [
      {
        "stages": [
          {
            "name": "Regular Season",
            "sections": [
              {
                "rankings": [
                  {
                    "ordinal": 1,
                    "teams": [
                      {
                        "id": "string",
                        "name": "Team Name",
                        "code": "TN",
                        "image": "url",
                        "record": {
                          "wins": 15,
                          "losses": 3,
                          "ties": 0
                        }
                      }
                    ]
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

---

### 10. Get Completed Events

**Endpoint:** `GET /persisted/gw/getCompletedEvents?tournamentId={tournamentIds}&hl=en-US`

**Purpose:** Get completed matches for tournaments

**Parameters:**
- `tournamentId`: Array of tournament IDs
- `hl`: Locale

---

## 👥 Team & Player API

### 11. Get Teams

**Endpoint:** `GET /persisted/gw/getTeams?id={teamSlugs}&hl=en-US`

**Purpose:** Get detailed team information

**Parameters:**
- `id`: Array of team slugs or IDs
- `hl`: Locale

**Response:**
```json
{
  "data": {
    "teams": [
      {
        "id": "string",
        "slug": "team-slug",
        "name": "Team Name",
        "code": "TN",
        "image": "url",
        "alternativeImage": "url",
        "backgroundImage": "url",
        "status": "active",
        "homeLeague": {
          "name": "LCS",
          "region": "NORTH AMERICA"
        },
        "players": [
          {
            "id": "string",
            "summonerName": "PlayerName",
            "firstName": "John",
            "lastName": "Doe",
            "image": "url",
            "role": "top"
          }
        ]
      }
    ]
  }
}
```

---

## 🎮 Data Integration Guide

### Finding Live Game Stats

**Step 1:** Get live matches
```bash
GET /persisted/gw/getLive
```

**Step 2:** Find live game ID
```javascript
const liveMatch = response.data.schedule.events.find(e => e.state === 'inProgress');
const liveGame = liveMatch.match.games.find(g => g.state === 'inProgress');
const gameId = liveGame.id; // e.g., "115214006911026815"
```

**Step 3:** Get champion picks
```bash
GET /livestats/v1/window/{gameId}
```

**Step 4:** Get live stats
```bash
GET /livestats/v1/details/{gameId}
```

---

## 🔍 Live NACL Game Example

**Current Game:** NACL - SDM Tigres vs Luminosity Gaming

**Game ID:** `115214006911026815`

**Champion Picks:**

**Blue Team (SDM Tigres):**
- Top: Renekton (SDM Jauny)
- Jungle: Viego (SDM Mataz)
- Mid: Aurora (SDM Skyy)
- ADC: Ezreal (SDM VirusFx)
- Support: Alistar (SDM Ichiwin)

**Red Team (Luminosity Gaming):**
- Top: Ambessa (LG FakeGod)
- Jungle: Vi (LG Tomio)
- Mid: LeBlanc (LG Insanity)
- ADC: Kai'Sa (LG Tactical)
- Support: Rakan (LG Zeyzal)

---

## 📈 Available Statistics

### Champion Information
- ✅ Champion ID (e.g., "Renekton", "Ambessa")
- ✅ Role (top, jungle, mid, bottom, support)
- ✅ Player name

### Real-Time Stats
- ✅ KDA (Kills/Deaths/Assists)
- ✅ Level
- ✅ Gold earned
- ✅ CS (Creep Score)
- ✅ Items (with slot positions)
- ✅ Combat stats (AD, AP, Armor, MR, AS, Crit, LS)
- ✅ Performance metrics (Damage share, Kill participation)
- ✅ Vision (Wards placed/destroyed)
- ✅ Ability levels (Q, W, E, R)
- ✅ Runes/Perks

### Team Information
- ✅ Team names & logos
- ✅ Team codes
- ✅ Side (blue/red)
- ✅ Season record

### Match Information
- ✅ Best of X format
- ✅ Game number
- ✅ Game state (unstarted, inProgress, completed)
- ✅ Match state
- ✅ Start time

---

## 🚀 Implementation Status

**Currently Using:**
- ✅ getLive - Get live matches
- ✅ getSchedule - Get upcoming matches
- ✅ getEventDetails - Get match details
- ✅ window endpoint - Get champion picks
- ✅ details endpoint - Get player stats

**Available But Not Used:**
- ⭕ getLeagues - Could show league filters
- ⭕ getStandings - Could show standings table
- ⭕ getTournamentsForLeague - Tournament bracket
- ⭕ getTeams - Team profiles/pages
- ⭕ getGames - Historical game analysis
- ⭕ getCompletedEvents - Results archive

---

## 💡 Potential Features

### Using Available Data:

1. **Champion Statistics from Live Games**
   - Show which champions are being picked
   - Champion win rates in current patch
   - Popular builds from pro play

2. **Team Profiles**
   - Team rosters
   - Season records
   - Recent performance

3. **Standings Tables**
   - League standings
   - Playoff brackets
   - Tournament progress

4. **Historical Analysis**
   - Past match results
   - VOD links
   - Game-by-game breakdowns

5. **Live Game Deep Dive**
   - Gold graph over time
   - Item completion timeline
   - Vision control metrics
   - Ability level progression
   - Rune choices

---

## 📝 Notes

- **Rate Limiting:** Not documented, use responsibly
- **Real-Time Updates:** Stats update every ~10-30 seconds
- **Game Start:** Stats may be empty at game start (level 1, 0 gold)
- **Champion IDs:** Use champion name strings (e.g., "Renekton", "Leblanc")
- **Item IDs:** Numeric IDs (e.g., 3078 = Trinity Force)
- **Patch Version:** Available in gameMetadata
- **Timestamps:** RFC460 format (ISO 8601)

---

## 🔗 References

- [Unofficial API Documentation](https://vickz84259.github.io/lolesports-api-docs/)
- [LoL Esports Website](https://lolesports.com/)
- [Data Dragon (for champion/item data)](https://ddragon.leagueoflegends.com/)
