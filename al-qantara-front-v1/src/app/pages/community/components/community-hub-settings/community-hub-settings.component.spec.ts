import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunityHubSettingsComponent } from './community-hub-settings.component';

describe('CommunityHubSettingsComponent', () => {
  let component: CommunityHubSettingsComponent;
  let fixture: ComponentFixture<CommunityHubSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunityHubSettingsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CommunityHubSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
