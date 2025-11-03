import { useState } from 'react';
import type { GetServerSidePropsResult } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import { buildTime } from '@/adapters/external/core';
import { withServerSideAtomi } from '@/adapters/atomi/next';
import { useSwaggerClients } from '@/adapters/external/Provider';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { VacationRes } from '@/clients/alcohol/zinc/api';
import { ArrowLeft, CalendarX, Palmtree, Plus } from 'lucide-react';
import { useProblemReporter } from '@/adapters/problem-reporter/providers/hooks';
import { useErrorHandler } from '@/lib/content/providers/useErrorHandler';
import type { Problem } from '@/lib/problem/core';
import { Res, type Result, type ResultSerial } from '@/lib/monads/result';
import { useContent } from '@/lib/content/providers/useContent';
import { useFreeLoader } from '@/lib/content/providers/useFreeLoader';
import { useFreeEmpty } from '@/lib/content/providers/useFreeEmpty';
import { FreeContentManager } from '@/lib/content/components/FreeContentManager';
import Toast from '@/components/Toast';

type VacationsPageData = {
  vacations: VacationRes[];
  userId: string;
};

type VacationsPageProps = { initial: ResultSerial<VacationsPageData, Problem> };

export default function VacationsPage({ initial }: VacationsPageProps) {
  const api = useSwaggerClients();
  const problemReporter = useProblemReporter();
  const errorHandler = useErrorHandler();

  // State management
  const [loading, loader] = useFreeLoader();
  const [desc, empty] = useFreeEmpty();
  const [busyVacation, setBusyVacation] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Content management with Result monad
  const [contentResult, setContentResult] = useState<Result<VacationsPageData, Problem>>(() =>
    Res.fromSerial<VacationsPageData, Problem>(initial),
  );
  const data = useContent(contentResult, {
    defaultContent: initial,
    loader,
    empty,
    notFound: 'No vacations found',
    loaderDelay: 2000,
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

  // Helper to format date in short form (e.g., "30th October 2025")
  const formatDateShort = (date: Date | null): string => {
    if (!date) return '';
    const day = date.getDate();
    const daySuffix =
      day === 1 || day === 21 || day === 31
        ? 'st'
        : day === 2 || day === 22
          ? 'nd'
          : day === 3 || day === 23
            ? 'rd'
            : 'th';
    const monthNames = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return `${day}${daySuffix} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Check if a vacation is current, past, or future
  const getVacationStatus = (vacation: VacationRes): 'current' | 'past' | 'future' => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = parseDateFromApi(vacation.startDate);
    const end = parseDateFromApi(vacation.endDate);

    if (!start || !end) return 'future';

    if (today >= start && today <= end) return 'current';
    if (today > end) return 'past';
    return 'future';
  };

  // Refresh vacations data
  const refreshVacations = async (): Promise<void> => {
    if (!userId) return;
    const promise = api.alcohol.zinc.api.vVacationDetail({
      version: '1.0',
      userId,
      Year: new Date().getFullYear(),
    });
    setContentResult(
      Res.fromAsync(
        promise.then(result =>
          result.map(vacations => ({
            vacations,
            userId,
          })),
        ),
      ),
    );
  };

  // Handle end vacation
  const handleEndVacation = async (vacationId: string) => {
    if (!userId) return;

    // Get the vacation to update
    const vacation = vacations.find(v => v.id === vacationId);
    if (!vacation) return;

    // Format yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const formatDateForApi = (date: Date): string => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };

    setBusyVacation(true);
    const res = await api.alcohol.zinc.api.vVacationUpdate(
      { version: '1.0', userId, id: vacationId },
      {
        startDate: vacation.startDate || '',
        endDate: formatDateForApi(yesterday),
      },
    );
    await res.match({
      ok: async () => {
        setToast('Vacation ended! Welcome back! 👋');
        await refreshVacations();
      },
      err: (problem: Problem) => {
        problemReporter.pushError(new Error(problem.title || problem.type || 'Problem'), {
          source: 'app/vacation/end',
          problem,
        });
        errorHandler.throwProblem(problem);
      },
    });
    setBusyVacation(false);
  };

  // Handle delete vacation
  const handleDeleteVacation = async (vacationId: string) => {
    if (!userId) return;
    if (!confirm('Are you sure you want to delete this vacation?')) return;

    setBusyVacation(true);
    const res = await api.alcohol.zinc.api.vVacationDelete({
      version: '1.0',
      userId,
      id: vacationId,
    });

    await res.match({
      ok: async () => {
        setToast('Vacation deleted successfully!');
        await refreshVacations();
      },
      err: (problem: Problem) => {
        problemReporter.pushError(new Error(problem.title || problem.type || 'Problem'), {
          source: 'app/vacation/delete',
          problem,
        });
        errorHandler.throwProblem(problem);
      },
    });
    setBusyVacation(false);
  };

  // Group vacations by status
  const currentVacations = vacations.filter(v => getVacationStatus(v) === 'current');
  const upcomingVacations = vacations.filter(v => getVacationStatus(v) === 'future');
  const pastVacations = vacations.filter(v => getVacationStatus(v) === 'past');

  return (
    <>
      <Head>
        <title>LazyTax — Vacations</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="container mx-auto max-w-5xl px-4 pt-3 pb-8 space-y-4">
        {/* Header */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon">
              <Link href="/app">
                <ArrowLeft className="h-5 w-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-xl font-semibold">Your Vacations</h1>
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                Manage your vacation time and take a break from habits.
              </p>
            </div>
          </div>
          <Button
            asChild
            className="w-full md:w-auto bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
          >
            <Link href="/app/vacations/new">
              <Plus className="h-4 w-4 mr-2" />
              New Vacation
            </Link>
          </Button>
        </div>

        <FreeContentManager
          LoadingComponent={() => (
            <div className="grid gap-3">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardContent className="pt-4">
                    <div className="h-4 w-40 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                    <div className="mt-2 h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          EmptyComponent={({ desc }) => (
            <div className="min-h-[40vh] flex flex-col items-center justify-center text-center space-y-4 py-6">
              <CalendarX className="h-16 w-16 text-slate-300 dark:text-slate-700" />
              <p className="text-slate-700 dark:text-slate-300 text-lg font-medium">
                {desc ?? 'No vacations scheduled yet'}
              </p>
              <Button asChild className="mt-2">
                <Link href="/app/vacations/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Your First Vacation
                </Link>
              </Button>
            </div>
          )}
          loadingState={loading}
          emptyState={desc || (vacations.length === 0 ? 'No vacations yet' : undefined)}
        >
          <div className="space-y-6">
            {/* Current Vacations */}
            {currentVacations.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Palmtree className="h-5 w-5 text-yellow-600" />
                  Current Vacation
                </h2>
                {currentVacations.map(vacation => {
                  const startDate = parseDateFromApi(vacation.startDate);
                  const endDate = parseDateFromApi(vacation.endDate);
                  const daysRemaining = endDate
                    ? Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
                    : 0;

                  // Check if today is the start date
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const isStartDateToday =
                    startDate &&
                    startDate.getFullYear() === today.getFullYear() &&
                    startDate.getMonth() === today.getMonth() &&
                    startDate.getDate() === today.getDate();

                  return (
                    <Card key={vacation.id} className="border-2 border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20">
                      <CardContent className="pt-4">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Palmtree className="h-5 w-5 text-yellow-600" />
                              <Badge className="bg-yellow-600 text-white">Current</Badge>
                            </div>
                            <div className="text-sm space-y-1">
                              <div className="flex gap-2 items-center">
                                <span className="font-medium">Start:</span>
                                <span>{formatDateShort(startDate) || vacation.startDate}</span>
                              </div>
                              <div className="flex gap-2 items-center">
                                <span className="font-medium">End:</span>
                                <span>{formatDateShort(endDate) || vacation.endDate}</span>
                              </div>
                              {vacation.timezone && (
                                <div className="flex gap-2 items-center text-xs text-slate-500 dark:text-slate-400">
                                  <span className="font-medium">Timezone:</span>
                                  <span>{vacation.timezone}</span>
                                </div>
                              )}
                              {daysRemaining > 0 && (
                                <div className="text-yellow-700 dark:text-yellow-400 font-semibold">
                                  {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
                                </div>
                              )}
                            </div>
                          </div>
                          {vacation.id && (
                            <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
                              <Button asChild variant="outline" size="sm" className="flex-1 md:flex-none md:w-full">
                                <Link href={`/app/vacations/${vacation.id}/edit`}>Change End Date</Link>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEndVacation(vacation.id as string)}
                                disabled={busyVacation || (isStartDateToday ?? false)}
                                title={
                                  isStartDateToday
                                    ? 'Cannot end vacation on the same day it starts'
                                    : 'End vacation today'
                                }
                                className="flex-1 md:flex-none md:w-full"
                              >
                                End Early
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Upcoming Vacations */}
            {upcomingVacations.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <CalendarX className="h-5 w-5 text-blue-600" />
                  Upcoming
                </h2>
                {upcomingVacations.map(vacation => {
                  const startDate = parseDateFromApi(vacation.startDate);
                  const endDate = parseDateFromApi(vacation.endDate);

                  return (
                    <Card key={vacation.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Palmtree className="h-5 w-5 text-slate-500" />
                              <Badge className="bg-blue-600 text-white">Upcoming</Badge>
                            </div>
                            <div className="text-sm space-y-1">
                              <div className="flex gap-2 items-center">
                                <span className="font-medium">Start:</span>
                                <span>{formatDateShort(startDate) || vacation.startDate}</span>
                              </div>
                              <div className="flex gap-2 items-center">
                                <span className="font-medium">End:</span>
                                <span>{formatDateShort(endDate) || vacation.endDate}</span>
                              </div>
                              {vacation.timezone && (
                                <div className="flex gap-2 items-center text-xs text-slate-500 dark:text-slate-400">
                                  <span className="font-medium">Timezone:</span>
                                  <span>{vacation.timezone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          {vacation.id && (
                            <div className="flex flex-col gap-2">
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/app/vacations/${vacation.id}/edit`}>Edit</Link>
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteVacation(vacation.id as string)}
                                disabled={busyVacation}
                              >
                                Delete
                              </Button>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Past Vacations */}
            {pastVacations.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-500">
                  <CalendarX className="h-5 w-5" />
                  Past
                </h2>
                {pastVacations.map(vacation => {
                  const startDate = parseDateFromApi(vacation.startDate);
                  const endDate = parseDateFromApi(vacation.endDate);

                  return (
                    <Card key={vacation.id} className="opacity-60">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <Palmtree className="h-5 w-5 text-slate-500" />
                              <Badge variant="outline">Past</Badge>
                            </div>
                            <div className="text-sm space-y-1">
                              <div className="flex gap-2 items-center">
                                <span className="font-medium">Start:</span>
                                <span>{formatDateShort(startDate) || vacation.startDate}</span>
                              </div>
                              <div className="flex gap-2 items-center">
                                <span className="font-medium">End:</span>
                                <span>{formatDateShort(endDate) || vacation.endDate}</span>
                              </div>
                              {vacation.timezone && (
                                <div className="flex gap-2 items-center text-xs text-slate-500 dark:text-slate-400">
                                  <span className="font-medium">Timezone:</span>
                                  <span>{vacation.timezone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </FreeContentManager>
      </div>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </>
  );
}

export const getServerSideProps = withServerSideAtomi(
  { ...buildTime, guard: 'private' },
  async (_, { apiTree }): Promise<GetServerSidePropsResult<VacationsPageProps>> => {
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
