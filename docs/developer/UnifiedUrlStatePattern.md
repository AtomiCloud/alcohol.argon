# Unified URL State Pattern

## Overview

All pages follow a consistent pattern where **query params are the source of truth** for form state, with proper SSR integration and client-side timezone detection.

## Core Principles

1. **Query params = Source of truth**: All form state derives from URL
2. **SSR Priority**: Query params > SSR data > Client defaults
3. **Bidirectional sync**: URL ↔ State always in sync
4. **Smart sync strategies**:
   - Text inputs: Debounced (300ms) - prevents excessive URL updates while typing
   - Selectors: Immediate - instant URL update on selection
5. **Client timezone detection**: Never hardcode UTC, detect from browser

## Tools

### 1. `getClientTimezone()`

```typescript
import { getClientTimezone, hasTimezoneMismatch } from '@/lib/utility/timezone-detection';

// Get user's detected timezone
const detectedTz = getClientTimezone(); // "America/Los_Angeles"

// Check if saved timezone differs from detected
const { hasMismatch, detectedTimezone, savedTimezone } = hasTimezoneMismatch(config.timezone);
if (hasMismatch) {
  // Show warning: "Your saved timezone is UTC but we detected America/Los_Angeles"
}
```

### 2. `useEnhancedFormUrlState()`

```typescript
import { useEnhancedFormUrlState } from '@/lib/urlstate/useEnhancedFormUrlState';

const { state, updateField, updateFieldImmediate } = useEnhancedFormUrlState({
  task: '',
  charity: '',
  tz: '',
});

// Text input - debounced
<Input value={state.task} onChange={(e) => updateField({ task: e.target.value })} />

// Selector - immediate
<CharitySelector value={state.charity} onChange={(id) => updateFieldImmediate({ charity: id })} />
```

## Page Patterns

### 1. Onboarding Page

**SSR**: Query params > Config default > Client timezone detection

```typescript
export const getServerSideProps = withServerSideAtomi(
  { ...buildTime, guard: 'public' },
  async (context, { apiTree, config }) => {
    const api = apiTree.alcohol.zinc.api;

    // Priority: Query params > config default
    const charityIdFromQuery = context.query.charityId as string | undefined;
    const charityId = charityIdFromQuery || config.common.onboarding.defaultCharityId;

    // Fetch charity for display
    const charitySerial = await api
      .vCharityDetail({ version: '1.0', id: charityId })
      .then(r => r.map(d => d.principal).serial());

    return {
      props: {
        charity: charitySerial,
        // Don't pass tz from query - let client detect it
        // Only pass charityId if from query
        queryDefaults: {
          charityId: charityIdFromQuery || charityId,
        },
      },
    };
  },
);
```

```typescript
export default function OnboardingPage({ charity, queryDefaults }) {
  const [charityResult] = useState(() => Res.fromSerial(charity));
  const [, loader] = useFreeLoader();
  const charityData = useContent(charityResult, { loader });

  const { state, updateField, updateFieldImmediate } = useEnhancedFormUrlState({
    tz: queryDefaults.tz || getClientTimezone(), // Client-detected timezone
    charityId: queryDefaults.charityId || '',
  });

  const handleSubmit = async () => {
    await api.vConfigurationCreate2({
      timezone: state.tz,
      defaultCharityId: state.charityId,
    });
    router.push('/app');
  };

  return (
    <>
      <TimezoneComboBox
        value={state.tz}
        onChange={(tz) => updateFieldImmediate({ tz })} // Immediate
      />
      <CharitySelector
        value={state.charityId}
        initialPrincipal={charityData}
        onChange={(id) => updateFieldImmediate({ charityId: id })} // Immediate
      />
      <AsyncButton onClick={handleSubmit}>Complete Setup</AsyncButton>
    </>
  );
}
```

### 2. Settings Page

**SSR**: Query params > Saved config

```typescript
export const getServerSideProps = withServerSideAtomi(
  { ...buildTime, guard: 'private' },
  async (context, { apiTree }) => {
    const api = apiTree.alcohol.zinc.api;

    const initial = await api
      .vConfigurationMeList({ version: '1.0' })
      .then(configResult =>
        configResult.andThen(async configuration => {
          // Priority: Query params > saved config
          const tzFromQuery = context.query.tz as string | undefined;
          const charityFromQuery = context.query.charity as string | undefined;

          const charityId = charityFromQuery || configuration.principal.defaultCharityId!;

          const charity = await api.vCharityDetail({ version: '1.0', id: charityId });

          return charity.map(c => ({
            savedConfig: configuration, // For diffing
            defaultCharity: c.principal,
            // Pass query params if present, otherwise saved values
            queryParams: {
              tz: tzFromQuery || configuration.principal.timezone || '',
              charity: charityId,
            },
          }));
        }),
      )
      .then(r => r.serial());

    return { props: { initial } };
  },
);
```

```typescript
export default function SettingsPage({ initial }) {
  const [dataResult] = useState(() => Res.fromSerial(initial));
  const data = useContent(dataResult);

  const { state, updateField, updateFieldImmediate } = useEnhancedFormUrlState({
    tz: data?.queryParams.tz || getClientTimezone(), // Client-detected if no saved value
    charity: data?.queryParams.charity || '',
  });

  // Diff current state vs saved config to enable/disable save button
  const hasChanges = useMemo(() => {
    if (!data) return false;
    return (
      state.tz !== data.savedConfig.principal.timezone ||
      state.charity !== data.savedConfig.principal.defaultCharityId
    );
  }, [state, data]);

  // Show timezone mismatch warning
  const tzMismatch = data ? hasTimezoneMismatch(data.savedConfig.principal.timezone) : null;

  const handleSave = async () => {
    await api.vConfigurationUpdate2({
      timezone: state.tz,
      defaultCharityId: state.charity,
    });

    // Refresh with updated URL to show new saved state
    const newQuery = { tz: state.tz, charity: state.charity };
    await router.replace({ query: newQuery });
  };

  if (!data) return null;

  return (
    <>
      {tzMismatch?.hasMismatch && (
        <Alert>
          Your saved timezone is {tzMismatch.savedTimezone} but we detected{' '}
          {tzMismatch.detectedTimezone}.
          <Button onClick={() => updateFieldImmediate({ tz: tzMismatch.detectedTimezone })}>
            Update to detected timezone
          </Button>
        </Alert>
      )}

      <TimezoneComboBox
        value={state.tz}
        onChange={(tz) => updateFieldImmediate({ tz })} // Immediate
      />
      <CharitySelector
        value={state.charity}
        initialPrincipal={data.defaultCharity}
        onChange={(id) => updateFieldImmediate({ charity: id })} // Immediate
      />

      <AsyncButton onClick={handleSave} disabled={!hasChanges}>
        Save Changes
      </AsyncButton>
    </>
  );
}
```

### 3. New Habit Page

**SSR**: Query params > Config default > Client timezone

```typescript
export const getServerSideProps = withServerSideAtomi(
  { ...buildTime, guard: 'private' },
  async (context, { apiTree }) => {
    const api = apiTree.alcohol.zinc.api;

    const initial = await api
      .vConfigurationMeList({ version: '1.0' })
      .then(configResult =>
        configResult.andThen(async configuration => {
          // Priority: Query params > config default
          const charityFromQuery = context.query.charity as string | undefined;
          const charityId = charityFromQuery || configuration.principal.defaultCharityId!;

          const charity = await api.vCharityDetail({ version: '1.0', id: charityId });

          return charity.map(c => ({
            defaultCharity: c.principal,
            timezone: configuration.principal.timezone || null,
            // Pass query params with priorities
            queryParams: {
              task: context.query.task || '',
              days: context.query.days || JSON.stringify(WEEKDAY_ORDER),
              time: context.query.time || '22:00',
              amount: context.query.amount || '',
              charity: charityId,
            },
          }));
        }),
      )
      .then(r => r.serial());

    return { props: { initial } };
  },
);
```

```typescript
export default function NewHabitPage({ initial }) {
  const [dataResult] = useState(() => Res.fromSerial(initial));
  const [, loader] = useFreeLoader();
  const data = useContent(dataResult, { loader });

  const { state, updateField, updateFieldImmediate } = useEnhancedFormUrlState({
    task: data?.queryParams.task || '',
    days: data?.queryParams.days || JSON.stringify(WEEKDAY_ORDER),
    time: data?.queryParams.time || '22:00',
    amount: data?.queryParams.amount || '',
    charity: data?.queryParams.charity || '',
  });

  const daysOfWeek = useMemo(() => {
    try {
      return JSON.parse(state.days);
    } catch {
      return [];
    }
  }, [state.days]);

  const handleCreate = async () => {
    await api.vHabitCreate({
      task: state.task,
      daysOfWeek,
      notificationTime: toHHMMSS(state.time),
      stake: parseFloat(state.amount) || undefined,
      charityId: state.charity || undefined,
    });
    router.push('/app');
  };

  if (!data) return null;

  return (
    <HabitEditorCard
      draft={{
        task: state.task,
        daysOfWeek,
        notificationTime: state.time,
        amount: state.amount,
        charityId: state.charity,
      }}
      charityPrincipal={data.defaultCharity}
      onChange={(draft) => {
        // Text fields - debounced
        updateField({
          task: draft.task,
          days: JSON.stringify(draft.daysOfWeek),
          time: draft.notificationTime,
        });
      }}
    />
    <CharitySelector
      value={state.charity}
      initialPrincipal={data.defaultCharity}
      onChange={(id) => updateFieldImmediate({ charity: id })} // Immediate
    />
    <Input
      type="number"
      value={state.amount}
      onBlur={(e) => updateFieldImmediate({ amount: e.target.value })} // Immediate on blur
    />
  );
}
```

### 4. Edit Habit Page

**SSR**: Query params > Habit values

```typescript
export const getServerSideProps = withServerSideAtomi(
  { ...buildTime, guard: 'private' },
  async (context, { apiTree }) => {
    const api = apiTree.alcohol.zinc.api;
    const habitId = context.params!.id as string;

    const initial = await api
      .vUserMeList({ version: '1.0' }, { format: 'text' })
      .then(userIdResult =>
        userIdResult.andThen(async userId => {
          const habit = await api.vHabitDetail2({ version: '1.0', userId, id: habitId });

          return habit.andThen(async h => {
            // Priority: Query params > habit values
            const charityFromQuery = context.query.charity as string | undefined;
            const charityId = charityFromQuery || h.charityId;

            if (!charityId) {
              return Ok({ habit: h, habitCharity: null, queryParams: {} });
            }

            const charity = await api.vCharityDetail({ version: '1.0', id: charityId });

            return charity.map(c => ({
              habit: h,
              habitCharity: c.principal,
              queryParams: {
                task: context.query.task || h.task || '',
                days: context.query.days || JSON.stringify(h.daysOfWeek || []),
                time: context.query.time || toHM(h.notificationTime || ''),
                amount: context.query.amount || h.stake?.toString() || '',
                charity: charityId,
              },
            }));
          });
        }),
      )
      .then(r => r.serial());

    return { props: { initial } };
  },
);
```

```typescript
// Client-side: Same as New Habit but with habit data as defaults
```

## Summary Table

| Page           | Realtime Fields (Debounced) | Immediate Fields    | Diff Logic            |
| -------------- | --------------------------- | ------------------- | --------------------- |
| **Onboarding** | -                           | `tz`, `charityId`   | N/A (no save button)  |
| **Settings**   | -                           | `tz`, `charity`     | vs `savedConfig`      |
| **New Habit**  | `task`, `days`, `time`      | `amount`, `charity` | N/A (always can save) |
| **Edit Habit** | `task`, `days`, `time`      | `amount`, `charity` | N/A (always can save) |

## Benefits

✅ **Consistent pattern** across all pages
✅ **Query params = source of truth** - shareable URLs, back button works
✅ **SSR-first** - All data available on first render
✅ **Smart sync** - Debounced for text, immediate for selectors
✅ **Client timezone detection** - No hardcoded UTC
✅ **Clean diff logic** - Settings page shows save button only when changed
