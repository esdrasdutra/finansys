import { Injectable, EventEmitter, Output } from '@angular/core';
import { LancamentoService } from './lancamentos/lancamento.service';
import { Lancamento } from '../models/Lancamento';

@Injectable({
  providedIn: 'root'
})
export class ComunicationService {
  dataChanged = new EventEmitter();

  constructor(
    private lancamentoService: LancamentoService,
  ) {}

  refreshData() {
    this.lancamentoService.getLancamentos().subscribe({
      next: (data) => {
        const lancamentos: Lancamento[] = data.data;
        this.dataChanged.emit(lancamentos)
      },
      error: (err) => {
        console.log(err)
      },
      complete: () => {
        console.log('COMPLETE!')
      }
    });
  }
}
