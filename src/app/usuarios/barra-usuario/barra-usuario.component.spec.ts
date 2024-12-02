import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BarraUsuarioComponent } from './barra-usuario.component';

describe('BarraUsuarioComponent', () => {
  let component: BarraUsuarioComponent;
  let fixture: ComponentFixture<BarraUsuarioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BarraUsuarioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BarraUsuarioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
