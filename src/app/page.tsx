import Link from "next/link";
import { Scale, Shield, Users, FileText, Lock, ArrowRight, CheckCircle, Star } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#faf9f6]">
      {/* Nav */}
      <nav className="border-b border-ink-100 bg-white/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-amber-500 flex items-center justify-center">
              <Scale className="h-4 w-4 text-white" />
            </div>
            <span className="font-serif text-base font-semibold text-ink-900">
              Digitaal Nalatenschapsdossier
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-ink-600 hover:text-ink-900 transition-colors px-3 py-1.5">
              Inloggen
            </Link>
            <Link
              href="/register"
              className="bg-ink-900 text-white text-sm px-4 py-2 rounded-lg hover:bg-ink-800 transition-colors"
            >
              Account aanmaken
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 text-xs text-amber-700 font-medium mb-6">
            <Scale className="h-3 w-3" />
            Ontworpen voor de Nederlandse juridische context
          </div>
          <h1 className="font-serif text-5xl md:text-6xl font-bold text-ink-950 leading-[1.1] tracking-tight mb-6">
            Uw digitale erfenis,<br />
            <span className="text-amber-600 italic">veilig geregeld</span>
          </h1>
          <p className="text-lg text-ink-600 leading-relaxed mb-8 max-w-2xl">
            Een digitaal nalatenschapsdossier voor uw digitale bezittingen.
            Beheer toegangsgegevens en instructies, zodat erfgenamen na uw overlijden,
            onder notarieel toezicht, de juiste informatie ontvangen.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-ink-900 text-white px-6 py-3 rounded-lg hover:bg-ink-800 transition-colors text-sm font-medium"
            >
              Begin vandaag <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 border border-ink-200 text-ink-700 px-6 py-3 rounded-lg hover:bg-ink-50 transition-colors text-sm font-medium"
            >
              Ik ben notaris
            </Link>
          </div>
        </div>
      </section>

      {/* Legal disclaimer banner */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <div className="legal-banner rounded-xl p-5 flex gap-4">
          <Shield className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-900 mb-1">
              Dit dossier vervangt geen testament
            </p>
            <p className="text-sm text-amber-800 leading-relaxed">
              Het Digitaal Nalatenschapsdossier is een aanvulling op uw testament en staat altijd onder
              toezicht van een erkende Nederlandse notaris. Informatie wordt uitsluitend vrijgegeven na
              verificatie van het overlijden en goedkeuring door uw aangestelde notaris, overeenkomstig
              de bepalingen van de verklaring van erfrecht.
            </p>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <h2 className="font-serif text-2xl font-semibold text-ink-900 mb-8">Alles op één plek</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            {
              icon: FileText,
              title: "Digitale bezittingen registreren",
              desc: "Leg al uw digitale accounts, cryptowallets, domeinnamen en abonnementen vast met toegangsinstructies voor erfgenamen.",
            },
            {
              icon: Users,
              title: "Erfgenamen aanwijzen",
              desc: "Wijs specifieke bezittingen toe aan erfgenamen en voeg persoonlijke instructies toe per activum.",
            },
            {
              icon: Scale,
              title: "Notarieel toezicht",
              desc: "Uw aangestelde notaris beheert het vrijgaveproces en zorgt voor juridisch correcte overdracht.",
            },
            {
              icon: Lock,
              title: "Beveiligde opslag",
              desc: "Uw gegevens worden versleuteld opgeslagen. Gevoelige notities zijn extra afgeschermd en pas vrijgegeven na notariële goedkeuring.",
            },
            {
              icon: Shield,
              title: "AVG-conform",
              desc: "Volledig in lijn met de Algemene Verordening Gegevensbescherming (AVG). U behoudt altijd de controle over uw persoonsgegevens.",
            },
            {
              icon: CheckCircle,
              title: "Audit trail",
              desc: "Elke handeling wordt geregistreerd in een onveranderlijk auditlog, voor transparantie en rechtszekerheid.",
            },
          ].map((f, i) => (
            <div key={i} className="bg-white border border-ink-100 rounded-xl p-5 shadow-card">
              <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center mb-3">
                <f.icon className="h-4.5 w-4.5 text-amber-600" />
              </div>
              <h3 className="font-semibold text-ink-900 text-sm mb-2">{f.title}</h3>
              <p className="text-xs text-ink-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-ink-950 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-serif text-2xl font-semibold text-white mb-3">Hoe werkt het?</h2>
          <p className="text-ink-400 text-sm mb-10 max-w-xl">
            Vier stappen naar een geregelde digitale nalatenschap onder notarieel toezicht.
          </p>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Dossier aanmaken", desc: "Maak een account aan en stel uw digitale nalatenschapsdossier in." },
              { step: "02", title: "Bezittingen vastleggen", desc: "Registreer al uw digitale bezittingen met instructies en wijs erfgenamen toe." },
              { step: "03", title: "Notaris koppelen", desc: "Koppel uw aangestelde Nederlandse notaris aan het dossier." },
              { step: "04", title: "Vrijgaveproces", desc: "Na overlijden meldt de notaris dit en beheert de vrijgave aan erfgenamen." },
            ].map((s) => (
              <div key={s.step}>
                <p className="font-serif text-3xl text-amber-500/30 font-bold mb-3">{s.step}</p>
                <h3 className="text-white text-sm font-semibold mb-2">{s.title}</h3>
                <p className="text-ink-400 text-xs leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ink-100 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-amber-500 flex items-center justify-center">
              <Scale className="h-3 w-3 text-white" />
            </div>
            <span className="text-xs text-ink-500">Digitaal Nalatenschapsdossier — MVP v0.1</span>
          </div>
          <div className="flex gap-5 text-xs text-ink-400">
            <span>AVG-conform</span>
            <span>•</span>
            <span>Notarieel toezicht</span>
            <span>•</span>
            <span>Made in Nederland</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
