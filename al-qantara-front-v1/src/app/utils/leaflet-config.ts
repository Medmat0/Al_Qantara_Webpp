// Configuration des icônes Leaflet pour la production
import L from 'leaflet';

// Fix pour les icônes Leaflet en production
export function configureLeafletIcons() {
  // Configuration des icônes par défaut
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: '/assets/images/marker-icon-2x.png',
    iconUrl: '/assets/images/marker-icon.png',
    shadowUrl: '/assets/images/marker-shadow.png',
  });
}

// Icône personnalisée pour les marqueurs
export const customIcon = L.icon({
  iconUrl: '/assets/images/marker-icon.png',
  iconRetinaUrl: '/assets/images/marker-icon-2x.png',
  shadowUrl: '/assets/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Configuration globale à appeler au démarrage de l'app
export function initializeLeaflet() {
  configureLeafletIcons();
}
