import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';

export interface AddressSuggestion {
  display_name: string;
  address: {
    house_number?: string;
    road?: string;
    street?: string;
    postcode?: string;
    city?: string;
    town?: string;
    village?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  constructor(private http: HttpClient) {}

  private normalizeQuery(query: string): string {
    return query
      .replace(/[']/g, '')
      .replace(/[ÿ]/g, 'y')
      .replace(/[éèêë]/g, 'e')
      .replace(/[àâä]/g, 'a')
      .replace(/[îï]/g, 'i')
      .replace(/[ôö]/g, 'o')
      .replace(/[ùûü]/g, 'u')
      .replace(/[ç]/g, 'c');
  }

  searchAddress(query: string): Observable<AddressSuggestion[]> {
    if (query.length < 3) {
      return of([]);
    }

    const normalizedQuery = this.normalizeQuery(query);    return this.http.get<AddressSuggestion[]>(
      'https://nominatim.openstreetmap.org/search',
      {
        params: {
          q: normalizedQuery,
          format: 'json',
          limit: '10',
          countrycodes: 'fr',
          addressdetails: '1',
          'accept-language': 'fr',
          featuretype: 'address',
          'email': 'contact@alqantara.fr', 
          dedupe: '1', 
          'bounded': '1' 
        }
      }
    ).pipe(
      map(suggestions => suggestions.filter(suggestion => {
        const address = suggestion.address;
        return address && (
          (address.road || address.street) &&
          (address.postcode || address.city || address.town || address.village)
        );
      })),
      catchError(error => {
        console.error('Erreur lors de la recherche d\'adresse:', error);
        return of([]);
      })
    );
  }
  formatSuggestion(suggestion: AddressSuggestion): string {
    const details = suggestion.address;
    const parts: string[] = [];

    if (details.house_number) {
      parts.push(details.house_number);
    }

    if (details.road || details.street) {
      const street = details.road || details.street || '';
      if (street) {
        parts.push(street);
      }
    }

    if (details.postcode || details.city || details.town || details.village) {
      const city = details.city || details.town || details.village || '';
      if (city) {
        if (details.postcode) {
          parts.push(`${details.postcode} ${city}`);
        } else {
          parts.push(city);
        }
      }
    }

    return parts.join(' ');
  }
}
