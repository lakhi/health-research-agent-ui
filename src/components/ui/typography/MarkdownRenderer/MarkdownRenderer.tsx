import { type FC, useMemo } from 'react'
import ReactMarkdown, { type Components } from 'react-markdown'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize from 'rehype-sanitize'
import remarkGfm from 'remark-gfm'

import { cn } from '@/lib/utils'
import type { Citation } from '@/types/os'

import { type MarkdownRendererProps, type AnchorLinkProps } from './types'
import { inlineComponents } from './inlineStyles'
import { components } from './styles'

const SourceChip: FC<{ citation: Citation }> = ({ citation }) => (
  <span className="my-1 ml-4 block max-w-prose rounded-md border-l-2 border-accent/40 bg-background-secondary/60 px-3 py-2 text-sm italic text-muted">
    <span className="mr-2 inline-block rounded bg-accent/10 px-1.5 py-0.5 text-xs font-medium uppercase not-italic text-accent">
      {citation.language}
    </span>
    ↳ {citation.excerpt}
  </span>
)

const buildCitationComponents = (citations: Citation[]) => {
  const citationMap = new Map<string, Citation>()
  for (const c of citations) {
    if (!citationMap.has(c.source_url)) citationMap.set(c.source_url, c)
  }
  const seen = new Set<string>()
  const OriginalAnchor = components.a

  const CitationAnchor: FC<AnchorLinkProps> = (props) => {
    const href = props.href
    const citation = href ? citationMap.get(href) : undefined
    const showChip = !!citation && !seen.has(href as string)
    if (showChip) seen.add(href as string)
    return (
      <>
        <OriginalAnchor {...props} />
        {showChip && citation ? <SourceChip citation={citation} /> : null}
      </>
    )
  }

  return { ...components, a: CitationAnchor }
}

const MarkdownRenderer: FC<MarkdownRendererProps> = ({
  children,
  classname,
  inline = false,
  citations
}) => {
  const resolvedComponents = useMemo(() => {
    if (inline) return inlineComponents
    if (!citations || citations.length === 0) return components
    return buildCitationComponents(citations)
  }, [inline, citations])

  return (
    <ReactMarkdown
      className={cn(
        'prose prose-h1:text-xl dark:prose-invert flex w-full flex-col gap-y-5 rounded-lg',
        classname
      )}
      components={{ ...resolvedComponents } as Components}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw, rehypeSanitize]}
    >
      {children}
    </ReactMarkdown>
  )
}

export default MarkdownRenderer
