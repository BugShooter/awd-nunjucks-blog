import path from 'node:path'
import { access, constants, readFile, unlink, writeFile } from 'node:fs/promises'
import type { UUID } from 'node:crypto'
import { randomUUID } from 'node:crypto'
import slug from 'slug'

const dataPath = path.join(import.meta.dirname, '../data/posts.json')
export let posts: Post[] = await loadPosts()

export async function refresh(): Promise<void> {
    posts = await loadPosts()
}

function enrichPosts(rawPosts: Post[]): Post[] {
    return rawPosts.map((p: Post, i: number) => {
        return {
            ...p,
            slug: p.slug ?? slug(p.title),
            id: p.id ?? String(i + 1)
        }
    })
}

async function loadPosts(): Promise<Post[]> {
    const json = await readFile(dataPath, 'utf-8')
    const rawPosts: Post[] = JSON.parse(json)
    return enrichPosts(rawPosts);
}
function generatePostId(posts: Post[]): string {
    let postId: string
    do {
        postId = randomUUID()
    } while (posts.findIndex(p => p.id === postId) === -1)
    return postId

}
export async function createPost(postDraft: Omit<Post, 'id'>): Promise<Post> {
    let _posts = await loadPosts()

    let post: Post = {
        ...postDraft,
        id: generatePostId(_posts)
    }

    // validate post that slug not conflict with another post
    if (post.slug) {
        const conflictPost = _posts.find(p => p.slug === post.slug);
        if (conflictPost) {
            // TODO: create ValidationError and catch it in Controller
            throw new Error(`This slug is already used by another post.\nSlug:"${post.slug}"\n Current ID:${post.id}, Conflic ID:${conflictPost?.id}`,)
        }
    }

    try {
        await writeFile(dataPath, JSON.stringify(_posts, null, 4))
        posts = _posts
        return post
    } catch (err) {
        console.error(err)
        throw err
    }
}

export async function updatePost(post: Post): Promise<boolean> {
    if (!post.id) {
        // TODO: create ValidationError and catch it in Controller
        throw new Error('Cannot update post without ID')
    }

    let _posts = await loadPosts()

    // validate post that slug not conflict with another post
    if (post.slug) {
        const conflictPost = _posts.find(p => p.slug === post.slug && p.id !== undefined && p.id !== post.id);
        if (conflictPost) {
            // TODO: create ValidationError and catch it in Controller
            throw new Error(`This slug is already used by another post.\nSlug:"${post.slug}"\n Current ID:${post.id}, Conflic ID:${conflictPost?.id}`,)
        }
    }

    _posts = _posts.filter(p => p.id !== post.id)
    _posts = [..._posts, post]
    try {
        await writeFile(dataPath, JSON.stringify(_posts, null, 4))
        posts = _posts
        return true
    } catch (err) {
        console.error(err)
    }
    return false
}

export async function deletePost(postId: string): Promise<void> {
    let _posts = await loadPosts()

    if (_posts.findIndex(p => p.id === postId) === -1) {
        // Post with postID is not exist
        return
    }
    _posts = _posts.filter(p => p.id !== postId)
    try {
        await writeFile(dataPath, JSON.stringify(_posts, null, 4))
        posts = _posts
        console.log('DELETE POST')
        console.log('posts:', JSON.stringify(_posts, null, 2))
        console.log('post:', JSON.stringify(postId, null, 2))

    } catch (err) {
        console.error(err)
        throw err
    }
}
