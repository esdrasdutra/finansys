import {Observable, map, of} from 'rxjs';
import hash from 'hash-it';
import * as dayjs from 'dayjs';

export abstract class AbstractCacheService<T> {

  readonly CACHE_DURATION_IN_MINUTES = 5;
  readonly DEFAULT_KEY = 'DEFAULT';

  private cache: {
    [id: string]: {
      expires: Date,
      value: Observable<T>
    }
  } = {};



  getValue(object?: any): Observable<T> {

    return object;
  }

  setValue(value: Observable<T>, object?: any) {
    const key = object ? hash(object).toString() : this.DEFAULT_KEY;
    const expires = dayjs(new Date())
      .add(this.CACHE_DURATION_IN_MINUTES, 'minutes')
      .toDate();
    this.cache[key] = {expires, value};
  }

  clearCache() {
    this.cache = {};
  }
}