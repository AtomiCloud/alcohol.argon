import { useState } from 'react';
import type { GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { buildTime } from '@/adapters/external/core';
import { withServerSideAtomi } from '@/adapters/atomi/next';
import { useSwaggerClients } from '@/adapters/external/Provider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangePicker, type DisabledDateType } from '@/components/ui/date-range-picker';
import type { DateRange } from 'react-day-picker';
import { isWithinInterval } from 'date-fns';
import type { VacationRes } from '@/clients/alcohol/zinc/api';
import { ArrowLeft, Palmtree } from 'lucide-react';
import { useProblemReporter } from '@/adapters/problem-reporter/providers/hooks';
import type { Problem } from '@/lib/problem/core';
import { Res, type Result, type ResultSerial } from '@/lib/monads/result';
import { useContent } from '@/lib/content/providers/useContent';
import { useFreeLoader } from '@/lib/content/providers/useFreeLoader';
import { useFreeEmpty } from '@/lib/content/providers/useFreeEmpty';
import Toast from '@/components/Toast';
import { usePlausible } from '@/lib/tracker/usePlausible';
import { TrackingEvents } from '@/lib/events';

type NewVacationPageData = {
  vacations: VacationRes[];
  userId: string;
};

type NewVacationPageProps = { initial: ResultSerial<NewVacationPageData, Problem> };

export default function NewVacationPage({ initial }: NewVacationPageProps) {
  const router = useRouter();
  const api = useSwaggerClients();
  const problemReporter = useProblemReporter();
  const track = usePlausible();

  // State management - must be before early return
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [busyVacation, setBusyVacation] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [rangeError, setRangeError] = useState<string | null>(null);

  // Content management
  const [loading, loader] = useFreeLoader();
  const [desc, empty] = useFreeEmpty();
  const [contentResult, setContentResult] = useState<Result<NewVacationPageData, Problem>>(() =>
    Res.fromSerial<NewVacationPageData, Problem>(initial),
  );
  const data = useContent(contentResult, {
    defaultContent: initial,
    loader,
    empty,
    notFound: 'Vacation data not found',
    loaderDelay: 1500,
  });

  // Early return if no data
  if (data == null) return null;

  const { vacations, userId } = data;

  // Helper to parse date from API format (dd-MM-yyyy)
  const parseDateFromApi = (dateStr: string | null | undefined): Date | null => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('-');
    return new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day));
  };

  // Function to check if a date should be disabled
  const isDateDisabled = (date: Date): boolean | DisabledDateType => {
    // Disable past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    if (checkDate < today) return 'past';

    // Check if date overlaps with any existing vacation
    const hasOverlap = vacations.some(vacation => {
      const start = parseDateFromApi(vacation.startDate);
      const end = parseDateFromApi(vacation.endDate);
      if (!start || !end) return false;

      try {
        return isWithinInterval(date, { start, end });
      } catch {
        return false;
      }
    });

    if (hasOverlap) return 'overlap';
    return false;
  };

  // Function to check if a date range contains any disabled dates
  const isRangeValid = (range: DateRange | undefined): boolean => {
    if (!range?.from || !range?.to) return true;

    // Normalize dates for accurate comparison
    const fromDate = new Date(range.from);
    fromDate.setHours(0, 0, 0, 0);
    const toDate = new Date(range.to);
    toDate.setHours(0, 0, 0, 0);

    // Check 60-day limit (inclusive counting)
    const daysDiff = Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (daysDiff > 60) {
      return false;
    }

    // Check each day in the range
    const currentDate = new Date(fromDate);
    while (currentDate <= toDate) {
      const disabled = isDateDisabled(currentDate);
      if (disabled !== false) {
        return false;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return true;
  };

  // Handle date range change with validation
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setRangeError(null);

    // If we have a complete range, validate it
    if (range?.from && range?.to) {
      // Normalize dates for accurate comparison
      const fromDate = new Date(range.from);
      fromDate.setHours(0, 0, 0, 0);
      const toDate = new Date(range.to);
      toDate.setHours(0, 0, 0, 0);

      // Calculate days inclusive
      const daysDiff = Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      if (daysDiff > 60) {
        setRangeError('Vacation cannot exceed 60 days. Please select a shorter range.');
        setDateRange(undefined);
        return;
      }
      if (!isRangeValid(range)) {
        setRangeError('Selected range contains unavailable dates. Please select a different range.');
        setDateRange(undefined);
        return;
      }
    }

    setDateRange(range);
  };

  // Handle start vacation
  const handleStartVacation = async () => {
    if (!userId || !dateRange?.from || !dateRange?.to) return;

    track(TrackingEvents.App.Vacation.Start.Clicked);

    // Convert Date to dd-MM-yyyy format for API
    const formatDateForApi = (date: Date): string => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };

    setBusyVacation(true);
    const res = await api.alcohol.zinc.api.vVacationCreate(
      { version: '1.0', userId },
      {
        startDate: formatDateForApi(dateRange.from),
        endDate: formatDateForApi(dateRange.to),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    );
    await res.match({
      ok: async () => {
        track(TrackingEvents.App.Vacation.Start.Success);
        setToast('Vacation started! 🏖️');
        // Redirect to vacations page
        await router.push('/app/vacations');
      },
      err: (problem: Problem) => {
        track(TrackingEvents.App.Vacation.Start.Error);
        problemReporter.pushError(new Error(problem.title || problem.type || 'Problem'), {
          source: 'app/vacation/start',
          problem,
        });
        setBusyVacation(false);
      },
    });
  };

  return (
    <>
      <Head>
        <title>LazyTax — Start Vacation</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="container mx-auto max-w-3xl px-4 pt-3 pb-8">
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm" className="mb-4">
            <Link href="/app/vacations">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Vacations
            </Link>
          </Button>

          <h1 className="text-2xl font-bold">Start a Vacation</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Select your vacation dates. All your habits will be paused during this period.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palmtree className="h-5 w-5 text-yellow-600" />
              Vacation Dates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-2 block">Select Date Range</div>
                <DateRangePicker
                  value={dateRange}
                  onChange={handleDateRangeChange}
                  disabled={isDateDisabled}
                  placeholder="Select vacation dates"
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Dates that overlap with existing vacations are disabled.
                </p>
              </div>

              {rangeError && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                  {rangeError}
                </div>
              )}

              {dateRange?.from && dateRange?.to && (
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-2">
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    <p>
                      <strong>Duration:</strong>{' '}
                      {(() => {
                        const from = new Date(dateRange.from);
                        from.setHours(0, 0, 0, 0);
                        const to = new Date(dateRange.to);
                        to.setHours(0, 0, 0, 0);
                        return Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                      })()}{' '}
                      days
                    </p>
                    <p className="mt-1">
                      <strong>Timezone:</strong> {Intl.DateTimeFormat().resolvedOptions().timeZone}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button asChild variant="outline" className="w-full sm:w-auto" disabled={busyVacation}>
                <Link href="/app/vacations">Cancel</Link>
              </Button>
              <Button
                onClick={handleStartVacation}
                disabled={busyVacation || !dateRange?.from || !dateRange?.to}
                className="w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                <Palmtree className="h-4 w-4 mr-2" />
                {busyVacation ? 'Scheduling...' : 'Schedule Vacation'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}

export const getServerSideProps = withServerSideAtomi(
  { ...buildTime, guard: 'private' },
  async (_, { apiTree }): Promise<GetServerSidePropsResult<NewVacationPageProps>> => {
    const api = apiTree.alcohol.zinc.api;

    // Get userId and fetch vacations
    const userIdResult = await api.vUserMeList({ version: '1.0' }, { format: 'text' });
    const vacationsResult = await userIdResult.andThen(async userId => {
      const vacations = await api.vVacationDetail({ userId, version: '1.0', Year: new Date().getFullYear() });
      return vacations.map(vacations => ({
        vacations,
        userId,
      }));
    });

    return {
      props: {
        initial: await vacationsResult.serial(),
      },
    };
  },
);
