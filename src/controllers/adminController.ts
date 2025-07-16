import express from "express"
import type { Router, Request, Response, NextFunction } from "express"
import { createPost, deletePost, posts, updatePost } from "../models/postModel.js";

export const adminRouter: Router = express.Router();

type Middleware = (req: Request, res: Response, next: NextFunction) => void

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
        date: new Date().getTime().toString()
    }
    //TODO: create admin/postCreate.html file with create form
    // with post on /post
    res.render('admin/postEdit.html', {
        post
    })
})
adminRouter.post('/post', async (req: Request, res: Response) => {
    // TODO: validate req.body
    const postDraft = {
        slug: req.body.slug,
        title: req.body.title,
        content: req.body.content,
        date: req.body.date,
    }
    post = await createPost(postDraft)
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
    if ('slug' in req.body) post.slug = req.body.slug
    if ('title' in req.body) post.title = req.body.title
    if ('content' in req.body) post.content = req.body.content
    if ('date' in req.body) post.date = req.body.date

    await updatePost(post)
    console.log(`Redirect: ${post.slug ? post.slug : post.id}`)
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