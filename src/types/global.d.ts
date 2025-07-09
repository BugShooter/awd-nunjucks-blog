declare module 'nunjucks-date-filter' {
    function nunjucksDateFilter(date: string | Date | number, format?: string): string;
    export = nunjucksDateFilter;
}