export interface PointInteret {
  nom: string;
  lat: number;
  lng: number;
}

export interface GuideVille {
  id: string;
  nom: string;
  region: string;
  description: string;
  pointsInteret: PointInteret[];
  image: string;
  images?: string[]; // Photos supplémentaires
  lat: number;
  lng: number;
}
/*
export const GUIDES_MAROC: GuideVille[] = [
  {
    id: 'marrakech',
    nom: 'Marrakech',
    region: 'Marrakech-Safi',
    description: `Marrakech, la ville ocre, est célèbre pour sa médina animée, ses souks colorés, la place Jemaa el-Fna et ses jardins majestueux. C'est un point de départ idéal pour explorer le Haut Atlas.`,
    pointsInteret: [
      {
        nom: 'Place Jemaa el-Fna',
        lat: 31.6260,
        lng: -7.9890
      },
      {
        nom: 'Jardin Majorelle',
        lat: 31.6417,
        lng: -8.0033
      },
      {
        nom: 'Palais de la Bahia',
        lat: 31.6213,
        lng: -7.9844
      },
      {
        nom: 'Souks de la médina',
        lat: 31.6295,
        lng: -7.9811
      },
      {
        nom: 'Koutoubia',
        lat: 31.6236,
        lng: -7.9926
      }
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
      {
        nom: 'Médina de Fès el-Bali',
        lat: 34.0631,
        lng: -4.9719
      },
      {
        nom: 'Tanneries Chouara',
        lat: 34.0667,
        lng: -4.9707
      },
      {
        nom: 'Médersa Bou Inania',
        lat: 34.0636,
        lng: -4.9747
      },
      {
        nom: 'Bab Boujloud',
        lat: 34.0639,
        lng: -4.9755
      }
    ],
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1519749047139-7d6199f51b70?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1577645816273-b6b6c892c89e?auto=format&fit=crop&w=600&q=80'
    ],
    lat: 34.0181,
    lng: -5.0078
  },
  {
    id: 'agadir',
    nom: 'Agadir',
    region: 'Souss-Massa',
    description: `Agadir est une station balnéaire moderne, appréciée pour ses plages, sa corniche animée et son climat doux toute l’année. Point de départ pour explorer le sud marocain.`,
    pointsInteret: [
      {
        nom: 'Plage d’Agadir',
        lat: 30.4202,
        lng: -9.5982
      },
      {
        nom: 'La Kasbah',
        lat: 30.4297,
        lng: -9.6017
      },
      {
        nom: 'Souk El Had',
        lat: 30.4267,
        lng: -9.5849
      },
      {
        nom: 'Marina d\'Agadir',
        lat: 30.4186,
        lng: -9.6098
      }
    ],
    image: 'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1570939274717-7eda259b50ed?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=600&q=80'
    ],
    lat: 30.4278,
    lng: -9.5981
  }
];

 */
