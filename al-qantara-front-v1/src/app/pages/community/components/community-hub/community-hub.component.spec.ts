import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityHubComponent } from './community-hub.component';

describe('CommunityHubComponent', () => {
  let component: CommunityHubComponent;
  let fixture: ComponentFixture<CommunityHubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunityHubComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommunityHubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
