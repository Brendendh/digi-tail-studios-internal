import React, { useEffect, useMemo, useState } from 'react'
import { Button } from './ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { cn } from '../lib/utils'
import type { LinksPayload } from '../lib/links-schema'

function getGroupKey(index: number, title: string) {
  return `${index}-${title}`
}

function getGroupId(index: number, title: string) {
  return `group-${index}-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`
}

function resolveIconUrl(iconPath: string | undefined): string | undefined {
  if (!iconPath) return undefined
  if (iconPath.startsWith('http://') || iconPath.startsWith('https://') || iconPath.startsWith('data:')) {
    return iconPath
  }
  const baseUrl = import.meta.env.BASE_URL
  if (iconPath.startsWith('/')) {
    return `${baseUrl}${iconPath.slice(1)}`
  }
  return `${baseUrl}${iconPath}`
}

export default function LinksView({ links }: Readonly<{ links: LinksPayload | null }>) {
  const groups = useMemo(() => links?.groups ?? [], [links?.groups])
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setOpenGroups((previous) => {
      const next: Record<string, boolean> = {}
      groups.forEach((group, index) => {
        const key = getGroupKey(index, group.title)
        next[key] = previous[key] ?? false
      })
      return next
    })
  }, [groups])

  const totalLinks = groups.reduce((sum, group) => sum + group.items.length, 0)
  const allExpanded = groups.length > 0 && groups.every((group, index) => openGroups[getGroupKey(index, group.title)] ?? false)

  const toggleGroup = (groupKey: string) => {
    setOpenGroups((previous) => ({
      ...previous,
      [groupKey]: !(previous[groupKey] ?? false),
    }))
  }

  const setAll = (isOpen: boolean) => {
    setOpenGroups(Object.fromEntries(groups.map((group, index) => [getGroupKey(index, group.title), isOpen])))
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Private Links</CardTitle>
            <CardDescription>{totalLinks} links across {groups.length} groups.</CardDescription>
          </div>
          {groups.length > 0 && (
            <Button variant="secondary" size="sm" onClick={() => setAll(!allExpanded)}>
              {allExpanded ? 'Collapse all' : 'Expand all'}
            </Button>
          )}
        </CardHeader>
      </Card>

      {groups.length === 0 ? (
        <Card>
          <CardContent className="pt-6">No groups found in decrypted payload.</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {groups.map((group, groupIndex) => {
            const groupKey = getGroupKey(groupIndex, group.title)
            const isOpen = openGroups[groupKey] ?? false

            return (
              <Card key={groupKey} className="animate-[fade-up_450ms_ease-out] overflow-hidden">
                <CardHeader className="p-0">
                  <button
                    type="button"
                    className={cn(
                      'flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-(--winter-coat)/35',
                      isOpen ? 'rounded-t-2xl' : 'rounded-2xl',
                    )}
                    onClick={() => toggleGroup(groupKey)}
                    aria-expanded={isOpen}
                    aria-controls={getGroupId(groupIndex, group.title)}
                  >
                    <div className="flex items-center gap-3">
                      {group.icon ? (
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-(--extra-foam) bg-white/70 p-1">
                          <img src={resolveIconUrl(group.icon)} alt="" className="h-full w-full object-contain" />
                        </span>
                      ) : (
                        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-(--extra-foam) bg-white/70 text-[10px] font-semibold uppercase tracking-wide text-black/60">
                          icon
                        </span>
                      )}
                      <div>
                        <h3 className="text-base font-semibold">{group.title}</h3>
                        <p className="text-sm text-black/60">{group.items.length} links</p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        'inline-flex h-9 w-9 items-center justify-center rounded-full bg-(--winter-coat)/70 transition-transform duration-300',
                        isOpen ? 'rotate-180' : 'rotate-0',
                      )}
                      aria-hidden
                    >
                      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 8l5 6 5-6" />
                      </svg>
                    </span>
                  </button>
                </CardHeader>

                <CardContent
                  id={getGroupId(groupIndex, group.title)}
                  className={cn(
                    'overflow-hidden p-0 transition-[max-height,opacity,visibility] duration-300 ease-out',
                    isOpen ? 'max-h-300 opacity-100' : 'max-h-0 opacity-0 invisible',
                  )}
                  inert={!isOpen ? '' : undefined}
                >
                  <ul className="space-y-2 px-5 pb-5 pt-2">
                    {group.items.map((item, itemIndex) => (
                      <li key={`${groupKey}-item-${itemIndex}`}>
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noreferrer"
                          className="group block rounded-xl border border-(--extra-foam) bg-[linear-gradient(120deg,rgba(210,251,250,0.7),rgba(229,218,191,0.95))] p-3 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_25px_-20px_rgba(29,13,18,1)]"
                        >
                          <div className="flex items-start gap-3">
                            {item.icon ? (
                              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-(--extra-foam) bg-white/70 p-1">
                                <img src={resolveIconUrl(item.icon)} alt="" className="h-full w-full object-contain" />
                              </span>
                            ) : (
                              <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-(--extra-foam) bg-white/70 text-[10px] font-semibold uppercase tracking-wide text-black/60">
                                icon
                              </span>
                            )}
                            <span className="min-w-0">
                              <span className="block font-semibold text-(--long-black) group-hover:underline">{item.title || item.url}</span>
                              {item.notes && <span className="mt-1 block text-sm text-black/70">{item.notes}</span>}
                            </span>
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

