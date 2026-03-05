import { Injectable, EventEmitter } from '@angular/core';
import { LancamentoService } from './lancamentos/lancamento.service'; // Import LancamentoService
import { BehaviorSubject, Observable, tap } from 'rxjs'; // Import Observable
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

  private areaMappingBus$ = new BehaviorSubject<Lancamento[]>([]);
  areaMapping$ = this.areaMappingBus$.asObservable();
  
  constructor(private lancamentoService: LancamentoService) { } // Inject LancamentoService

  setDate(date: any){
    this.date$.next(date);
  }

  setDespesas(lancamentos: Lancamento[], component: string) {
    console.log(`SETTING DESPESAS FROM ${component}`);
    this.despesasBus$.next(lancamentos)
  }

  setReceitas(lancamentos: Lancamento[], component: string) {
    console.log(`SETTING RECEITAS FROM ${component}`);
    this.receitasBus$.next(lancamentos);
  }

  setAreaMapping(data: any) {
    this.areaMappingBus$.next(data);
  }

  // New methods to get all receipts and expenses
  getAllReceitas(): Observable<Lancamento[]> {
    return this.lancamentoService.listReceitas().pipe(
      tap(receitas => this.setReceitas(receitas, 'ComunicationService.getAllReceitas'))
    );
  }

  getAllDespesas(): Observable<Lancamento[]> {
    return this.lancamentoService.listDespesas().pipe(
      tap(despesas => this.setDespesas(despesas, 'ComunicationService.getAllDespesas'))
    );
  }
}