import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class JoinModalService {
  private joinModalSubject = new Subject<string | null>();
  joinModal$ = this.joinModalSubject.asObservable();

  openJoinModal(communityId: string | null = null) {
    this.joinModalSubject.next(communityId);
  }
}
