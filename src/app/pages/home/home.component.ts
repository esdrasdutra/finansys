import { Component } from '@angular/core';
import { LancamentoService } from '../..//services/lancamentos/lancamento.service';
import { FILTROS, MESES } from 'src/app/entities/relatorios/relatorios';
import { Inflows } from '../../enums/inflows.enum';
import { Outflows } from '../../enums/outflows.enum';
import { Account } from '../../enums/account.enum';

@Component({
  selector: 'app-Home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.sass'],
  providers: [LancamentoService]
})
export class HomeComponent {
  inputValue: string = '';
  filtros = FILTROS;
  meses = MESES;

  // Filtros para lancamento-list
  selectedFiltro: string = '';
  selectedMes: string = '';
  filterEntrada: string = '';
  filterSaida: string = '';
  filterConta: string = '';

  inflowsOptions = Object.values(Inflows);
  outflowsOptions = Object.values(Outflows);
  accountOptions = Object.values(Account);

  constructor() { }

  ngOnInit(): void {
  }

  onKey(event: any) {
    this.inputValue = event.target.value;
    console.log(this.inputValue);
  }

  onFiltroChange(event: any) {
    this.selectedFiltro = event.target.value;
    // Lógica para aplicar filtro baseado no selectedFiltro
  }

  onMesChange(event: any) {
    this.selectedMes = event.target.value;
    // Lógica para aplicar filtro de mês
  }
}
