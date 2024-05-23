import {Album} from "@/albums/album.model";
import {SortOrder} from "@/shared/models/sort-order.model";

export type AlbumSearchState = {
  albums: Album[];
  query: string,
  order: SortOrder
}
