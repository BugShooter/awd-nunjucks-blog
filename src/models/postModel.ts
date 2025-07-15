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

export async function createPost(post: Omit<Post, 'id'>): Promise<Post> {
    throw new Error('TODO: implement postModel.createPost')
}

export async function updatePost(post: Post): Promise<boolean> {
    throw new Error('TODO: implement postModel.savePost')
}

export async function deletePost(postId: string): Promise<void> {
    throw new Error('TODO: implement postModel.deletePost')
}
