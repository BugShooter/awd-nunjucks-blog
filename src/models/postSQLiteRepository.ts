import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { enrichPosts } from './postRepository.js'
import { closeDB, connectDB, getDB } from '../db/database.js'

// const dataPath = path.join(import.meta.dirname, '../data/blog.db')
try {
    await connectDB()
    console.log('Connected to the SQLite database')
} catch (error) {
    const message = error instanceof Error
    ? error.message
    : error
    console.log('Error connect to database: ', message)
    process.exit(1);
}

const db = getDB();

process.on("SIGINT", async () => {
    console.log("SIGINT received. Closing database connection...");
    await closeDB();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    console.log("SIGTERM received. Closing database connection...");
    await closeDB();
    process.exit(0);
});


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
    // const json = await readFile(dataPath, 'utf-8')
    // const rawPosts: Post[] = JSON.parse(json)

    const rawPosts: Post[] = await new Promise((resolve, reject) => {
        db.all<Post>(
            `SELECT * FROM posts`,
            [],
            (err: Error | null, rows: Post[]) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            }
        )
    })

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
   try {
        // await writeFile(dataPath, JSON.stringify(_posts, null, 4))
        await new Promise((resolve, reject) => {
            db.run('INSERT INTO posts (id,slug,title,teaser,content,image,author,createdAt) VALUES (?,?,?,?,?,?,?,?)', [
                post.id,
                post.slug,
                post.title,
                post.teaser,
                post.content,
                post.image,
                post.author,
                post.createdAt
            ],
                (err: Error | null, rows: Post[]) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(rows);
                    }
                }
            );
        });
        return post
    } catch (err) {
        console.error(err)
        throw err
    }
}

// TODO
export async function update(post: Post): Promise<Post> {
    // const posts = await getAll()

    // let newPosts = posts.filter(p => p.id !== post.id)
    // newPosts = [...newPosts, post]

    // await writeFile(dataPath, JSON.stringify(newPosts, null, 4))

    return post
}

// TODO
export async function getById(postId: string): Promise<Post> {
    let posts = await getAll()
    const post = posts.find(p => p.id === postId)
    if (post === undefined) {
        throw new Error(`Post ID:'${postId}' not found`)
    }

    return post
}

// TODO
async function isExistById(postId: string): Promise<boolean> {
    let posts = await getAll()

    if (posts.findIndex(p => p.id === postId) === -1) {
        return false
    }

    return true
}

// TODO
export async function deleteById(postId: string): Promise<void> {
    // const posts = await getAll()

    // if (await isExistById(postId)) {
    //     return
    // }

    // let newPosts = posts.filter(p => p.id !== postId)

    // await writeFile(dataPath, JSON.stringify(newPosts, null, 4))
}