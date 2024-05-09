import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PorcentagemDirigentesComponent } from './porcentagem-dirigentes.component';

describe('PorcentagemDirigentesComponent', () => {
  let component: PorcentagemDirigentesComponent;
  let fixture: ComponentFixture<PorcentagemDirigentesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PorcentagemDirigentesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PorcentagemDirigentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
