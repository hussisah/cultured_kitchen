import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryTab } from './inventory-tab';

describe('InventoryTab', () => {
  let component: InventoryTab;
  let fixture: ComponentFixture<InventoryTab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryTab],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryTab);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
