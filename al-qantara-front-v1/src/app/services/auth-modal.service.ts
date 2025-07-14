import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthModalService {
  private showModalSubject = new BehaviorSubject<boolean>(false);
  public showModal$ = this.showModalSubject.asObservable();

  showAuthModal() {
    this.showModalSubject.next(true);
  }

  hideAuthModal() {
    this.showModalSubject.next(false);
  }
}
