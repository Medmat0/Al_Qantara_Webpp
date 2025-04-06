import { Component } from '@angular/core';
import {RequestFormComponent} from '../request-form/request-form.component';

@Component({
  selector: 'app-contacts',
  imports: [RequestFormComponent],
  templateUrl: './contacts.component.html',
  standalone: true,
  styleUrl: './contacts.component.scss'
})
export class ContactsComponent {

}
