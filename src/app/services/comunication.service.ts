import { Injectable, EventEmitter } from '@angular/core';
import { LancamentoService } from './lancamentos/lancamento.service';
import { BehaviorSubject } from 'rxjs';

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

  fetchData() {
    this.lancamentoService.getLancamentos().subscribe({
      next: (lancamentos) => {
        let totalDespesas = 0;
        let totalReceitas = 0;
        lancamentos.data.forEach((lanc: any) => {
          if( lanc.tipo_lanc === "DESPESA") {
            totalDespesas += parseFloat(lanc.valor);

          } else if (lanc.tipo_lanc === "RECEITA") {
            totalReceitas += parseFloat(lanc.valor);
          }
        });
         
        this.setDespesas(totalDespesas);
        this.setReceitas(totalReceitas);

        this.setLancamentoList(lancamentos.data);
      },
    });
  }
}
