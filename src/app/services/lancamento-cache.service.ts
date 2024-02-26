import {Injectable} from '@angular/core';
import { Lancamento } from 'src/app/models/Lancamento';
import { AbstractCacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class LancamentoCacheService extends AbstractCacheService<Lancamento> {
}