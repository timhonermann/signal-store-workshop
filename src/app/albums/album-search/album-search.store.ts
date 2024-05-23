import {patchState, signalStore, type, withComputed, withHooks, withMethods, withState} from "@ngrx/signals";
import {AlbumSearchState} from "@/albums/album-search/models/album-search.models";
import {computed, inject} from "@angular/core";
import {Album, searchAlbums, sortAlbums} from "@/albums/album.model";
import {SortOrder} from "@/shared/models/sort-order.model";
import {rxMethod} from "@ngrx/signals/rxjs-interop";
import {exhaustMap, filter, pipe, tap} from "rxjs";
import {tapResponse} from "@ngrx/operators";
import {AlbumsService} from "@/albums/albums.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {
  withRequestStatus
} from "@/shared/state/request-status.feature";
import {setAllEntities, withEntities} from "@ngrx/signals/entities";

export const AlbumSearchStore = signalStore(
  withState<AlbumSearchState>({
    query: '',
    order: 'asc'
  }),
  withEntities<Album>(),
  withRequestStatus(),
  withComputed((state) => {
    const filteredAlbums = computed(() => {
      console.log('my state', state);
      const searchedAlbums = searchAlbums(state.entities(), state.query());

      return sortAlbums(searchedAlbums, state.order());
    });
    const totalAlbums = computed(() => filteredAlbums().length);
    const showSpinner = computed(() => state.isPending() && state.entities().length === 0)

    return {
      filteredAlbums,
      totalAlbums,
      showSpinner
    }
  }),
  withMethods((state) => {
    const albumsService = inject(AlbumsService);
    const snackbarService = inject(MatSnackBar);

    return {
      updateQuery: (query: string): void => {
        patchState(state, {query})
      },
      updateOrder: (order: SortOrder): void => {
        patchState(state, {order})
      },
      notifyOnError: rxMethod<string | null> (
        pipe(
          filter(Boolean),
          tap((error: string) => snackbarService.open(error, 'Close', {duration: 5_000})) // Why is the type needed and not inferred?
        )
      ),
      loadAllAlbums:
        rxMethod<void>(
          pipe(
            tap(() => state.setRequestStatusPending()),
          exhaustMap(() => albumsService.getAll().pipe(
            tapResponse({
              next: albums => {
                state.setRequestStatusCompleted();
                patchState(state, setAllEntities(albums))
              },
              error: (error: {
                message: string
              }) => state.setRequestStatusError(error.message)
            })
          )),
          )
        ),
    }
  }),
  withHooks({
    onInit({ loadAllAlbums, notifyOnError, error }) {
      loadAllAlbums()
      notifyOnError(error)
    }
  })
);
