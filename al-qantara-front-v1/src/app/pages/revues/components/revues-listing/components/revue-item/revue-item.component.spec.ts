import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevueItemComponent } from './revue-item.component';

describe('RevueItemComponent', () => {
  let component: RevueItemComponent;
  let fixture: ComponentFixture<RevueItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevueItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevueItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
