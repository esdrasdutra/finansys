import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LancamentoAddComponent } from './lancamento-add.component';

describe('LancamentoAddComponent', () => {
  let component: LancamentoAddComponent;
  let fixture: ComponentFixture<LancamentoAddComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LancamentoAddComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LancamentoAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
