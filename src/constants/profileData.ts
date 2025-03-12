export const MUSIC_GENRES = [
  'Hip Hop', 'Trap', 'Pop', 'R&B', 'Rock',
  'Drill', 'Electronic', 'Afrobeat', 'Latin', 'Funk',
  'Cinematic', 'Lofi', 'Country', 'World', 'Indie',
  'Folk', 'Reggae', 'House', 'Synthwave', 'Amapiano'
];

// Suppression de EXPERIENCE_LEVELS, car on ne souhaite plus l'afficher

// Mise à jour des USER_ROLES selon le cahier des charges
export const USER_ROLES = [
  { value: 'rappeur', label: 'Rappeur' },
  { value: 'beatmaker', label: 'Beatmaker' },
  { value: 'loopmaker', label: 'Loopmaker' }
];

export const MUSIC_MOODS = [
  'Mélancolique', 'Énergique', 'Festif', 'Agressif', 
  'Chill', 'Sombre', 'Inspirant', 'Romantique'
];

export const SOFTWARE_OPTIONS = [
  'FL Studio', 'Ableton Live', 'Logic Pro', 'Pro Tools',
  'Studio One', 'Cubase', 'Reason', 'Maschine',
  'GarageBand', 'Reaper', 'Autre'
];

export const EQUIPMENT_OPTIONS = [
  'Microphone', 'Audio Interface', 'MIDI Keyboard', 'Headphones',
  'Monitors', 'Hardware Synth', 'Drum Machine', 'Drum Pad',
  'Guitar', 'Bass', 'Turntable', 'Sampler'
];

export const POPULAR_ARTISTS = [
  'Travis Scott', 'Drake', 'Kendrick Lamar', 'Rihanna',
  'The Weeknd', 'Beyoncé', 'Doja Cat', 'Tyler, The Creator',
  'J. Cole', 'Megan Thee Stallion', 'Post Malone', 'Cardi B',
  'Billie Eilish', 'Ariana Grande', 'Metro Boomin', 'Booba',
  'Ninho', 'Damso', 'PNL', 'SCH', 'Jul', 'Nekfeu', 'Niska'
];

// Constantes pour les indicateurs de disponibilité
export const AVAILABILITY_STATUS = {
  rappeur: [
    { value: 'in_session', label: 'En session', color: 'red' },
    { value: 'available', label: 'Disponible pour une collab', color: 'green' },
    { value: 'looking', label: 'Recherche une instrumentale', color: 'yellow' }
  ],
  beatmaker: [
    { value: 'in_studio', label: 'En studio', color: 'red' },
    { value: 'available', label: 'Disponible pour une collab', color: 'green' },
    { value: 'looking', label: 'Recherche un projet', color: 'yellow' }
  ],
  loopmaker: [
    { value: 'in_studio', label: 'En studio', color: 'red' },
    { value: 'available', label: 'Disponible pour une collab', color: 'green' },
    { value: 'looking', label: 'Recherche un projet', color: 'yellow' }
  ]
};