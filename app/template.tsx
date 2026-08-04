import { PageTransition } from '@frontend/components/PageTransition'

export default function Template({ children }: { children: React.ReactNode }) {
  return <PageTransition>{children}</PageTransition>
}
