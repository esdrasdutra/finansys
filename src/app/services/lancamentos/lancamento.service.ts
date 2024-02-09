import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RequestService } from '../request/request.service';
import { ListLancamentoResponse } from '../response/ListLancamentoResponse';
import { Lancamento } from 'src/app/models/Lancamento';
import { AddLancamentoResponse } from '../response/AddLancamentoResponse';

@Injectable({
  providedIn: 'root'
})
export class LancamentoService {
  private lancamentoUrl = 'api/v1/lancamentos';

  constructor(
    private requestService: RequestService
  ) { }

  getLancamentos(): Observable<ListLancamentoResponse>{
    const url = `http://localhost:8001/${this.lancamentoUrl}/all`;
    return this.requestService.get<ListLancamentoResponse>(url);
  }

  addLancamento(lancamento: Lancamento): Observable<AddLancamentoResponse>{
    const url = `http://localhost:8001/${this.lancamentoUrl}/`
    return this.requestService.post<Lancamento, AddLancamentoResponse>(url,lancamento)
  }
}
