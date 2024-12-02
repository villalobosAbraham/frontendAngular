import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltroGeneroComponent } from './filtro-genero.component';

describe('FiltroGeneroComponent', () => {
  let component: FiltroGeneroComponent;
  let fixture: ComponentFixture<FiltroGeneroComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiltroGeneroComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiltroGeneroComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
