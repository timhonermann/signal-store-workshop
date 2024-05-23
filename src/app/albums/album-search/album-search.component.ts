import {ChangeDetectionStrategy, Component, computed, inject, OnInit} from '@angular/core';
import { ProgressBarComponent } from '@/shared/ui/progress-bar.component';
import { SortOrder } from '@/shared/models/sort-order.model';
import {Album, searchAlbums, sortAlbums} from '@/albums/album.model';
import { AlbumFilterComponent } from './album-filter/album-filter.component';
import { AlbumListComponent } from './album-list/album-list.component';
import {patchState, signalState} from "@ngrx/signals";
import {AlbumsService} from "@/albums/albums.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {catchError, finalize, of, take} from "rxjs";

@Component({
  selector: 'ngrx-album-search',
  standalone: true,
  imports: [ProgressBarComponent, AlbumFilterComponent, AlbumListComponent],
  template: `
    <ngrx-progress-bar [showProgress]="state.showProgress()" />

    <div class="container">
      <h1>Albums ({{ totalAlbums() }})</h1>

      <ngrx-album-filter
        [query]="state.query()"
        [order]="state.order()"
        (queryChange)="updateQuery($event)"
        (orderChange)="updateOrder($event)"
      />

      <ngrx-album-list [albums]="filteredAlbums()" [showSpinner]="showSpinner()" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AlbumSearchComponent implements OnInit {
  readonly #albumsService = inject(AlbumsService);

  readonly #snackbarService = inject(MatSnackBar);

  readonly state = signalState<{ albums: Album[], showProgress: boolean, query: string, order: SortOrder }>({
    albums: [],
    showProgress: true,
    query: '',
    order: 'asc'
  })

  readonly filteredAlbums = computed(() => {
    const searchedAlbums = searchAlbums(this.state.albums(), this.state.query());

    return sortAlbums(searchedAlbums, this.state.order());
  });

  readonly totalAlbums = computed(() => this.filteredAlbums().length);

  readonly showSpinner = computed(() => this.state.showProgress() && this.totalAlbums() === 0);

  ngOnInit(): void {
    this.#albumsService.getAll().pipe(
      take(1),
      catchError((error) => {
        this.#snackbarService.open(error.message, 'Close', { duration: 5_000 });

        return of([])
      }),
      finalize(() => patchState(this.state, { showProgress: false }))
    ).subscribe((albums) => {
      patchState(this.state, { albums });
    })
  }

  updateQuery(query: string): void {
    patchState(this.state, { query })
  }

  updateOrder(order: SortOrder): void {
    patchState(this.state, { order })
  }
}
