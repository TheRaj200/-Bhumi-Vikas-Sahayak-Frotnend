import { AppHeader } from './components/AppHeader'
import { AskPage } from './features/ask/AskPage'
import { BenchmarkPage } from './features/benchmark/BenchmarkPage'
import { CaseReviewPage } from './features/cases/CaseReviewPage'
import { CasesPage } from './features/cases/CasesPage'
import { ReportPage } from './features/report/ReportPage'
import { RuleDetailPage } from './features/rulelab/RuleDetailPage'
import { RuleLabPage } from './features/rulelab/RuleLabPage'
import { UploadPage } from './features/upload/UploadPage'
import { LangProvider } from './i18n/LangProvider'
import { useHashRoute, type Route } from './lib/router'

function Page({ route }: { route: Route }) {
  switch (route.page) {
    case 'ask':
      return <AskPage />
    case 'cases':
      return <CasesPage />
    case 'case':
      return <CaseReviewPage id={route.id} />
    case 'report':
      return <ReportPage id={route.id} />
    case 'rule-lab':
      return <RuleLabPage />
    case 'rule':
      return <RuleDetailPage ruleId={route.ruleId} />
    case 'upload':
      return <UploadPage />
    case 'benchmark':
      return <BenchmarkPage />
  }
}

const App = () => {
  const route = useHashRoute()
  return (
    <LangProvider>
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <AppHeader route={route} />
        <main className="mx-auto max-w-7xl px-4 py-6">
          <Page route={route} />
        </main>
      </div>
    </LangProvider>
  )
}

export default App
