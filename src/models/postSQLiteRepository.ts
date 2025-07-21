import path from 'node:path'
import { randomUUID } from 'node:crypto'
import { enrichPosts } from './postRepository.js'
import { closeDB, connectDB, getDB } from '../db/database.js'

function beautifySql(sql: string): string {
    return sql.split('\n').join(' ').replace(/\s+/g, ' ').trim()
}

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
        const sql = resultFields
            ? beautifySql(`SELECT ${resultFields.join(',')} FROM posts`)
            : beautifySql(`SELECT * FROM posts`)
        db.all<Post>(sql,
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
        await new Promise((resolve, reject) => {
            const sql = beautifySql(`INSERT INTO posts 
                (id,slug,title,teaser,content,image,author,createdAt)
                VALUES (?,?,?,?,?,?,?,?)`)
            db.run(sql, [
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

export async function update(post: Post): Promise<Post> {
    try {
        await new Promise((resolve, reject) => {
            const sql = beautifySql(`UPDATE posts
                SET slug=?,title=?,teaser=?,content=?,image=?,author=?
                WHERE id=?`)
            db.run(sql, [
                post.slug,
                post.title,
                post.teaser,
                post.content,
                post.image,
                post.author,
                post.id
            ],
                (err: Error | null, result: unknown) => {
                    // NOTE: result is undefined
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                }
            );
        });
        // FIXME: need to get a new post from DB?
        return post
    } catch (err) {
        console.error(err)
        throw err
    }
}

export async function getById(postId: string): Promise<Post> {
    try {
        const post = await new Promise<Post>((resolve, reject) => {
            const sql = beautifySql(`SELECT *
                FROM posts
                WHERE id=?`)
            db.get<Post>(sql, [
                postId,
            ],
                (err: Error | null, row: Post) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                }
            );
        })
        if (post === undefined) {
            throw new Error(`Post ID:'${postId}' not found`)
        }
        return post
    } catch (err) {
        console.error(err)
        throw err
    }
}

async function isExistById(postId: string): Promise<boolean> {
    try {
        // NOTE: we can select only ID
        const post = await new Promise<string>((resolve, reject) => {
            const sql = beautifySql(`SELECT id
                FROM posts
                WHERE id=?`)
            db.get<string>(sql, [
                postId,
            ],
                (err: Error | null, row: string) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(row);
                    }
                }
            );
        })
        if (post === undefined) {
            return false
        }
        return true
    } catch (err) {
        console.error(err)
        throw err
    }
}

export async function deleteById(postId: string): Promise<void> {
    try {
        await new Promise((resolve, reject) => {
            db.run(`
                DELETE FROM posts
                WHERE id=?`.trim(), [
                postId
            ],
                (err: Error | null, result: unknown) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(result);
                    }
                }
            );
        });
        return
    } catch (err) {
        console.error(err)
        throw err
    }
}