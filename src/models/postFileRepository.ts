import path from 'node:path'
import { access, constants, readFile, unlink, writeFile } from 'node:fs/promises'
import { type UUID, randomUUID } from 'node:crypto'
import { enrichPosts } from './postRepository.js'

const dataPath = path.join(import.meta.dirname, '../data/posts.json')

let posts: Post[] = []

export async function generatePostId(): Promise<string> {
    const posts: Post[] = await getAll()
    let postId: string
    do {
        postId = randomUUID()
    } while (posts.findIndex(p => p.id === postId) !== -1)

    return postId
}

export async function getAll(): Promise<Post[]>
export async function getAll<K extends keyof Post>(resultFields: K[]): Promise<Pick<Post, K>[]>
export async function getAll<K extends keyof Post>(resultFields?: K[]): Promise<Post[] | Pick<Post, K>[]> {
    const json = await readFile(dataPath, 'utf-8')
    const rawPosts: Post[] = JSON.parse(json)
    let posts = enrichPosts(rawPosts)
    posts = posts

    if (resultFields) {
        return posts.map(p => {
            const r = {} as Pick<Post, K>
            resultFields.forEach((field) => {
                r[field] = p[field]
            })
            return r
        })
    }

    return posts
}

export async function create(post: Post): Promise<Post> {
    let posts = await getAll()

    let newPosts = [...posts, post]

    await writeFile(dataPath, JSON.stringify(newPosts, null, 4))

    return post
}

export async function update(post: Post): Promise<Post> {
    const posts = await getAll()

    let newPosts = posts.filter(p => p.id !== post.id)
    newPosts = [...newPosts, post]

    await writeFile(dataPath, JSON.stringify(newPosts, null, 4))

    return post
}

export async function getById(postId: string): Promise<Post> {
    let posts = await getAll()
    const post = posts.find(p => p.id === postId)
    if (post === undefined) {
        throw new Error(`Post ID:'${postId}' not found`)
    }

    return post
}

async function isExistById(postId: string): Promise<boolean> {
    let posts = await getAll()

    if (posts.findIndex(p => p.id === postId) === -1) {
        return false
    }

    return true
}

export async function deleteById(postId: string): Promise<void> {
    const posts = await getAll()

    if (await isExistById(postId)) {
        return
    }

    let newPosts = posts.filter(p => p.id !== postId)

    await writeFile(dataPath, JSON.stringify(newPosts, null, 4))
}