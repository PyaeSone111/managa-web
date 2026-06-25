<?php

namespace App\Support;

use App\Models\Series;

class SeriesCardFormatter
{
    /**
     * Relations to eager-load for card/list payloads.
     */
    public static function relations(): array
    {
        return ['categories:id,name,slug', 'mangaTypes:id,name,slug', 'authors:id,name,slug'];
    }

    /**
     * Author, artist, and type fields shared by card API responses.
     */
    public static function metaFields(Series $series): array
    {
        return [
            'type' => $series->type,
            'author' => $series->author,
            'artist' => $series->artist,
            'authors' => $series->relationLoaded('authors') ? $series->authors : [],
            'manga_types' => $series->relationLoaded('mangaTypes') ? $series->mangaTypes : [],
            'types' => $series->relationLoaded('mangaTypes') ? $series->mangaTypes : [],
        ];
    }
}
