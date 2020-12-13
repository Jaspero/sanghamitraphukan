import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {OneHornComponent} from './one-horn.component';

describe('OneHornComponent', () => {
  let component: OneHornComponent;
  let fixture: ComponentFixture<OneHornComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [OneHornComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OneHornComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
