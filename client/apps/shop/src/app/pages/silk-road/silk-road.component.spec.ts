import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SilkRoadComponent} from './silk-road.component';

describe('SilkRoadComponent', () => {
  let component: SilkRoadComponent;
  let fixture: ComponentFixture<SilkRoadComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SilkRoadComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SilkRoadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
