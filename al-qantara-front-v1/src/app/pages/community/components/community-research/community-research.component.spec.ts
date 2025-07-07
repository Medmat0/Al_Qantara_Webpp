import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityResearchComponent } from './community-research.component';

describe('CommunityResearchComponent', () => {
  let component: CommunityResearchComponent;
  let fixture: ComponentFixture<CommunityResearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunityResearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommunityResearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
