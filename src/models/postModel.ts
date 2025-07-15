import fs from 'fs'
import path from 'path'
import slug from 'slug'

const rawPosts: Post[] = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, '../data/posts.json'), 'utf-8'))
export const posts = rawPosts.map((p: Post, i: number) => {
    return {
        ...p,
        slug: slug(p.title),
        id: String(i + 1)
    }
})
