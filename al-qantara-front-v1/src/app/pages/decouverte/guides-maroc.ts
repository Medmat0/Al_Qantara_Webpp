export interface GuideVille {
  id: string;
  nom: string;
  region: string;
  description: string;
  pointsInteret: string[];
  image: string;
  images?: string[]; // Photos supplémentaires
  lat: number;
  lng: number;
}

export const GUIDES_MAROC: GuideVille[] = [
  {
    id: 'marrakech',
    nom: 'Marrakech',
    region: 'Marrakech-Safi',
    description: `Marrakech, la ville ocre, est célèbre pour sa médina animée, ses souks colorés, la place Jemaa el-Fna et ses jardins majestueux. C'est un point de départ idéal pour explorer le Haut Atlas.`,
    pointsInteret: [
      'Place Jemaa el-Fna',
      'Jardin Majorelle',
      'Palais de la Bahia',
      'Souks de la médina',
      'Koutoubia'
    ],
    image: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1548323027-9d5fe5e61e9e?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1491493896845-4b3a2a7e6c9a?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1551634247-5d71a9b2b1c8?auto=format&fit=crop&w=600&q=80'
    ],
    lat: 31.6295,
    lng: -7.9811
  },
  {
    id: 'fes',
    nom: 'Fès',
    region: 'Fès-Meknès',
    description: `Fès est la capitale spirituelle du Maroc, réputée pour sa médina classée à l’UNESCO, ses tanneries et ses médersas. Un véritable voyage dans le temps.`,
    pointsInteret: [
      'Médina de Fès el-Bali',
      'Tanneries Chouara',
      'Médersa Bou Inania',
      'Bab Boujloud'
    ],
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80',
    lat: 34.0181,
    lng: -5.0078
  },
  {
    id: 'agadir',
    nom: 'Agadir',
    region: 'Souss-Massa',
    description: `Agadir est une station balnéaire moderne, appréciée pour ses plages, sa corniche animée et son climat doux toute l’année. Point de départ pour explorer le sud marocain.`,
    pointsInteret: [
      'Plage d’Agadir',
      'La Kasbah',
      'Souk El Had',
      'Vallée du Paradis'
    ],
    image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=600&q=80',
    lat: 30.4278,
    lng: -9.5981
  }
];
