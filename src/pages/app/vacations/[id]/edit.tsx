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
import { Calendar } from '@/components/ui/calendar';
import { DateRangePicker, type DisabledDateType } from '@/components/ui/date-range-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { DateRange } from 'react-day-picker';
import { isWithinInterval } from 'date-fns';
import { ArrowLeft, CalendarIcon, Palmtree, Trash2 } from 'lucide-react';
import { useProblemReporter } from '@/adapters/problem-reporter/providers/hooks';
import type { Problem } from '@/lib/problem/core';
import type { VacationRes } from '@/clients/alcohol/zinc/api';
import { Res, type Result, type ResultSerial } from '@/lib/monads/result';
import { useContent } from '@/lib/content/providers/useContent';
import { useFreeLoader } from '@/lib/content/providers/useFreeLoader';
import { useFreeEmpty } from '@/lib/content/providers/useFreeEmpty';
import Toast from '@/components/Toast';
import { usePlausible } from '@/lib/tracker/usePlausible';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type EditVacationPageData = {
  vacation: VacationRes;
  userId: string;
  allVacations: VacationRes[];
};

type EditVacationPageProps = { initial: ResultSerial<EditVacationPageData, Problem> };

export default function EditVacationPage({ initial }: EditVacationPageProps) {
  const router = useRouter();
  const api = useSwaggerClients();
  const problemReporter = useProblemReporter();

  // State management - must be before early return
  const [newEndDate, setNewEndDate] = useState<Date | undefined>();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Content management
  const [loading, loader] = useFreeLoader();
  const [desc, empty] = useFreeEmpty();
  const [contentResult, setContentResult] = useState<Result<EditVacationPageData, Problem>>(() =>
    Res.fromSerial<EditVacationPageData, Problem>(initial),
  );
  const data = useContent(contentResult, {
    defaultContent: initial,
    loader,
    empty,
    notFound: 'Vacation not found',
    loaderDelay: 1500,
  });

  // Early return if no data
  if (data == null) return null;

  const { vacation, userId, allVacations } = data;

  // Helper to parse date from API format (dd-MM-yyyy)
  const parseDateFromApi = (dateStr: string | null | undefined): Date | null => {
    if (!dateStr) return null;
    const [day, month, year] = dateStr.split('-');
    return new Date(Number.parseInt(year), Number.parseInt(month) - 1, Number.parseInt(day));
  };

  // Format date for API (dd-MM-yyyy)
  const formatDateForApi = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const startDate = parseDateFromApi(vacation.startDate);
  const endDate = parseDateFromApi(vacation.endDate);

  if (!startDate || !endDate) return null;

  // Get today in the vacation's timezone
  const getTodayInVacationTimezone = (): Date => {
    const now = new Date();
    if (vacation.timezone) {
      // Convert current time to vacation timezone
      const tzDate = new Date(now.toLocaleString('en-US', { timeZone: vacation.timezone }));
      tzDate.setHours(0, 0, 0, 0);
      return tzDate;
    }
    // Fallback to local timezone
    const localToday = new Date();
    localToday.setHours(0, 0, 0, 0);
    return localToday;
  };

  const today = getTodayInVacationTimezone();

  // Determine vacation status
  const isInProgress = today >= startDate && today <= endDate;
  const isFuture = today < startDate;
  const isEnded = today > endDate;

  // Validation for CURRENT vacation (end date only)
  const isEndDateDisabled = (date: Date): boolean => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    // Get yesterday in vacation timezone
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get start date for comparison
    const startDateNormalized = new Date(startDate);
    startDateNormalized.setHours(0, 0, 0, 0);

    // Calculate max end date: start + 59 days = 60 days total (inclusive)
    const maxEnd = new Date(startDate);
    maxEnd.setDate(maxEnd.getDate() + 59);

    // Must be >= yesterday, >= start date, and <= 60 days from start
    if (checkDate < yesterday || checkDate < startDateNormalized || checkDate > maxEnd) return true;

    // Exclude original end date
    if (checkDate.getTime() === endDate.getTime()) return true;

    return false;
  };

  // Validation for FUTURE vacation (both dates)
  const isDateRangeDisabled = (date: Date): boolean | DisabledDateType => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    // Disable today and past dates (must be after today in vacation timezone)
    if (checkDate <= today) return 'past';

    // Check if date overlaps with other vacations (excluding current one)
    const otherVacations = allVacations.filter(v => v.id !== vacation.id);
    const hasOverlap = otherVacations.some(v => {
      const vStart = parseDateFromApi(v.startDate);
      const vEnd = parseDateFromApi(v.endDate);
      if (!vStart || !vEnd) return false;

      try {
        return isWithinInterval(date, { start: vStart, end: vEnd });
      } catch {
        return false;
      }
    });

    if (hasOverlap) return 'overlap';
    return false;
  };

  // Client-side validation for future vacation date range
  const validateFutureDateRange = (range: DateRange | undefined): string | null => {
    if (!range?.from || !range?.to) return null;

    const fromDate = new Date(range.from);
    fromDate.setHours(0, 0, 0, 0);
    const toDate = new Date(range.to);
    toDate.setHours(0, 0, 0, 0);

    // Check if start date is today or before
    if (fromDate <= today) {
      return 'Start date must be after today';
    }

    // Check if end date is today or before
    if (toDate <= today) {
      return 'End date must be after today';
    }

    // Check 60-day limit (inclusive)
    const daysDiff = Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    if (daysDiff > 60) {
      return 'Vacation cannot exceed 60 days';
    }

    // Check for overlaps with other vacations
    const otherVacations = allVacations.filter(v => v.id !== vacation.id);
    for (const v of otherVacations) {
      const vStart = parseDateFromApi(v.startDate);
      const vEnd = parseDateFromApi(v.endDate);
      if (!vStart || !vEnd) continue;

      // Check if ranges overlap
      if (fromDate <= vEnd && toDate >= vStart) {
        return 'Selected dates overlap with another vacation';
      }
    }

    return null;
  };

  // Client-side validation for current vacation end date
  const validateCurrentEndDate = (date: Date | undefined): string | null => {
    if (!date) return null;

    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    // Get yesterday in vacation timezone
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Get start date for comparison
    const startDateNormalized = new Date(startDate);
    startDateNormalized.setHours(0, 0, 0, 0);

    // Check minimum (yesterday)
    if (checkDate < yesterday) {
      return 'End date cannot be before yesterday';
    }

    // Check that end date is at least the start date
    if (checkDate < startDateNormalized) {
      return 'End date cannot be before the start date';
    }

    // Calculate max end date: start + 59 days = 60 days total (inclusive)
    const maxEnd = new Date(startDate);
    maxEnd.setDate(maxEnd.getDate() + 59);

    // Check maximum (60 days from start)
    if (checkDate > maxEnd) {
      return 'End date cannot be more than 60 days from start date';
    }

    // Check if same as current end date
    if (checkDate.getTime() === endDate.getTime()) {
      return 'Please select a different end date';
    }

    return null;
  };

  // Handler for future vacation date range change
  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    const error = validateFutureDateRange(range);
    setValidationError(error);
  };

  // Handler for current vacation end date change
  const handleEndDateChange = (date: Date | undefined) => {
    setNewEndDate(date);
    const error = validateCurrentEndDate(date);
    setValidationError(error);
  };

  const handleUpdate = async () => {
    if (!userId || !vacation.id) return;

    // Check for validation errors
    if (validationError) {
      setError(validationError);
      return;
    }

    // Validation based on vacation type
    if (isInProgress && !newEndDate) {
      setError('Please select a new end date');
      return;
    }

    if (isFuture && (!dateRange?.from || !dateRange?.to)) {
      setError('Please select both start and end dates');
      return;
    }

    setError(null);
    setBusy(true);

    const res = await api.alcohol.zinc.api.vVacationUpdate(
      { version: '1.0', userId, id: vacation.id },
      {
        startDate: isFuture && dateRange?.from ? formatDateForApi(dateRange.from) : vacation.startDate || '',
        endDate:
          isFuture && dateRange?.to
            ? formatDateForApi(dateRange.to)
            : newEndDate
              ? formatDateForApi(newEndDate)
              : vacation.endDate || '',
      },
    );

    await res.match({
      ok: async () => {
        setToast('Vacation updated successfully!');
        await router.push('/app/vacations');
      },
      err: (problem: Problem) => {
        problemReporter.pushError(new Error(problem.title || problem.type || 'Problem'), {
          source: 'app/vacation/update',
          problem,
        });
        setError(problem.title || 'Failed to update vacation');
        setBusy(false);
      },
    });
  };

  const handleDelete = async () => {
    if (!userId || !vacation.id) return;
    if (!confirm('Are you sure you want to delete this vacation?')) return;

    setBusy(true);
    const res = await api.alcohol.zinc.api.vVacationDelete({
      version: '1.0',
      userId,
      id: vacation.id,
    });

    await res.match({
      ok: async () => {
        setToast('Vacation deleted successfully!');
        await router.push('/app/vacations');
      },
      err: (problem: Problem) => {
        problemReporter.pushError(new Error(problem.title || problem.type || 'Problem'), {
          source: 'app/vacation/delete',
          problem,
        });
        setError(problem.title || 'Failed to delete vacation');
        setBusy(false);
      },
    });
  };

  if (isEnded) {
    return (
      <>
        <Head>
          <title>LazyTax — Edit Vacation</title>
          <meta name="robots" content="noindex" />
        </Head>
        <div className="container mx-auto max-w-3xl px-4 pt-3 pb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-slate-600 dark:text-slate-400">This vacation has ended and cannot be modified.</p>
              <Button asChild className="mt-4">
                <Link href="/app/vacations">Back to Vacations</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  // Render CURRENT vacation edit (end date only)
  if (isInProgress) {
    return (
      <>
        <Head>
          <title>LazyTax — Change Vacation End Date</title>
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

            <h1 className="text-2xl font-bold">Change Vacation End Date</h1>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
              Select a new end date for your ongoing vacation (yesterday to 60 days from start)
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palmtree className="h-5 w-5 text-yellow-600" />
                Current Vacation Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Start Date</p>
                    <p className="font-medium">{format(startDate, 'LLL dd, y')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Current End Date</p>
                    <p className="font-medium">{format(endDate, 'LLL dd, y')}</p>
                  </div>
                </div>
                {vacation.timezone && (
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Timezone: <span className="font-medium">{vacation.timezone}</span>
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-2 block">New End Date</div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full justify-start text-left font-normal',
                          !newEndDate && 'text-muted-foreground',
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {newEndDate ? format(newEndDate, 'LLL dd, y') : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={newEndDate}
                        onSelect={handleEndDateChange}
                        disabled={isEndDateDisabled}
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    You can only change the end date (yesterday to 60 days from start, max 60 days total). The start
                    date cannot be changed for ongoing vacations.
                  </p>
                </div>

                {(error || validationError) && (
                  <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                    {error || validationError}
                  </div>
                )}

                {newEndDate && (
                  <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      <strong>New Duration:</strong>{' '}
                      {(() => {
                        const from = new Date(startDate);
                        from.setHours(0, 0, 0, 0);
                        const to = new Date(newEndDate);
                        to.setHours(0, 0, 0, 0);
                        return Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                      })()}{' '}
                      days
                    </p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <Button
                  onClick={handleUpdate}
                  disabled={busy || !newEndDate || !!validationError}
                  className="w-full sm:flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
                >
                  <Palmtree className="h-4 w-4 mr-2" />
                  {busy ? 'Updating...' : 'Update Vacation'}
                </Button>
                <Button onClick={handleDelete} disabled={busy} variant="destructive" className="w-full sm:w-auto">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {toast && <Toast message={toast} onDone={() => setToast(null)} />}
      </>
    );
  }

  // Render FUTURE vacation edit (both dates)
  return (
    <>
      <Head>
        <title>LazyTax — Edit Vacation</title>
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

          <h1 className="text-2xl font-bold">Edit Future Vacation</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Select new dates for your future vacation (after today, max 60 days)
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palmtree className="h-5 w-5 text-yellow-600" />
              Vacation Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Current Start Date</p>
                  <p className="font-medium">{format(startDate, 'LLL dd, y')}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Current End Date</p>
                  <p className="font-medium">{format(endDate, 'LLL dd, y')}</p>
                </div>
              </div>
              {vacation.timezone && (
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Timezone: <span className="font-medium">{vacation.timezone}</span>
                </p>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium mb-2 block">Select New Dates</div>
                <DateRangePicker
                  value={dateRange}
                  onChange={handleDateRangeChange}
                  disabled={isDateRangeDisabled}
                  placeholder="Select vacation dates"
                  maxDays={60}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  Select both start and end dates. Dates must be after today and cannot overlap with other vacations.
                  Maximum duration is 60 days.
                </p>
              </div>

              {(error || validationError) && (
                <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md p-3">
                  {error || validationError}
                </div>
              )}

              {dateRange?.from && dateRange?.to && (
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    <strong>New Duration:</strong>{' '}
                    {(() => {
                      const from = new Date(dateRange.from);
                      from.setHours(0, 0, 0, 0);
                      const to = new Date(dateRange.to);
                      to.setHours(0, 0, 0, 0);
                      return Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    })()}{' '}
                    days
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
              <Button
                onClick={handleUpdate}
                disabled={busy || !dateRange?.from || !dateRange?.to || !!validationError}
                className="w-full sm:flex-1 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
              >
                <Palmtree className="h-4 w-4 mr-2" />
                {busy ? 'Updating...' : 'Update Vacation'}
              </Button>
              <Button onClick={handleDelete} disabled={busy} variant="destructive" className="w-full sm:w-auto">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
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
  async (ctx, { apiTree }): Promise<GetServerSidePropsResult<EditVacationPageProps>> => {
    const api = apiTree.alcohol.zinc.api;
    const vacationId = ctx.params?.id as string;

    if (!vacationId) {
      return { notFound: true };
    }

    // Get userId
    const userIdResult = await api.vUserMeList({ version: '1.0' }, { format: 'text' });
    const vacationResult = await userIdResult.andThen(async userId => {
      // Fetch all vacations for the year
      const vacationsRes = await api.vVacationDetail({ userId, version: '1.0', Year: new Date().getFullYear() });
      return vacationsRes.map(allVacations => {
        const vacation = allVacations.find(v => v.id === vacationId);
        if (!vacation) {
          throw new Error('Vacation not found');
        }
        return {
          vacation,
          userId,
          allVacations,
        };
      });
    });

    // Handle Result
    if (await vacationResult.isErr()) {
      return { notFound: true };
    }

    return {
      props: {
        initial: await vacationResult.serial(),
      },
    };
  },
);
