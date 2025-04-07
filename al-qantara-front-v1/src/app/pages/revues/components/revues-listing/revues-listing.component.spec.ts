import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevuesListingComponent } from './revues-listing.component';

describe('RevuesListingComponent', () => {
  let component: RevuesListingComponent;
  let fixture: ComponentFixture<RevuesListingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevuesListingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RevuesListingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
