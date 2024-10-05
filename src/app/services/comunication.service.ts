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

  private lancamentosBus$ = new BehaviorSubject<any>([]);
  lancamentosList$ = this.lancamentosBus$.asObservable();

  private despesasBus$ = new BehaviorSubject<Lancamento[]>([]);
  despesasList$ = this.despesasBus$.asObservable();

  private receitasBus$ = new BehaviorSubject<Lancamento[]>([]);
  receitasList$ = this.receitasBus$.asObservable();

  private areaMappingBus$ = new BehaviorSubject<Lancamento[]>([]);
  areaMapping$ = this.areaMappingBus$.asObservable();
  
  constructor() { }

  setDate(date: any){
    this.date$.next(date);
  }

  setDespesas(lancamentos: Lancamento[], component: string) {
    console.log(`SETTING DESPESAS FROM ${component}`);
    this.despesasBus$.next(lancamentos)
  }

  setLancamentos(lancamentos: any, component: string) {
    console.log(`SETTING LANCAMENTOS FROM ${component}`);
    this.lancamentosBus$.next(lancamentos)
  }

  setReceitas(lancamentos: Lancamento[], component: string) {
    console.log(`SETTING RECEITAS FROM ${component}`);
    this.receitasBus$.next(lancamentos);
  }

  setAreaMapping(data: any) {
    this.areaMappingBus$.next(data);
  }
}