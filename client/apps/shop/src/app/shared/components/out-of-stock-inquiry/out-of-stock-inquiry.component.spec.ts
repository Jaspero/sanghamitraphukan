import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {OutOfStockInquiryComponent} from './out-of-stock-inquiry.component';

describe('OutOfStockInquiryComponent', () => {
  let component: OutOfStockInquiryComponent;
  let fixture: ComponentFixture<OutOfStockInquiryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OutOfStockInquiryComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OutOfStockInquiryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
