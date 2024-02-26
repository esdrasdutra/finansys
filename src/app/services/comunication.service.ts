import { Injectable, EventEmitter } from '@angular/core';
import { LancamentoService } from './lancamentos/lancamento.service';
import { BehaviorSubject } from 'rxjs';
import { Lancamento } from '../models/Lancamento';
import moment from 'moment';
moment.locale('pt-br');


@Injectable({
  providedIn: 'root'
})
export class ComunicationService {
  private lancamento$ = new BehaviorSubject<any>({});
  selectedLancamento$ = this.lancamento$.asObservable();

  private date$ = new BehaviorSubject<any>({});
  selectedDate$ = this.date$.asObservable();

  private lancamentoBus$ = new BehaviorSubject<any>([]);
  lancamentoList$ = this.lancamentoBus$.asObservable();

  private despesasBus$ = new BehaviorSubject<Lancamento[]>([]);
  despesasList$ = this.despesasBus$.asObservable();

  private receitasBus$ = new BehaviorSubject<Lancamento[]>([]);
  receitasList$ = this.receitasBus$.asObservable();
  

  constructor(
    private lancamentoService: LancamentoService,
  ) { }

  setLancamento(lancamento: any) {
    this.lancamento$.next(lancamento);
  }

  setDate(date: any){
    this.date$.next(date);
  }

  setLancamentoList(lancamentos: any) {
    this.lancamentoBus$.next(lancamentos);
  }

  setDespesas(lancamentos: Lancamento[]) {
    this.despesasBus$.next(lancamentos)
  }

  setReceitas(lancamentos: any) {
    this.receitasBus$.next(lancamentos);
  }

  fetchData(component: string): void {
    console.log(component);
    console.time('getLancamentos');

    this.lancamentoService.getLancamentos().subscribe({
      next: (lancamentos) => {
      },
    });

    console.timeEnd('getLancamentos');
  }
}
