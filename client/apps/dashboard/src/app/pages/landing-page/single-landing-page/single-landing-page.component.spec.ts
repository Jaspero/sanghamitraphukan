import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SingleLandingPageComponent} from './single-landing-page.component';

describe('SingleLandingPageComponent', () => {
  let component: SingleLandingPageComponent;
  let fixture: ComponentFixture<SingleLandingPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SingleLandingPageComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SingleLandingPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
