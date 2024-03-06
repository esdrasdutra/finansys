import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, shareReplay, tap } from 'rxjs';
import { RequestService } from '../request/request.service';
import { ListLancamentoResponse } from '../response/ListLancamentoResponse';
import { Lancamento } from 'src/app/models/Lancamento';
import { AddLancamentoResponse } from '../response/AddLancamentoResponse';
import { RemoveLancamentoResponse } from '../response/RemoveLancamentoResponse';
import { ComunicationService } from '../comunication.service';

@Injectable({
  providedIn: 'root'
})
export class LancamentoService {
  readonly lancamentoUrl = 'api/v1/lancamentos';
  
  private lancamento$ = new BehaviorSubject<any>({});
  selectedLancamento$ = this.lancamento$.asObservable();
  
  constructor(
    private requestService: RequestService,
  ) { }

  setLancamento(lancamento: any) {
    this.lancamento$.next(lancamento);
  }

  getLancamentos(): Observable<ListLancamentoResponse>{
    const url = `http://localhost:8001/${this.lancamentoUrl}/all`;
    
    let lancamentos$ = this.lancamentosCacheService.getValue();

    if(!lancamentos$){
      lancamentos$ = this.requestService.get<ListLancamentoResponse>(url)
      .pipe(
        // tap(console.log),
        map((response: any) => response.data),
        shareReplay(1)
      );
    }

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