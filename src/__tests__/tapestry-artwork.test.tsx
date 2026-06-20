import {
  getTapestryBySlug,
  findArtworkInDirectory,
  findPhotoInDirectory,
} from '@/lib/tapestries';
import { render, screen } from '@testing-library/react';
import { ArtworkCard } from '@/components/features/tapestries/artwork-card';

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

describe('ArtworkCard', () => {
  beforeEach(() => {
    // Mock IntersectionObserver (not available in jsdom)
    Object.defineProperty(window, 'IntersectionObserver', {
      writable: true,
      configurable: true,
      value: jest.fn().mockImplementation(() => ({
        observe: jest.fn(),
        unobserve: jest.fn(),
        disconnect: jest.fn(),
      })),
    });

    // Mock canvas.toDataURL (not implemented in jsdom)
    const originalCreateElement = document.createElement.bind(document);
    jest.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName === 'canvas') {
        return {
          width: 1,
          height: 1,
          toDataURL: jest.fn().mockReturnValue('data:image/webp;base64,mocked'),
        } as unknown as HTMLCanvasElement;
      }
      return originalCreateElement(tagName);
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('names one artist and links to their page', () => {
    render(
      <ArtworkCard
        src="/images/tapestries/new-hampshire/new-hampshire-tapestry-1024w.webp"
        alt="New Hampshire original artwork"
        artists={[{ name: 'Elizabeth Long', href: '/team/illustrators/elizabeth-long' }]}
      />,
    );
    const link = screen.getByRole('link', { name: 'Elizabeth Long' });
    expect(link).toHaveAttribute('href', '/team/illustrators/elizabeth-long');
    expect(screen.getByText(/our stitchers worked from/i)).toBeInTheDocument();
  });

  it('uses the generic caption with no artist and renders no link', () => {
    render(
      <ArtworkCard src="/x.webp" alt="art" artists={[]} />,
    );
    expect(
      screen.getByText('The original illustration our stitchers worked from.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('link')).toBeNull();
  });

  it('links every artist when there are multiple', () => {
    render(
      <ArtworkCard
        src="/x.webp"
        alt="art"
        artists={[
          { name: 'Ada One', href: '/team/illustrators/ada-one' },
          { name: 'Bea Two', href: '/team/illustrators/bea-two' },
        ]}
      />,
    );
    expect(screen.getByRole('link', { name: 'Ada One' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Bea Two' })).toBeInTheDocument();
  });
});
