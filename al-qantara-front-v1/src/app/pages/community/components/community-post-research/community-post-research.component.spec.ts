import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityPostResearchComponent } from './community-post-research.component';

describe('CommunityPostResearchComponent', () => {
  let component: CommunityPostResearchComponent;
  let fixture: ComponentFixture<CommunityPostResearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunityPostResearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommunityPostResearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
