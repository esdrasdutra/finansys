import { Observable, map, of } from 'rxjs';
import hash from 'hash-it';
import * as dayjs from 'dayjs';

type CacheItem<T> = {
  date: Date,
  value: Observable<T>
};

export abstract class AbstractCacheService<T> {

  readonly CACHE_DURATION_IN_MINUTES = 5;
  readonly DEFAULT_KEY = 'DEFAULT';

  private cache: Map<string | object, CacheItem<T>> = new Map();

  getValue(object?: any): string | null {
    const now = new Date();
    const key: string = object ? object : this.DEFAULT_KEY;

    const item = (localStorage['has'](key)) ? localStorage.getItem(key) : undefined;
    if (!item ) {
      return null;
    }
    return item;
  }


  setValue(value: string, object?: any) {
    console.log(value);
    const key = object ? object : this.DEFAULT_KEY;
    const date = new Date();
    // value = JSON.stringify(value);

    localStorage.setItem(key, value);
  }

  clearCache() {
    this.cache.clear();
  }
}