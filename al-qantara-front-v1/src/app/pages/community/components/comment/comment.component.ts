import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  imports: [CommonModule, FormsModule],
  standalone: true,
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent {
  @Input() comment: any;
  @Input() replyFormVisible!: { [key: number]: boolean };
  @Input() replyContent!: { [key: number]: string };
  @Input() toggleReplyForm!: (id: number) => void;
  @Input() addReply!: (id: number) => void;
  @Input() likeDislikeComment!: (comment: any) => void;
  @Input() deleteComment!: (comment: any) => void;
  @Input() isModerator: boolean = false;
  @Input() userId: number | null = null;

}


