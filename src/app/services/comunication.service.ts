import { Injectable, EventEmitter } from '@angular/core';
import { LancamentoService } from './lancamentos/lancamento.service';
import { BehaviorSubject } from 'rxjs';
import { Lancamento } from '../models/Lancamento';

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

  private totalDespesas$ = new BehaviorSubject<any>(Number);
  despesas$ = this.totalDespesas$.asObservable();

  private totalReceitas$ = new BehaviorSubject<any>(Number);
  receitas$ = this.totalReceitas$.asObservable();
  

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

  setDespesas(lancamentos: any) {
    this.totalDespesas$.next(lancamentos);
  }

  setReceitas(lancamentos: any) {
    this.totalReceitas$.next(lancamentos);
  }

  fetchData(component: string): void {
    console.log(component)
    console.time('getLancamentos');

    this.lancamentoService.getLancamentos().subscribe({
      next: (lancamentos) => {
        let totalDespesas: Lancamento[] = [];
        let totalReceitas: Lancamento[] = [];
        lancamentos.data.forEach((lanc: any) => {
          if( lanc.tipo_lanc === "DESPESA") {
            totalDespesas.push(lanc);

          } else if (lanc.tipo_lanc === "RECEITA") {
            totalReceitas.push(lanc);
          }
        });
         
        this.setDespesas(totalDespesas);
        this.setReceitas(totalReceitas);
        this.setLancamentoList(lancamentos.data);
      },
    });

    console.timeEnd('getLancamentos');
  }
}
