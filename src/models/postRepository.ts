import slug from 'slug'

export function enrichPosts(rawPosts: Post[]): Post[] {
    return rawPosts.map((p: Post, i: number) => {
        return {
            ...p,
            slug: p.slug ?? slug(p.title),
            id: p.id ?? String(i + 1)
        }
    })
}

