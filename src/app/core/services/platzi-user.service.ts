import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { APP_CONFIG } from '../constants/app-config';
import { PlatziUser } from '../models/platzi/platzi-user.model';
import { mapPlatziUserToUser } from '../mappers/platzi-user.mapper';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class PlatziUserService {
  private readonly apiUrl = APP_CONFIG.PLATZI_API_BASE_URL;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<User[]> {
    return this.http
      .get<PlatziUser[]>(`${this.apiUrl}/users`)
      .pipe(map((list) => list.map(mapPlatziUserToUser)));
  }

  getUserById(id: string): Observable<User> {
    return this.http
      .get<PlatziUser>(`${this.apiUrl}/users/${id}`)
      .pipe(map(mapPlatziUserToUser));
  }
}
