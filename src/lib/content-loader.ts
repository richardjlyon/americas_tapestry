import type { z } from 'zod';
import {
  getAllContent,
  getContentBySlug,
  type ContentItem,
} from './content-core';
import {
  validateFrontmatter,
  FrontmatterValidationError,
} from './content-schemas';

/**
 * A pair of read functions for a markdown-backed content type.
 */
export interface ContentLoader<T> {
  getAll: () => Promise<T[]>;
  getBySlug: (slug: string) => Promise<T | null>;
}

/**
 * Build the standard getAll/getBySlug pair for a markdown content type.
 *
 * Collapses the boilerplate every domain loader otherwise repeats: read via
 * content-core, skip README, validate frontmatter against a zod schema, map the
 * validated data to a domain object, and (for getAll) sort. Frontmatter
 * validation errors propagate (hard-fail the build); any other error degrades
 * gracefully to []/null, matching the loaders' existing resilience contract.
 *
 * @param config.contentType - Directory name under `content/`
 * @param config.label - Singular label used in validation error messages
 * @param config.schema - zod schema for this content type's frontmatter
 * @param config.map - Maps validated frontmatter + raw item to a domain object
 * @param config.sort - Optional comparator applied by getAll
 */
export function defineContentLoader<T, S extends z.ZodTypeAny>(config: {
  contentType: string;
  label: string;
  schema: S;
  map: (data: z.infer<S>, item: ContentItem) => T;
  sort?: (a: T, b: T) => number;
}): ContentLoader<T> {
  const { contentType, label, schema, map, sort } = config;

  return {
    async getAll(): Promise<T[]> {
      try {
        const items = await getAllContent(contentType);
        const mapped = items
          .filter((item) => item.slug !== 'README')
          .map((item) =>
            map(
              validateFrontmatter(schema, item.frontmatter, {
                contentType: label,
                slug: item.slug,
              }),
              item,
            ),
          );
        return sort ? mapped.sort(sort) : mapped;
      } catch (error) {
        if (error instanceof FrontmatterValidationError) throw error;
        console.error(`Error getting all ${contentType}:`, error);
        return [];
      }
    },

    async getBySlug(slug: string): Promise<T | null> {
      try {
        const item = await getContentBySlug(contentType, slug);
        if (!item) {
          return null;
        }
        return map(
          validateFrontmatter(schema, item.frontmatter, {
            contentType: label,
            slug,
          }),
          item,
        );
      } catch (error) {
        if (error instanceof FrontmatterValidationError) throw error;
        console.error(`Error getting ${label} by slug ${slug}:`, error);
        return null;
      }
    },
  };
}
