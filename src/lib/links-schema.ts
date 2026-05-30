export type LinkItem = {
  title?: string
  url: string
  notes?: string
  icon?: string
}

export type LinkGroup = {
  title: string
  icon?: string
  items: LinkItem[]
}

export type LinksPayload = {
  groups: LinkGroup[]
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isOptionalString(value: unknown) {
  return value === undefined || typeof value === 'string'
}

function isRequiredString(value: unknown) {
  return typeof value === 'string' && value.trim().length > 0
}

export function parseLinksPayload(value: unknown): LinksPayload {
  if (!isRecord(value)) throw new Error('Invalid links payload: root must be an object.')
  if (!Array.isArray(value.groups)) throw new Error('Invalid links payload: "groups" must be an array.')

  value.groups.forEach((group, groupIndex) => {
    if (!isRecord(group)) throw new Error(`Invalid links payload: groups[${groupIndex}] must be an object.`)
    if (!isRequiredString(group.title)) throw new Error(`Invalid links payload: groups[${groupIndex}].title must be a non-empty string.`)
    if (!isOptionalString(group.icon)) throw new Error(`Invalid links payload: groups[${groupIndex}].icon must be a string.`)
    if (!Array.isArray(group.items)) throw new Error(`Invalid links payload: groups[${groupIndex}].items must be an array.`)

    group.items.forEach((item, itemIndex) => {
      if (!isRecord(item)) throw new Error(`Invalid links payload: groups[${groupIndex}].items[${itemIndex}] must be an object.`)
      if (!isRequiredString(item.url)) throw new Error(`Invalid links payload: groups[${groupIndex}].items[${itemIndex}].url must be a non-empty string.`)
      if (!isOptionalString(item.title)) throw new Error(`Invalid links payload: groups[${groupIndex}].items[${itemIndex}].title must be a string.`)
      if (!isOptionalString(item.notes)) throw new Error(`Invalid links payload: groups[${groupIndex}].items[${itemIndex}].notes must be a string.`)
      if (!isOptionalString(item.icon)) throw new Error(`Invalid links payload: groups[${groupIndex}].items[${itemIndex}].icon must be a string.`)
    })
  })

  return value as LinksPayload
}

