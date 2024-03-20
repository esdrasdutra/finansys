import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, shareReplay, tap } from 'rxjs';
import { RequestService } from '../request/request.service';
import { ListLancamentoResponse } from '../response/ListLancamentoResponse';
import { Lancamento } from '../..//models/Lancamento';
import { AddLancamentoResponse } from '../response/AddLancamentoResponse';
import { RemoveLancamentoResponse } from '../response/RemoveLancamentoResponse';
import { LancamentosCacheService } from '../lancamentos-cache.service';

@Injectable({
  providedIn: 'root'
})
export class LancamentoService {
  readonly lancamentoUrl = 'api/v1/lancamentos';
  
  private lancamento$ = new BehaviorSubject<any>({});
  selectedLancamento$ = this.lancamento$.asObservable();

  private lancamentosBs$ = new BehaviorSubject<Lancamento[]>([]);
  lancamentosList$ = this.lancamentosBs$.asObservable();

  constructor(
    private requestService: RequestService,
    private lancamentosCacheService: LancamentosCacheService,
  ) { }

  setLancamento(lancamento: any) {
    this.lancamento$.next(lancamento);
  }

  getLancamentos(): Observable<ListLancamentoResponse>{

    const url = `http://localhost:8001/${this.lancamentoUrl}/all`;
    let lancamentos$ = new Observable<ListLancamentoResponse>();
    // let lancamentosCached = localStorage.getItem('LancamentoService');

    // if(!lancamentosCached){
      lancamentos$ = this.requestService.get<ListLancamentoResponse>(url)
      .pipe(
        map((response: any) => response.data),
        // tap( data =>  this.lancamentosCacheService.setValue(data, 'LancamentoService')), // Cache the fetched data
        shareReplay(1)
      );
    //}

    return lancamentos$;
  }

  getLancamentoById(lancamento: any): Observable<RemoveLancamentoResponse>{
    const url = `http://localhost:8001/${this.lancamentoUrl}/${lancamento.id}`;
    return this.requestService.get(url);
  }

  addLancamento(lancamento: Lancamento): Observable<AddLancamentoResponse>{
    const url = `http://localhost:8001/${this.lancamentoUrl}/`
    return this.requestService.post<Lancamento, AddLancamentoResponse>(url,lancamento)
  }

  updateLancamento(lancamento: any): Observable<RemoveLancamentoResponse>{
    const url = `http://localhost:8001/${this.lancamentoUrl}/`
    return this.requestService.put(url, lancamento);
  }

  deleteLancamento(lancamento: any): Observable<RemoveLancamentoResponse>{
    const url = `http://localhost:8001/${this.lancamentoUrl}/${lancamento.id}`
    return this.requestService.delete(url);
  }
}