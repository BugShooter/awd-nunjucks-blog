declare module 'nunjucks-date-filter' {
    function nunjucksDateFilter(date: string | Date | number, format?: string): string
    export = nunjucksDateFilter
}

interface Post {
    id?: string
    slug?: string
    title: string
    teaser?: string
    content: string
    image?: string
    author?: string
    createdAt: number
}
