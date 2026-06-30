import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuditTab } from './audit-tab';

describe('AuditTab', () => {
  let component: AuditTab;
  let fixture: ComponentFixture<AuditTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuditTab],
    }).compileComponents();

    fixture = TestBed.createComponent(AuditTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
