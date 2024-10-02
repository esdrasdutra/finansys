import { Component, Output } from '@angular/core';
import { LancamentoService } from '../..//services/lancamentos/lancamento.service';
import { FILTROS, MESES } from 'src/app/entities/relatorios/relatorios';
import { Lancamento } from 'src/app/models/Lancamento';
import { ComunicationService } from 'src/app/services/comunication.service';
import moment from 'moment';

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

  constructor(
  ) { }

  ngOnInit(): void {
  }

  onKey(event: any) {
    this.inputValue = event.target.value;
    console.log(this.inputValue);
  }
}
