import { Injectable, EventEmitter } from '@angular/core';
import { LancamentoService } from './lancamentos/lancamento.service';
import { BehaviorSubject, tap } from 'rxjs';
import { Lancamento } from '../models/Lancamento';
import moment from 'moment';
moment.locale('pt-br');


@Injectable({
  providedIn: 'root'
})
export class ComunicationService {

  private date$ = new BehaviorSubject<any>({});
  selectedDate$ = this.date$.asObservable();

  private despesasBus$ = new BehaviorSubject<Lancamento[]>([]);
  despesasList$ = this.despesasBus$.asObservable();

  private receitasBus$ = new BehaviorSubject<Lancamento[]>([]);
  receitasList$ = this.receitasBus$.asObservable();
  

  constructor(
    private lancamentoService: LancamentoService,
  ) { }



  setDate(date: any){
    this.date$.next(date);
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

    this.lancamentoService.getLancamentos()

    console.timeEnd('getLancamentos');
  }
}
