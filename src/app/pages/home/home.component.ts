import { Component } from '@angular/core';
import { LancamentoService } from '../..//services/lancamentos/lancamento.service';

@Component({
  selector: 'app-Home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass'],
  providers: [LancamentoService]
})
export class HomeComponent {
  inputValue: string = '';
  filtros: string[] = ['Dt. Lançamento', 'Recibo','Valor', 'Tipo Documento', 'Nº Documento'];
  meses = [
    'JANEIRO', 'FEVEREIRO', 'MARÇO', 'ABRIL', 'MAIO', 'JUNHO',
    'JULHO', 'AGOSTO', 'SETEMBRO', 'OUTUBRO', 'NOVEMBRO', 'DEZEMBRO'
  ];

  constructor() { }

  ngOnInit(): void {
  }

  onKey(event: any) {
    this.inputValue = event.target.value;
    console.log(this.inputValue);
  }
}
