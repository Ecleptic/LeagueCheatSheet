export interface SummonerSpellImage {
  full: string;
  sprite: string;
  group: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface SummonerSpell {
  id: string;
  name: string;
  description: string;
  tooltip: string;
  maxrank: number;
  cooldown: number[];
  cooldownBurn: string;
  cost: number[];
  costBurn: string;
  datavalues: Record<string, unknown>;
  effect: (number[] | null)[];
  effectBurn: (string | null)[];
  vars: Array<{
    key: string;
    link: string;
    coeff: number[];
  }>;
  key: string;
  summonerLevel: number;
  modes: string[];
  costType: string;
  maxammo: string;
  range: number[];
  rangeBurn: string;
  image: SummonerSpellImage;
  resource: string;
}

export interface SummonerSpellsResponse {
  type: string;
  version: string;
  data: Record<string, SummonerSpell>;
}

export interface SummonerSpellSummary {
  id: string;
  name: string;
  description: string;
  cooldownBurn: string;
  summonerLevel: number;
  modes: string[];
  image: SummonerSpellImage;
  key: string;
}