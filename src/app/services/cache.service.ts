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

  getValue(object?: any): Observable<T> | null {
    const now = new Date();
    const key: string | object = object ? object : this.DEFAULT_KEY;

    const item: CacheItem<T> | undefined = (this.cache.has(key)) ? this.cache.get(key) : undefined;
    console.log(item);
    if (!item || (now.getTime() - item.date.getTime() > this.CACHE_DURATION_IN_MINUTES * 60 * 1000)) {
      return null;
    }
    return item.value;
  }


  setValue(value: Observable<T>, object?: any) {
    console.log(value);
    const key = object ? object : this.DEFAULT_KEY;
    const date = new Date();
    this.cache.set(key, { date, value });
  }

  clearCache() {
    this.cache.clear();
  }
}