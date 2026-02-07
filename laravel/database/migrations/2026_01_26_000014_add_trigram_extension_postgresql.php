<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            // Enable required PostgreSQL extensions
            DB::statement('CREATE EXTENSION IF NOT EXISTS pg_trgm');
            DB::statement('CREATE EXTENSION IF NOT EXISTS unaccent');
            DB::statement('CREATE EXTENSION IF NOT EXISTS btree_gin');

            // Add trigram index on series title
            DB::statement('CREATE INDEX IF NOT EXISTS idx_series_title_trgm ON series USING GIN(title gin_trgm_ops)');

            // Create search vector update function
            DB::statement("
                CREATE OR REPLACE FUNCTION update_series_search_vector()
                RETURNS TRIGGER AS \$\$
                BEGIN
                    NEW.search_vector :=
                        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
                        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'C');
                    RETURN NEW;
                END;
                \$\$ LANGUAGE plpgsql;
            ");

            // Create trigger to auto-update search vector
            DB::statement("DROP TRIGGER IF EXISTS trigger_series_search_vector ON series");
            DB::statement("
                CREATE TRIGGER trigger_series_search_vector
                    BEFORE INSERT OR UPDATE OF title, description ON series
                    FOR EACH ROW EXECUTE FUNCTION update_series_search_vector()
            ");

            // Create trigger to update series stats on chapter changes
            DB::statement("
                CREATE OR REPLACE FUNCTION update_series_chapter_stats()
                RETURNS TRIGGER AS \$\$
                BEGIN
                    IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
                        UPDATE series
                        SET
                            total_chapters = (
                                SELECT COUNT(*) FROM chapters
                                WHERE series_id = NEW.series_id AND is_published = TRUE
                            ),
                            last_chapter_at = (
                                SELECT MAX(published_at) FROM chapters
                                WHERE series_id = NEW.series_id AND is_published = TRUE
                            ),
                            updated_at = NOW()
                        WHERE id = NEW.series_id;
                        RETURN NEW;
                    ELSIF TG_OP = 'DELETE' THEN
                        UPDATE series
                        SET
                            total_chapters = (
                                SELECT COUNT(*) FROM chapters
                                WHERE series_id = OLD.series_id AND is_published = TRUE
                            ),
                            last_chapter_at = (
                                SELECT MAX(published_at) FROM chapters
                                WHERE series_id = OLD.series_id AND is_published = TRUE
                            ),
                            updated_at = NOW()
                        WHERE id = OLD.series_id;
                        RETURN OLD;
                    END IF;
                END;
                \$\$ LANGUAGE plpgsql;
            ");

            DB::statement("DROP TRIGGER IF EXISTS trigger_update_series_chapter_stats ON chapters");
            DB::statement("
                CREATE TRIGGER trigger_update_series_chapter_stats
                    AFTER INSERT OR UPDATE OR DELETE ON chapters
                    FOR EACH ROW EXECUTE FUNCTION update_series_chapter_stats()
            ");

            // Create trigger for favorites count
            DB::statement("
                CREATE OR REPLACE FUNCTION update_series_favorites_count()
                RETURNS TRIGGER AS \$\$
                BEGIN
                    IF TG_OP = 'INSERT' THEN
                        UPDATE series SET total_favorites = total_favorites + 1 WHERE id = NEW.series_id;
                        RETURN NEW;
                    ELSIF TG_OP = 'DELETE' THEN
                        UPDATE series SET total_favorites = total_favorites - 1 WHERE id = OLD.series_id;
                        RETURN OLD;
                    END IF;
                END;
                \$\$ LANGUAGE plpgsql;
            ");

            DB::statement("DROP TRIGGER IF EXISTS trigger_update_favorites_count ON user_favorites");
            DB::statement("
                CREATE TRIGGER trigger_update_favorites_count
                    AFTER INSERT OR DELETE ON user_favorites
                    FOR EACH ROW EXECUTE FUNCTION update_series_favorites_count()
            ");

            // Create trigger for ratings
            DB::statement("
                CREATE OR REPLACE FUNCTION update_series_rating()
                RETURNS TRIGGER AS \$\$
                BEGIN
                    UPDATE series
                    SET
                        rating = (SELECT ROUND(AVG(rating)::DECIMAL, 2) FROM user_ratings WHERE series_id = COALESCE(NEW.series_id, OLD.series_id)),
                        rating_count = (SELECT COUNT(*) FROM user_ratings WHERE series_id = COALESCE(NEW.series_id, OLD.series_id))
                    WHERE id = COALESCE(NEW.series_id, OLD.series_id);
                    RETURN COALESCE(NEW, OLD);
                END;
                \$\$ LANGUAGE plpgsql;
            ");

            DB::statement("DROP TRIGGER IF EXISTS trigger_update_series_rating ON user_ratings");
            DB::statement("
                CREATE TRIGGER trigger_update_series_rating
                    AFTER INSERT OR UPDATE OR DELETE ON user_ratings
                    FOR EACH ROW EXECUTE FUNCTION update_series_rating()
            ");
        }
    }

    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('DROP TRIGGER IF EXISTS trigger_series_search_vector ON series');
            DB::statement('DROP FUNCTION IF EXISTS update_series_search_vector()');
            DB::statement('DROP TRIGGER IF EXISTS trigger_update_series_chapter_stats ON chapters');
            DB::statement('DROP FUNCTION IF EXISTS update_series_chapter_stats()');
            DB::statement('DROP TRIGGER IF EXISTS trigger_update_favorites_count ON user_favorites');
            DB::statement('DROP FUNCTION IF EXISTS update_series_favorites_count()');
            DB::statement('DROP TRIGGER IF EXISTS trigger_update_series_rating ON user_ratings');
            DB::statement('DROP FUNCTION IF EXISTS update_series_rating()');
            DB::statement('DROP INDEX IF EXISTS idx_series_title_trgm');
        }
    }
};
