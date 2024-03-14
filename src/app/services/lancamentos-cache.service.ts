import {Injectable} from '@angular/core';
import { AbstractCacheService } from './cache.service';

@Injectable({
  providedIn: 'root'
})
export class LancamentosCacheService extends AbstractCacheService<any> {
}