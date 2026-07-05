<?php

namespace App\Support;

class ImportUrlValidator
{
    public static function isValidImageUrl(?string $value): bool
    {
        if ($value === null || $value === '') {
            return true;
        }

        if (filter_var($value, FILTER_VALIDATE_URL) !== false) {
            return true;
        }

        return (bool) preg_match(
            '#^https?://(www\.)?mediafire\.com/(view|file)/[a-zA-Z0-9]+/.+#i',
            $value
        );
    }
}
