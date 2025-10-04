export default function References() {
  const references = [
    {
      id: 1,
      text: 'Lally, P., van Jaarsveld, C. H. M., Potts, H. W. W., & Wardle, J. (2010). How are habits formed: Modelling habit formation in the real world. European Journal of Social Psychology, 40(6), 998-1009.',
      url: 'https://onlinelibrary.wiley.com/doi/abs/10.1002/ejsp.674',
    },
    {
      id: 2,
      text: 'Matthews, G. (2015). Goals Research Summary. Psychology Department, Dominican University of California.',
      url: 'https://scholar.dominican.edu/psychology-faculty-conference-presentations/3/',
    },
    {
      id: 3,
      text: 'Precision Nutrition. (n.d.). Fitness success secrets: On practicing one strategic habit at a time. Based on 30,000+ client case studies.',
      url: 'https://www.precisionnutrition.com/one-habit',
    },
    {
      id: 4,
      text: 'Fogg, B. J. (2020). Tiny Habits: The Small Changes That Change Everything. Houghton Mifflin Harcourt. Based on 20+ years of research at Stanford University.',
      url: 'https://tinyhabits.com/',
    },
    {
      id: 5,
      text: 'Halpern, S. D., et al. (2015). Randomized Trial of Four Financial-Incentive Programs for Smoking Cessation. New England Journal of Medicine, 372, 2108-2117.',
      url: 'https://www.nejm.org/doi/full/10.1056/NEJMoa1414293',
    },
    {
      id: 6,
      text: 'Gottman, J. M., & Levenson, R. W. (2000). The Timing of Divorce: Predicting When a Couple Will Divorce Over a 14-Year Period. Journal of Marriage and Family, 62(3), 737-745.',
      url: 'https://www.gottman.com/blog/the-magic-relationship-ratio-according-science/',
    },
  ];

  return (
    <section id="references" className="py-8 sm:py-10 bg-slate-50/50 dark:bg-slate-900/50" data-reveal>
      <div className="container mx-auto px-4 max-w-5xl">
        <h2 className="font-heading text-lg sm:text-xl font-bold text-slate-900 dark:text-white text-center md:text-left">
          References
        </h2>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 text-center md:text-left">
          All claims are backed by peer-reviewed research and published studies.
        </p>
        <ol className="mt-4 space-y-2">
          {references.map(ref => (
            <li key={ref.id} id={`ref-${ref.id}`} className="text-slate-700 dark:text-slate-300 text-xs">
              <span className="font-semibold text-slate-900 dark:text-white">[{ref.id}]</span> {ref.text}{' '}
              <a
                href={ref.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-600 dark:text-violet-400 hover:underline"
              >
                View source
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
