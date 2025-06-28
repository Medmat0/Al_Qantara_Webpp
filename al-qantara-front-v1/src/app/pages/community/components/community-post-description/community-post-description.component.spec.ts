import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityPostDescriptionComponent } from './community-post-description.component';

describe('CommunityPostDescriptionComponent', () => {
  let component: CommunityPostDescriptionComponent;
  let fixture: ComponentFixture<CommunityPostDescriptionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunityPostDescriptionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommunityPostDescriptionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
