// import { getAll, create, update, getById, deleteById, generatePostId } from './postFileRepository.js'
import { getAll, create, update, getById, deleteById, generatePostId } from './postSQLiteRepository.js'

export class ValidationError extends Error {
    constructor(public field: string, message: string) {
        super(message)
        this.field = field
    }
}
export class OperationError extends Error { }

export async function getAllPosts(): Promise<Post[]> {
    return getAll()
}

async function validatePost(post: Pick<Post, 'id' | 'slug'>): Promise<void> {
    const posts = await getAll(['id', 'slug'])
    // validate that slug not conflict with another post
    if (post.slug) {
        const conflictPost = posts.find(p => p.slug === post.slug && p.id !== undefined && p.id !== post.id);
        if (conflictPost) {
            // TODO: catch  ValidationError in Controller
            const logMessage = `This slug is already used by another post.\nSlug:"${post.slug}"\n Current ID:${post.id}, Conflict ID:${conflictPost?.id}`
            console.log(logMessage)
            const validationMessage = `This slug is already used by another post`
            throw new ValidationError('slug', validationMessage)
        }
    }
}

export async function createPost(postDraft: Omit<Post, 'id'>): Promise<Post> {
    let post: Post = {
        ...postDraft,
        id: await generatePostId()
    }

    await validatePost(post)

    try {
        return await create(post)
    } catch (err) {
        console.error(err)
        throw new OperationError('Cannot create post')
    }
}

export async function updatePost(post: Post): Promise<Post> {
    if (!post.id) {
        // TODO: catch ValidationError in Controller
        throw new ValidationError('id', 'Cannot update post without ID')
    }

    await validatePost(post)

    try {
        return await update(post)
    } catch (err) {
        console.error(err)
        throw new OperationError('Cannot update post')
    }
}

export async function deletePost(postId: string): Promise<void> {
    try {
        await deleteById(postId)
    } catch (err) {
        console.error(err)
        throw new OperationError('Cannot delete post')
    }
}
