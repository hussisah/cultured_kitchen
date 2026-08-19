import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {

  message = signal('');
  visible = signal(false);

  private timeoutId: any;

  show(message: string): void {

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.message.set(message);
    this.visible.set(true);

    this.timeoutId = setTimeout(() => {
      this.hide();
    }, 2500);
  }

  hide(): void {
    this.visible.set(false);
    this.message.set('');
  }

}