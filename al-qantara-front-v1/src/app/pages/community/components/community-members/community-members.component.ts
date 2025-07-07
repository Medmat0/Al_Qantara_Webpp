import { Component, OnInit, Input } from '@angular/core';
import { CommunityService } from '../../../../member/services/community.service';
import { NgClass, NgForOf, NgIf } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-community-members',
  templateUrl: './community-members.component.html',
  styleUrl: './community-members.component.scss',
  imports: [NgForOf, NgClass, NgIf],
  standalone: true

})
export class CommunityMembersComponent implements OnInit {
  @Input() communityId!: number;
  membres: any[] = [];
  moderateurs: any[] = [];
  membresbannis: any[] = [];
  loading = true;
  actionError: string | null = null;

  // Pagination
  membresPage = 1;
  membresPageSize = 5;
  membresBannisPage = 1;
  membresBannisPageSize = 5;

  constructor(private communityService: CommunityService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Si communityId est fourni en input, on l'utilise, sinon on tente de le récupérer depuis la route (fallback)
    if (!this.communityId && this.route.snapshot.paramMap.get('communityId')) {
      this.communityId = Number(this.route.snapshot.paramMap.get('communityId'));
    }
    this.loadMembers();
  }

  loadMembers() {
    this.loading = true;
    this.communityService.getCommunityMembers(this.communityId).subscribe({
      next: (res) => {
        this.membres = res.membres ?? [];
        this.moderateurs = res.moderateurs ?? [];
        this.membresbannis = res.membresbannis ?? [];
        this.loading = false;
      },
      error: () => {
        this.membres = [];
        this.moderateurs = [];
        this.membresbannis = [];
        this.loading = false;
      }
    });
  }

  get pagedMembres() {
    const start = (this.membresPage - 1) * this.membresPageSize;
    return this.membres.slice(start, start + this.membresPageSize);
  }

  get membresTotalPages(): number {
    return Math.max(1, Math.ceil(this.membres.length / this.membresPageSize));
  }
  get membresBannisTotalPages(): number {
    return Math.max(1, Math.ceil(this.membresbannis.length / this.membresBannisPageSize));
  }

  get pagedMembresBannis() {
    const start = (this.membresBannisPage - 1) * this.membresBannisPageSize;
    return this.membresbannis.slice(start, start + this.membresBannisPageSize);
  }

  changeMembresPage(delta: number) {
    const maxPage = Math.ceil(this.membres.length / this.membresPageSize);
    this.membresPage = Math.min(Math.max(1, this.membresPage + delta), maxPage);
  }
  changeMembresBannisPage(delta: number) {
    const maxPage = Math.ceil(this.membresbannis.length / this.membresBannisPageSize);
    this.membresBannisPage = Math.min(Math.max(1, this.membresBannisPage + delta), maxPage);
  }

  banMember(member: any) {
    if (!confirm('Bannir ' + member.prenom + ' ' + member.nom + ' ?')) return;
    this.communityService.banMember(this.communityId, member.id).subscribe({
      next: () => {
        this.membres = this.membres.filter(m => m.id !== member.id);
        this.moderateurs = this.moderateurs.filter(m => m.id !== member.id);
        if (!this.membresbannis.some(m => m.id === member.id)) {
          this.membresbannis = [...this.membresbannis, { ...member }];
        }
        this.actionError = null;
      },
      error: (err) => {
        this.actionError = "Erreur lors du bannissement : " + (err?.error?.message || "Veuillez réessayer.");
      }
    });
  }

  unbanMember(member: any) {
    if (!confirm('Débannir ' + member.prenom + ' ' + member.nom + ' ?')) return;
    this.communityService.unbanMember(this.communityId, member.id).subscribe({
      next: () => {
        this.membresbannis = this.membresbannis.filter(m => m.id !== member.id);
        if (!this.membres.some(m => m.id === member.id)) {
          this.membres = [...this.membres, { ...member }];
        }
        this.actionError = null;
      },
      error: (err) => {
        this.actionError = "Erreur lors du débannissement : " + (err?.error?.message || "Veuillez réessayer.");

      }
    });
  }

  promoteMember(member: any) {
    if (!confirm('Promouvoir ' + member.prenom + ' ' + member.nom + ' en modérateur ?')) return;
    this.communityService.promoteMember(this.communityId, member.id).subscribe({
      next: () => {
        if (!this.moderateurs.some(m => m.id === member.id)) {
          this.moderateurs = [...this.moderateurs, { ...member }];
        }
        this.actionError = null;
      },
      error: (err) => {
        this.actionError = "Erreur lors de la promotion : " + (err?.error?.message || "Veuillez réessayer.");
      }
    });
  }

  isNotModerator(member: any): boolean {
    return !this.moderateurs.some(mod => mod.id === member.id);
  }

  demoteMember(moderator: any) {
    if (!confirm('Rétrograder ' + moderator.prenom + ' ' + moderator.nom + ' ?')) return;
    this.communityService.demoteMember(this.communityId, moderator.id).subscribe({
      next: () => {
        this.moderateurs = this.moderateurs.filter(m => m.id !== moderator.id);
        if (!this.membres.some(m => m.id === moderator.id)) {
          this.membres = [...this.membres, { ...moderator }];
        }
        this.actionError = null;
      },
      error: (err) => {
        this.actionError = "Erreur lors de la rétrogradation : " + (err?.error?.message || "Veuillez réessayer.");
      }
    });
  }

}
