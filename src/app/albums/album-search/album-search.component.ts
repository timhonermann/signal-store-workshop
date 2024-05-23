import {ChangeDetectionStrategy, Component, computed, effect, inject, OnInit} from '@angular/core';
import { ProgressBarComponent } from '@/shared/ui/progress-bar.component';
import { SortOrder } from '@/shared/models/sort-order.model';
import {Album, searchAlbums, sortAlbums} from '@/albums/album.model';
import { AlbumFilterComponent } from './album-filter/album-filter.component';
import { AlbumListComponent } from './album-list/album-list.component';
import {PartialStateUpdater, patchState, signalState} from "@ngrx/signals";
import {AlbumsService} from "@/albums/albums.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {catchError, EMPTY, exhaustMap, finalize, of, pipe, take} from "rxjs";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {tapResponse} from "@ngrx/operators";
import {AlbumSearchStore} from "@/albums/album-search/album-search.store";

@Component({
  selector: 'ngrx-album-search',
  standalone: true,
  providers: [AlbumSearchStore],
  imports: [ProgressBarComponent, AlbumFilterComponent, AlbumListComponent],
  template: `
    <ngrx-progress-bar [showProgress]="store.isPending()" />

    <div class="container">
      <h1>Albums ({{ store.totalAlbums() }})</h1>

      <ngrx-album-filter
        [query]="store.query()"
        [order]="store.order()"
        (queryChange)="store.updateQuery($event)"
        (orderChange)="store.updateOrder($event)"
      />

      <ngrx-album-list [albums]="store.filteredAlbums()" [showSpinner]="store.showSpinner()" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class AlbumSearchComponent {
  readonly store = inject(AlbumSearchStore);
}
