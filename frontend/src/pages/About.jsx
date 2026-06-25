export default function About() {
  return (
    <main data-testid="about-page" className="pt-32 pb-24">
      <section className="px-6 md:px-12 lg:px-24 max-w-5xl">
        <p className="overline opacity-60 mb-6">Our Maison</p>
        <h1 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight mb-10">
          Quiet luxury,<br/>made with intention.
        </h1>
        <p className="text-lg opacity-80 leading-relaxed max-w-2xl">
          SOPHIE was founded in 2014 in a quiet Parisian apartment. We design a small, edited wardrobe of timeless pieces — produced by ateliers we know by name in Florence, Como, and Porto.
        </p>
      </section>

      <section className="mt-20 grid md:grid-cols-2">
        <div className="aspect-[4/5]">
          <img src="https://images.pexels.com/photos/11911863/pexels-photo-11911863.jpeg?auto=compress&w=940" alt="Atelier" className="w-full h-full object-cover" />
        </div>
        <div className="flex items-center px-6 md:px-12 py-16 lg:py-20">
          <div className="max-w-md space-y-5">
            <p className="overline opacity-60">Craft</p>
            <h2 className="font-display text-3xl md:text-4xl tracking-tight">Less, but better.</h2>
            <p className="opacity-70 leading-relaxed">
              Every piece is finished by hand. Buttons hand-sewn. Seams pressed twice. We make fewer pieces, slowly — because the alternative is everything we'd rather not be.
            </p>
          </div>
        </div>
      </section>

      <section className="px-6 md:px-12 lg:px-24 py-24 grid md:grid-cols-3 gap-10">
        {[
          ["2014", "Founded in Paris by Sophie Marais."],
          ["50+", "Independent ateliers across Europe."],
          ["100%", "Of orders shipped carbon-neutral."],
        ].map(([n, d]) => (
          <div key={n}>
            <p className="font-display text-6xl mb-3">{n}</p>
            <p className="opacity-70 max-w-xs">{d}</p>
          </div>
        ))}
      </section>
    </main>
  );
}
