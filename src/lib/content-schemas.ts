import { z } from 'zod';

/**
 * Thrown when frontmatter fails schema validation. Loaders catch generic read
 * errors and degrade gracefully (return []/null), but they re-throw this type
 * so malformed frontmatter hard-fails the build instead of silently dropping
 * content.
 */
export class FrontmatterValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FrontmatterValidationError';
  }
}

/**
 * Per-content-type zod schemas for markdown frontmatter validation.
 *
 * Schemas are derived from the ACTUAL frontmatter present across every file
 * under content/. A field is required only when EVERY existing file has it and
 * the loader genuinely needs it; everything else is `.optional()`. All schemas
 * use `.passthrough()` so unknown/extra frontmatter keys are preserved rather
 * than rejected (team and tapestry frontmatter intentionally carry arbitrary
 * extra fields).
 */

/**
 * Run a zod schema against parsed frontmatter and fail loud on malformed data.
 *
 * On success returns the typed, parsed data. On failure throws a
 * FrontmatterValidationError whose message names the content type, the
 * slug/filename, and a readable dump of the zod issues so malformed content
 * fails the build with an actionable message instead of being silently dropped
 * or accepted.
 *
 * @param schema - The zod schema for the content type
 * @param data - The raw frontmatter object (gray-matter `data`)
 * @param context - Identifying info for the error message
 * @returns The parsed, typed frontmatter
 */
export function validateFrontmatter<T extends z.ZodTypeAny>(
  schema: T,
  data: unknown,
  context: { contentType: string; slug: string },
): z.infer<T> {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => {
        const path = issue.path.length > 0 ? issue.path.join('.') : '(root)';
        return `  - ${path}: ${issue.message}`;
      })
      .join('\n');
    throw new FrontmatterValidationError(
      `Invalid frontmatter for ${context.contentType} "${context.slug}":\n${issues}`,
    );
  }
  return result.data;
}

/**
 * Sponsor frontmatter. Only `name`, `tier`, and `website` exist in every file.
 * `location`, `partnership_year`, and `order` are read by the loader and
 * documented in the content README, so they are accepted (optional) with their
 * real types even though no current file sets them.
 */
export const sponsorSchema = z
  .object({
    name: z.string(),
    tier: z.string(),
    website: z.string(),
    location: z.string().optional(),
    partnership_year: z.number().optional(),
    order: z.number().optional(),
    logo: z.string().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
  })
  .passthrough();

/**
 * Exhibition frontmatter. Every field below is present in all exhibition files.
 */
export const exhibitionSchema = z
  .object({
    name: z.string(),
    state: z.string(),
    role: z.string(),
    address: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    image: z.string(),
    moreInfo: z.string().optional(),
  })
  .passthrough();

const timelineEventSchema = z
  .object({
    date: z.string(),
    title: z.string(),
    description: z.string(),
  })
  .passthrough();

const tapestryResourceSchema = z
  .object({
    title: z.string(),
    description: z.string(),
    kind: z.string(),
    url: z.string(),
  })
  .passthrough();

/**
 * Tapestry frontmatter. `title`, `summary`, `status`, `background_color`,
 * `colony`, and `audioDescription` are present in every file. `timelineEvents`
 * and `resources` are optional arrays.
 */
export const tapestrySchema = z
  .object({
    title: z.string(),
    summary: z.string(),
    status: z.string(),
    background_color: z.string(),
    colony: z.string().optional(),
    audioDescription: z.string().optional(),
    thumbnail: z.string().optional(),
    timelineEvents: z.array(timelineEventSchema).optional(),
    resources: z.array(tapestryResourceSchema).optional(),
  })
  .passthrough();

/**
 * Team group index frontmatter (content/team/<group>/index.md). `name`,
 * `description`, and `order` are present in every group index.
 */
export const teamGroupSchema = z
  .object({
    name: z.string(),
    description: z.string(),
    order: z.number(),
  })
  .passthrough();

/**
 * Team member frontmatter (content/team/<group>/<member>/index.md). Only
 * `name` and `role` are universal. `state` may be a single string or an array
 * of strings; `summary`/`moreInformation` may be null. Extra keys are preserved
 * via `.passthrough()` because members carry arbitrary additional fields.
 */
export const teamMemberSchema = z
  .object({
    name: z.string(),
    role: z.string(),
    state: z.union([z.string(), z.array(z.string())]).optional(),
    location: z.string().optional(),
    portrait: z.string().optional(),
    portraitPosition: z.string().optional(),
    imagePosition: z.string().optional(),
    image: z.string().optional(),
    images: z.array(z.string()).optional(),
    order: z.number().optional(),
    summary: z.string().nullable().optional(),
    moreInformation: z.string().nullable().optional(),
    visible: z.boolean().optional(),
  })
  .passthrough();

/**
 * Blog/news post frontmatter. `title`, `date`, `excerpt`, `featured`, and
 * `image` are present in every post. `category` is injected by the loader (not
 * in the file) so it is optional here. `videoUrl`/`videoWebm`/`author`/`draft`
 * are optional.
 */
export const blogPostSchema = z
  .object({
    title: z.string(),
    date: z.string(),
    excerpt: z.string().optional(),
    featured: z.boolean().optional(),
    image: z.string(),
    category: z.string().optional(),
    author: z.string().optional(),
    videoUrl: z.string().optional(),
    videoWebm: z.string().optional(),
    draft: z.boolean().optional(),
  })
  .passthrough();
