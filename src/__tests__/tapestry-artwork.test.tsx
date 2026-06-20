import {
  getTapestryBySlug,
  findArtworkInDirectory,
  findPhotoInDirectory,
} from '@/lib/tapestries';

describe('tapestry artwork data layer', () => {
  it('findPhotoInDirectory returns the photograph for a state', () => {
    expect(findPhotoInDirectory('connecticut')).toMatch(/connecticut-photo\.jpg$/);
  });

  it('findArtworkInDirectory returns the artwork, excluding thumbnails', () => {
    // connecticut: {slug}-tapestry-{w}w naming
    expect(findArtworkInDirectory('connecticut')).toMatch(
      /\/images\/tapestries\/connecticut\/connecticut-tapestry-.*\.(webp|jpg|jpeg|png|avif)$/,
    );
    // georgia: {slug}-tapestry-main-{w}w naming, with separate -thumbnail- files
    const g = findArtworkInDirectory('georgia');
    expect(g).toMatch(/georgia-tapestry-main-/);
    expect(g).not.toMatch(/thumbnail/);
  });

  it('findArtworkInDirectory returns null for an unknown slug', () => {
    expect(findArtworkInDirectory('atlantis')).toBeNull();
  });

  it('getTapestryBySlug: imagePath/thumbnail are the photo, artworkPath is the artwork', async () => {
    const t = await getTapestryBySlug('georgia');
    expect(t).not.toBeNull();
    expect(t!.imagePath).toMatch(/georgia-photo\.jpg$/);
    expect(t!.thumbnail).toMatch(/georgia-photo\.jpg$/);
    expect(t!.artworkPath).toMatch(/georgia-tapestry-main-/);
  });
});
