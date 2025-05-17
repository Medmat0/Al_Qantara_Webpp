import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventDescriptionComponent } from './event-description.component';

describe('EventDescriptionComponent', () => {
  let component: EventDescriptionComponent;
  let fixture: ComponentFixture<EventDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventDescriptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
