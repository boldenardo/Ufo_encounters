export type SightingSource = 'wikipedia' | 'pursue-2026' | 'nuforc-aggregate';

export type Sighting = {
  id: string;
  date: string;
  year: number | null;
  name: string;
  location: {
    name: string;
    lat: number;
    lon: number;
  };
  description: string;
  source: SightingSource;
  sourceUrl?: string;
  pursueFile?: string;
  image?: string;
  imageLicense?: string;
  foiaUrl?: string;
  academicUrl?: string;
  aaroMention?: string;
};

export type SourceMeta = {
  id: SightingSource;
  label: string;
  color: string;
};

export const SOURCES: SourceMeta[] = [
  { id: 'wikipedia', label: 'Wikipedia / historical', color: '#7dd3fc' },
  { id: 'pursue-2026', label: 'Pentagon PURSUE 2026', color: '#fb923c' },
  { id: 'nuforc-aggregate', label: 'NUFORC (aggregate)', color: '#a78bfa' },
];
