export const placeholderTags = {
  magyar: {
    displayName: 'magyar',
    id: '0',
  },
  alaprecept: {
    displayName: 'alaprecept',
    id: '1',
  },
  főzelék: {
    displayName: 'főzelék',
    id: '2',
  },
  desszert: {
    displayName: 'desszert',
    id: '3',
  },
  tészta: {
    displayName: 'tészta',
    id: '4',
  },
  olasz: {
    displayName: 'olasz',
    id: '5',
  },
  leves: {
    displayName: 'leves',
    id: '6',
  },
}

export const placeholderData = [
  {
    id: '1',
    title: 'Palacsinta alaprecept',
    tags: [placeholderTags['alaprecept'], placeholderTags['magyar'], placeholderTags['desszert']],
  },
  {
    id: '2',
    title: 'Somlói galuska',
    tags: [placeholderTags['desszert'], placeholderTags['magyar']],
  },
  {
    id: '3',
    title: 'Krumplifőzelék',
    tags: [placeholderTags['főzelék'], placeholderTags['magyar']],
  },
  {
    id: '4',
    title: 'Kocsonya',
    tags: [placeholderTags['magyar']],
  },
  {
    id: '5',
    title: 'Betyárleves',
    tags: [placeholderTags['magyar'], placeholderTags['leves']],
  },
  {
    id: '6',
    title: 'Fasírt',
    tags: [placeholderTags['magyar']],
  },
  {
    id: '7',
    title: 'Carbonara',
    tags: [placeholderTags['olasz'], placeholderTags['tészta']],
  },
  {
    id: '8',
    title: 'Lecsó',
    tags: [placeholderTags['magyar']],
  },
  {
    id: '9',
    title: 'Rizottó',
    tags: [placeholderTags['olasz']],
  },
]
