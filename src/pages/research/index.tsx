import Head from 'next/head';
import Link from 'next/link';
import ScrollReveal from '@/lib/animations/ScrollReveal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SignInCTA } from '@/components/ui/sign-in-cta';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

interface Reference {
  title: string;
  authors: string;
  citation: string;
  year: string;
  summary: string;
  doi?: string;
  href: string;
}

interface ReferenceSection {
  id: string;
  title: string;
  description: string;
  references: Reference[];
}

const referenceSections: ReferenceSection[] = [
  {
    id: 'habit-formation',
    title: 'Habit Formation Research',
    description: 'A longitudinal look at how repeated actions become automatic.',
    references: [
      {
        title: 'How are habits formed: Modelling habit formation in the real world',
        authors: 'Lally, P., van Jaarsveld, C. H. M., Potts, H. W. W., & Wardle, J.',
        citation: 'European Journal of Social Psychology, 40(6), 998–1009',
        year: '2010',
        summary:
          'Diary study tracking 96 adults over 12 weeks found that habit automaticity followed an asymptotic curve, with a median of 66 days (range 18–254) to reach 95% of its asymptote—confirming that consistency matters more than perfection.',
        doi: '10.1002/ejsp.674',
        href: 'https://onlinelibrary.wiley.com/doi/10.1002/ejsp.674',
      },
      {
        title: "Making health habitual: the psychology of 'habit-formation' and general practice",
        authors: 'Gardner, B., Lally, P., & Wardle, J.',
        citation: 'British Journal of General Practice, 62(605), 664–666',
        year: '2012',
        summary:
          'Clinical review synthesizing habit literature and recommending general practitioners prescribe small, context-cued behaviors repeatedly to help patients automate health routines.',
        doi: '10.3399/bjgp12X659466',
        href: 'https://bjgp.org/content/62/605/664',
      },
    ],
  },
  {
    id: 'goal-setting',
    title: 'Goal Setting & Accountability',
    description: 'Findings on why writing and sharing goals amplifies follow-through.',
    references: [
      {
        title: 'Goals Research Summary',
        authors: 'Matthews, G.',
        citation: 'Psychology Department, Dominican University of California',
        year: '2015',
        summary:
          'Report consolidating multiple goal-setting experiments showing that participants who documented goals and sent weekly updates to a friend achieved them at rates up to 76%, compared with 43% when goals were merely imagined.',
        href: 'https://scholar.dominican.edu/psychology-faculty-conference-presentations/3/',
      },
      {
        title: 'A Theory of Goal Setting & Task Performance',
        authors: 'Locke, E. A., & Latham, G. P.',
        citation: 'Upper Saddle River, NJ: Prentice Hall',
        year: '1990',
        summary:
          'Foundational text presenting goal-setting theory: specific, challenging goals combined with feedback and commitment mechanisms drive higher task performance than vague or easy goals, across hundreds of lab and field studies.',
        href: 'https://www.researchgate.net/publication/232501090_A_Theory_of_Goal_Setting_Task_Performance',
      },
    ],
  },
  {
    id: 'financial-incentives',
    title: 'Financial Incentives & Behavior Change',
    description: 'Clinical evidence on how monetary stakes influence adherence.',
    references: [
      {
        title: 'Randomized Trial of Four Financial-Incentive Programs for Smoking Cessation',
        authors: 'Halpern, S. D., et al.',
        citation: 'New England Journal of Medicine, 372, 2108–2117',
        year: '2015',
        summary:
          'Large-scale trial (n = 2,538) found that both individual and group-based financial incentives dramatically improved sustained smoking cessation, with deposit contracts producing the highest verified quit rates.',
        doi: '10.1056/NEJMoa1414293',
        href: 'https://www.nejm.org/doi/full/10.1056/NEJMoa1414293',
      },
    ],
  },
  {
    id: 'positive-reinforcement',
    title: 'Positive Reinforcement & Feedback Ratios',
    description: 'Evidence on how positive-to-negative feedback ratios shape behavior and performance.',
    references: [
      {
        title: "Effects of Middle School Teachers' Praise-to-Reprimand Ratios on Students' Classroom Behavior",
        authors: 'Caldarella, P., Larsen, R. A. A., Williams, L., & Wills, H. P.',
        citation: 'Journal of Positive Behavior Interventions, 25(1), 44–57',
        year: '2023',
        summary:
          'Research on 60+ middle school classrooms found that higher ratios of praise to reprimands significantly improved student on-task behavior. Classrooms with the highest praise-to-reprimand ratios saw on-task behavior increase by 60–70%, while disruptions were cut in half—demonstrating that balanced positive reinforcement drives sustained behavior change.',
        doi: '10.1177/10983007211035185',
        href: 'https://journals.sagepub.com/doi/10.1177/10983007211035185',
      },
      {
        title: "Evidence Review for Teacher Praise to Improve Students' Classroom Behavior",
        authors: 'Moore, T. C., Maggin, D. M., Thompson, K. M., Gordon, J. R., Daniels, S., & Lang, L. E.',
        citation: 'Journal of Positive Behavior Interventions, 21(1), 3–18',
        year: '2019',
        summary:
          'Systematic review of 16 studies examining behavior-specific praise in K-12 settings confirmed that positive reinforcement strategies consistently improve student engagement and reduce disruptive behaviors, supporting the principle that recognition and celebration are essential to lasting behavior change.',
        doi: '10.1177/1098300718766657',
        href: 'https://journals.sagepub.com/doi/10.1177/1098300718766657',
      },
    ],
  },
  {
    id: 'strategic-habits',
    title: 'Strategic Habit Building',
    description: 'Real-world coaching data on focused habit practice.',
    references: [
      {
        title: 'Fitness success secrets: On practicing one strategic habit at a time',
        authors: 'Precision Nutrition',
        citation: 'Based on 30,000+ client case studies',
        year: 'n.d.',
        summary:
          'Coaching analysis reporting that emphasizing a single high-leverage habit at any given time helped more than 30,000 clients progress steadily without overwhelm, highlighting the power of focus.',
        href: 'https://www.precisionnutrition.com/one-habit',
      },
    ],
  },
];

export default function ReferencesPage() {
  return (
    <>
      <Head>
        <title>LazyTax Research — Evidence Behind the Product</title>
        <meta
          name="description"
          content="Explore the longitudinal habit formation research that informs LazyTax's approach to building lasting routines."
        />
      </Head>
      <ScrollReveal />
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-violet-500/10 via-transparent to-orange-400/10" />
        <div className="container mx-auto px-6 sm:px-8 max-w-4xl text-center space-y-6">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white">
            Evidence that powers LazyTax
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto">
            We anchor LazyTax on longitudinal habit science. Dive into the landmark studies that explain how repetition,
            accountability, and positive reinforcement turn actions into lasting routines.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <SignInCTA
              size="lg"
              className="h-12 min-w-[220px] px-7 text-base font-semibold text-white bg-gradient-to-r from-orange-500 via-fuchsia-500 to-violet-600 hover:from-orange-600 hover:via-fuchsia-600 hover:to-violet-700 shadow-lg hover:shadow-xl ring-1 ring-white/20 dark:ring-white/10 rounded-xl transition-all"
            >
              Start building habits that stick
            </SignInCTA>
            <Button asChild size="lg" variant="secondary">
              <Link href="/why-lazytax">Why LazyTax</Link>
            </Button>
          </div>
          <nav aria-label="Reference categories" className="pt-6">
            <div className="flex flex-wrap justify-center gap-3">
              {referenceSections.map(section => (
                <Link
                  key={section.id}
                  href={`#${section.id}`}
                  className="group inline-flex items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-violet-500 hover:bg-violet-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 dark:border-slate-800/80 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-violet-400 dark:hover:bg-violet-500/10 dark:hover:text-white"
                >
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 rounded-full bg-violet-500 transition group-hover:bg-violet-600 dark:group-hover:bg-violet-400"
                  />
                  {section.title}
                </Link>
              ))}
            </div>
          </nav>
        </div>
      </section>
      {referenceSections.map(section => (
        <section key={section.id} id={section.id} className="py-12 sm:py-16 bg-white dark:bg-slate-950" data-reveal>
          <div className="container mx-auto px-6 sm:px-8 max-w-5xl space-y-10">
            <header className="space-y-4 text-center md:text-left">
              <Badge
                variant="outline"
                className="mx-auto md:mx-0 border-violet-400/60 text-violet-700 dark:border-violet-400/50 dark:text-violet-300"
              >
                {section.title}
              </Badge>
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">{section.title}</h2>
                <p className="text-base text-slate-600 dark:text-slate-300 max-w-3xl md:max-w-none md:text-lg">
                  {section.description}
                </p>
              </div>
            </header>
            <div className="grid gap-6 md:grid-cols-2">
              {section.references.map(reference => (
                <Card
                  key={reference.title}
                  className="h-full border-slate-200/70 bg-white/80 shadow-sm backdrop-blur-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800/70 dark:bg-slate-900/70"
                >
                  <CardHeader className="pb-5">
                    <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                      {reference.title}
                    </CardTitle>
                    <CardDescription className="text-sm text-slate-500 dark:text-slate-400">
                      {reference.authors}
                    </CardDescription>
                    <Badge
                      variant="secondary"
                      className="mt-3 w-fit bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-200"
                    >
                      {reference.year}
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{reference.citation}</p>
                    {reference.doi ? (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        DOI:{' '}
                        <a
                          href={`https://doi.org/${reference.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-violet-600 hover:underline dark:text-violet-300"
                        >
                          {reference.doi}
                        </a>
                      </p>
                    ) : null}
                    <p className="text-sm text-slate-600 dark:text-slate-300">{reference.summary}</p>
                  </CardContent>
                  <CardFooter className="border-t border-slate-200/70 px-6 pt-4 dark:border-slate-800/70">
                    <Link
                      href={reference.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-violet-600 hover:underline hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
                    >
                      View source
                      <span aria-hidden="true">→</span>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>
      ))}
      <section className="py-16 sm:py-20 bg-slate-50 dark:bg-slate-900" data-reveal>
        <div className="container mx-auto px-6 sm:px-8 max-w-4xl text-center space-y-6">
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 dark:text-white">
            Have questions about the research?
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            We love diving into the evidence. Reach out to our team for deeper summaries, methodology notes, or to
            collaborate on new studies that explore accountability-based habit building.
          </p>
          <Button asChild size="lg">
            <a href="mailto:hello@lazytax.club">Talk to the team</a>
          </Button>
        </div>
      </section>
    </>
  );
}
