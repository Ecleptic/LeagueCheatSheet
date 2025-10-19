export interface TermEntry {
  id: string;
  term: string;
  aliases?: string[];
  definition: string;
  example?: string;
  related?: string[]; // related terms
}

export interface TermsIndex {
  [id: string]: TermEntry;
}