import { Component, OnInit } from '@angular/core';
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
  membres: any[] = [];
  moderateurs: any[] = [];
  membresbannis: any[] = [];
  loading = true;
  communityId!: number;

  // Pagination
  membresPage = 1;
  membresPageSize = 5;
  membresBannisPage = 1;
  membresBannisPageSize = 5;

  constructor(private communityService: CommunityService, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.communityId = Number(this.route.snapshot.paramMap.get('communityId')!);
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
    if (!confirm(`Bannir ${member.prenom} ${member.nom} ?`)) return;
    this.communityService.banMember(this.communityId, member.id).subscribe({
      next: () => this.loadMembers()
    });
  }

  unbanMember(member: any) {
    if (!confirm(`Débannir ${member.prenom} ${member.nom} ?`)) return;
    this.communityService.unbanMember(this.communityId, member.id).subscribe({
      next: () => this.loadMembers()
    });
  }

}
