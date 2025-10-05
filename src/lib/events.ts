export type NestedStringObject = { [key: string]: string | NestedStringObject };

// Prefix each leaf string with its dot-path; returns a new object.
export function stringifyWithPath<T extends NestedStringObject>(obj: T, prefix = ''): T {
  const out: NestedStringObject = {};
  for (const key in obj) {
    const path = prefix ? `${prefix}.${key}` : key;
    const val = obj[key];
    out[key] = typeof val === 'string' ? `${path} ${val}` : stringifyWithPath(val as NestedStringObject, path);
  }
  return out as T;
}

const WaitList = {
  SubmitClicked: 'Waitlist Submit Clicked',
  ClientInvalid: 'Waitlist Submit Client Invalid Email',
  ServerInvalid: 'Waitlist Submit Server Invalid Email',
  Success: 'Waitlist Submit Success',
  AlreadySubscribed: 'Waitlist Submit Already Subscribed',
  Error: 'Waitlist Submit Error',
};

const RawEvents = {
  Landing: {
    MainCTA: WaitList,
    CommunityCTA: WaitList,
    FinalCTA: WaitList,
  },
};

const TrackingEvents = stringifyWithPath(RawEvents);

export { TrackingEvents };
