import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss'
})
export class ProfilePageComponent implements OnInit {
  user: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<any>('http://localhost:3000/user/profile', { withCredentials: true })
      .subscribe({
        next: (res) => {
          this.user = res.user;
        },
        error: (err) => {
          this.user = null;
        }
      });
  }
}
