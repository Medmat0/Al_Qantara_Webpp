import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ModalService {
  private banishedModalSubject = new Subject<void>();
  banishedModal$ = this.banishedModalSubject.asObservable();

  openBanishedModal() {
    this.banishedModalSubject.next();
  }
}
