import { Pipe, PipeTransform } from '@angular/core';
import { getSafeUrl } from '../utils/url.util';

@Pipe({
  name: 'safeUrl',
})
export class SafeUrlPipe implements PipeTransform {
  transform(value: string | null): string | null {
    return getSafeUrl(value);
  }
}
