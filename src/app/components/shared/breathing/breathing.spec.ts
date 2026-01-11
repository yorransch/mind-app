import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Breathing } from './breathing';

describe('Breathing', () => {
  let component: Breathing;
  let fixture: ComponentFixture<Breathing>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Breathing]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Breathing);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
