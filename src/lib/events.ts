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

// Common event types
const CTAClick = {
  Clicked: 'CTA Clicked',
  Viewed: 'CTA Viewed',
};

const FormSubmit = {
  Clicked: 'Form Submit Clicked',
  Success: 'Form Submit Success',
  Error: 'Form Submit Error',
  ValidationError: 'Form Submit Validation Error',
};

const ActionEvent = {
  Clicked: 'Action Clicked',
  Started: 'Action Started',
  Success: 'Action Success',
  Error: 'Action Error',
  Cancelled: 'Action Cancelled',
};

// Define all tracking events
const RawEvents = {
  // Landing page events
  Landing: {
    Hero: {
      CTA: CTAClick,
      HowItWorksLink: { Clicked: 'Link Clicked' },
      ResearchLink: { Clicked: 'Link Clicked' },
    },
    FinalCTA: CTAClick,
    ReferencesLink: { Clicked: 'Link Clicked' },
  },

  // Authentication events
  Auth: {
    SignIn: {
      Started: 'Sign In Started',
      Success: 'Sign In Success',
      Error: 'Sign In Error',
      Cancelled: 'Sign In Cancelled',
    },
    SignOut: {
      Clicked: 'Sign Out Clicked',
      Success: 'Sign Out Success',
    },
  },

  // Onboarding flow events
  Onboarding: {
    PageViewed: 'Page Viewed',
    TimezoneSelected: 'Timezone Selected',
    CharitySelected: 'Charity Selected',
    Submit: FormSubmit,
  },

  // App - Habit management events
  App: {
    PageViewed: 'Page Viewed',
    NewHabitClicked: 'New Habit Button Clicked',

    Habit: {
      Complete: ActionEvent,
      Delete: ActionEvent,
      View: { Clicked: 'View Clicked' },
    },
  },

  // New Habit flow
  NewHabit: {
    PageViewed: 'Page Viewed',
    TaskEntered: 'Task Field Changed',
    DaysSelected: 'Days Selected',
    TimeSelected: 'Time Selected',
    StakeOpened: 'Stake Modal Opened',
    StakeCleared: 'Stake Cleared',
    CharitySelected: 'Charity Selected',
    Submit: FormSubmit,
  },

  // Edit Habit flow
  EditHabit: {
    PageViewed: 'Page Viewed',
    TaskChanged: 'Task Field Changed',
    DaysChanged: 'Days Changed',
    TimeChanged: 'Time Changed',
    StakeChanged: 'Stake Changed',
    CharityChanged: 'Charity Changed',
    Submit: FormSubmit,
    BackClicked: 'Back Button Clicked',
  },

  // Stake/Payment flow
  Payment: {
    StakeModal: {
      Opened: 'Stake Modal Opened',
      AmountEntered: 'Amount Entered',
      QuickAmountSelected: 'Quick Amount Selected',
      Cleared: 'Amount Cleared',
      Confirmed: 'Stake Confirmed',
      Closed: 'Modal Closed',
    },
    Consent: {
      ModalShown: 'Consent Modal Shown',
      Confirmed: 'Consent Confirmed',
      Cancelled: 'Consent Cancelled',
      FlowStarted: 'Consent Flow Started',
      CheckStarted: 'Consent Check Started',
      CheckSuccess: 'Consent Check Success',
      CheckError: 'Consent Check Error',
    },
    Callback: {
      PageViewed: 'Callback Page Viewed',
      Success: 'Payment Success',
      Failed: 'Payment Failed',
      Cancelled: 'Payment Cancelled',
      PollingStarted: 'Polling Started',
      PollingSuccess: 'Polling Success',
      PollingError: 'Polling Error',
      RetryClicked: 'Retry Clicked',
    },
  },

  // Navigation events
  Navigation: {
    NavbarLogoClicked: 'Navbar Logo Clicked',
    NavbarAboutClicked: 'Navbar About Clicked',
    NavbarBlogClicked: 'Navbar Blog Clicked',
    NavbarPricingClicked: 'Navbar Pricing Clicked',
    NavbarAppClicked: 'Navbar App Clicked',
    NavbarProfileClicked: 'Navbar Profile Clicked',
    NavbarSettingsClicked: 'Navbar Settings Clicked',
  },

  // General page views
  Page: {
    About: { Viewed: 'Page Viewed' },
    Blog: { Viewed: 'Page Viewed' },
    Pricing: { Viewed: 'Page Viewed' },
    Profile: { Viewed: 'Page Viewed' },
    Settings: { Viewed: 'Page Viewed' },
    Legal: { Viewed: 'Page Viewed' },
    References: { Viewed: 'Page Viewed' },
  },
};

const TrackingEvents = stringifyWithPath(RawEvents);

export { TrackingEvents };
