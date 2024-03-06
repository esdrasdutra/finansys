import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
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
  private lancamentoUrl = 'api/v1/lancamentos';

  constructor(
    private requestService: RequestService,
  ) { }

  getLancamentos(): Observable<ListLancamentoResponse>{
    const url = `http://localhost:8001/${this.lancamentoUrl}/all`;
    return this.requestService.get<ListLancamentoResponse>(url);
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