import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RequestService } from '../request/request.service';
import { ListObreirosResponse } from '../response/ListObreirosResponse';
import { Obreiros } from '../..//models/Obreiros';
import { AddObreiroResponse } from '../response/AddObreiroResponse';

@Injectable({
  providedIn: 'root'
})
export class ObreirosService {
  private ObreirosUrl = 'api/v1/obreiros';

  constructor(
    private requestService: RequestService
  ) { }

  getObreiro(): Observable<ListObreirosResponse>{
    const url = `http://localhost:8001/${this.ObreirosUrl}/all`;    
    console.log(`CHAMANDO ESTA URL: ${url}`);
    return this.requestService.get<ListObreirosResponse>(url);
  }

  addObreiro(obreiro: Request): Observable<AddObreiroResponse>{
    const url = `http://localhost:8001/${this.ObreirosUrl}`
    return this.requestService.post<Request, AddObreiroResponse>(
      url, 
      obreiro
      );
  }
}
