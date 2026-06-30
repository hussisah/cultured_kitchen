import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderConfirm } from './order-confirm';

describe('OrderConfirm', () => {
  let component: OrderConfirm;
  let fixture: ComponentFixture<OrderConfirm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderConfirm],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderConfirm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
