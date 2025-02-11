import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarraSistemaComponent } from './barra-sistema.component';

describe('BarraSistemaComponent', () => {
  let component: BarraSistemaComponent;
  let fixture: ComponentFixture<BarraSistemaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarraSistemaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarraSistemaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
