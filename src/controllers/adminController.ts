import express from "express"
import type { Router, Request, Response, NextFunction } from "express"
import { createPost, deletePost, posts, updatePost } from "../models/postModel.js";
import sanitizeHtml from 'sanitize-html'
import slug from "slug";

export const adminRouter: Router = express.Router();

type Middleware = (req: Request, res: Response, next: NextFunction) => void

const log = (...data: any) => {
    const message = [
        'ADMIN:',
        new Date().toISOString(),
    ].join(' ')
    console.log(message, ...data)
}
const requestLoggerMiddleware: Middleware = (req, res, next) => {
    log(req.method, req.path)
    next()
}
adminRouter.use(requestLoggerMiddleware)


let post: Post | undefined = undefined

const findPostByParamMiddleware: Middleware = (req, res, next) => {
    const postId = req.params.postId
    post = posts.find((p: Post) => p.slug === postId)
    if (!post) post = posts.find((p: Post) => p.id == postId)
    if (!post) {
        res.status(404).render('error.html', {
            title: 'Error: 404',
            content: 'Post not found'
        })
    } else {
        next()
    }
}

adminRouter.get('/', (req: Request, res: Response) => {
    res.render('admin/index.html', {
        posts
    })
})

adminRouter.get('/post/create', (req: Request, res: Response) => {
    const post: Post = {
        title: '',
        content: '',
        createdAt: new Date().getTime()
    }
    res.render('admin/postCreate.html', {
        post
    })
})
function sanitizePost<T extends (Post | Omit<Post, 'id'>)>(post: T): T {
    const htmlConfig = {
        allowedTags: [
            'span', 'div', 'p',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'ul', 'ol', 'li',
            'b', 'i', 'u', 'em', 'strong',
            'br', 'hr',
            'a', 'img',
            'blockquote', 'pre', 'code',
        ],
        allowedAttributes: {
            a: ['href', 'name', 'target', 'rel'],
            img: ['src', 'alt', 'title', 'width', 'height'],
            '*': ['style']
        },
        allowedSchemes: ['http', 'https', 'mailto', 'data'],
        allowedSchemesByTag: {
            img: ['http', 'https', 'data']
        },
        allowProtocolRelative: true
    }
    const textConfig = {
        allowedTags: [],
    }

    // (['slug','title','teaser'] as Array<keyof Post>).forEach(field => {
    //     if (post[field]) post[field] = sanitizeHtml(post[field], textConfig)
    // });
    if (post.slug) post.slug = sanitizeHtml(post.slug, textConfig)
    if (post.title) post.title = sanitizeHtml(post.title, textConfig)
    if (post.teaser) post.teaser = sanitizeHtml(post.teaser, textConfig)
    post.content = sanitizeHtml(post.content, htmlConfig)

    return post;
}
adminRouter.post('/post', async (req: Request, res: Response) => {
    // TODO: validate req.body
    const postDraft: Omit<Post, 'id'> = {
        slug: req.body.slug ?? '',
        title: req.body.title ?? '',
        teaser: req.body.teaser ?? '',
        content: req.body.content ?? '',
        createdAt: Math.floor(Date.now() / 1000),
    }
    const sanitizedPostDraft = sanitizePost(postDraft)
    post = await createPost(sanitizedPostDraft)
    res.redirect(`/admin/post/${post.slug ? post.slug : post.id}`)
})

adminRouter.get('/post/:postId', findPostByParamMiddleware, (req: Request, res: Response) => {
    res.render('admin/post.html', {
        post
    })
})

adminRouter.get('/post/:postId/edit', findPostByParamMiddleware, (req: Request, res: Response) => {
    res.render('admin/postEdit.html', {
        post
    })
})
adminRouter.put('/post/:postId', findPostByParamMiddleware, async (req: Request, res: Response) => {
    if (!post) throw new Error('Unpossible case')
    // TODO: validate fields and transform if necessary
    // safe fields
    if ('slug' in req.body) post.slug = req.body.slug
    if ('title' in req.body) post.title = req.body.title
    if ('teaser' in req.body) post.teaser = req.body.teaser
    if ('content' in req.body) post.content = req.body.content
    // unsafe fields
    // if ('createdAt' in req.body) post.createdAt = req.body.createdAt

    await updatePost(post)
    res.redirect(`${post.slug ? post.slug : post.id}`)
})

adminRouter.delete('/post/:postId', findPostByParamMiddleware, async (req: Request, res: Response) => {
    if (!post || !post.id) throw new Error('Unpossible case')

    await deletePost(post.id)
    res.redirect('/admin')
})

adminRouter.use((req: Request, res: Response) => {
    res.status(404).render('admin/error.html', {
        title: 'Error: 404',
        content: 'Not Found'
    })
})