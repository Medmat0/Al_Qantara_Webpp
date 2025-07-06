import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MessagingHomeComponent } from './messaging-home.component';

describe('MessagingHomeComponent', () => {
  let component: MessagingHomeComponent;
  let fixture: ComponentFixture<MessagingHomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MessagingHomeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MessagingHomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
