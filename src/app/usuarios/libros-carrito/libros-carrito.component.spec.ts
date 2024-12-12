import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LibrosCarritoComponent } from './libros-carrito.component';

describe('LibrosCarritoComponent', () => {
  let component: LibrosCarritoComponent;
  let fixture: ComponentFixture<LibrosCarritoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LibrosCarritoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LibrosCarritoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
