import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[preventContextMenu]',
  standalone: true
})
export class PreventContextMenuDirective {
  @HostListener('contextmenu', ['$event'])
  onRightClick(event: Event) {
    event.preventDefault();
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    // Empêcher Ctrl+S, Ctrl+P, Ctrl+Shift+I
    if ((event.ctrlKey && event.key === 's') || 
        (event.ctrlKey && event.key === 'p') ||
        (event.ctrlKey && event.shiftKey && event.key === 'i')) {
      event.preventDefault();
    }
  }
}
