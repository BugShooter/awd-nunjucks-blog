import express from "express"
import type { Router, Request, Response, NextFunction } from "express"
import { posts, updatePost } from "../models/postModel.js";

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
    await updatePost(post)
    res.render('admin/postEdit.html', {
        post
    })
})

adminRouter.use((req: Request, res: Response) => {
    res.status(404).render('admin/error.html', {
        title: 'Error: 404',
        content: 'Not Found'
    })
})