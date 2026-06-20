interface StitcherSectionsProps {
  stateDirectors: string[];
  coreVolunteers: string[];
  guestVolunteers: string[];
}

const GROUPS: { label: string; key: keyof StitcherSectionsProps }[] = [
  { label: 'State Directors', key: 'stateDirectors' },
  { label: 'Core Volunteers', key: 'coreVolunteers' },
  { label: 'Guest Volunteers', key: 'guestVolunteers' },
];

/**
 * Renders stitcher names as plain text: a bold group name followed by a
 * comma-separated paragraph of names. Empty groups are omitted.
 */
export function StitcherSections(props: StitcherSectionsProps) {
  return (
    <div className="space-y-6">
      {GROUPS.map(({ label, key }) => {
        const names = props[key];
        if (!names || names.length === 0) return null;
        return (
          <div key={key}>
            <p className="font-bold text-colonial-navy">{label}</p>
            <p className="text-colonial-navy">{names.join(', ')}</p>
          </div>
        );
      })}
    </div>
  );
}
