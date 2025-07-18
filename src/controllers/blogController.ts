import express from "express"
import type { Router, Request, Response, NextFunction } from "express"
import { getAllPosts } from "../models/postModel.js";

export const blogRouter: Router = express.Router();
blogRouter.get('/index.html', (req: Request, res: Response) => {
    res.redirect(301, '/')
})
blogRouter.get('/', async (req: Request, res: Response) => {
    const posts = await getAllPosts()
    res.render('index.html', {
        posts
    })
})

blogRouter.get('/post/:postId', async (req: Request, res: Response) => {
    const postId = req.params.postId
    const posts = await getAllPosts()
    let post = posts.find((p: Post) => p.slug === postId)
    if (!post) post = posts.find((p: Post) => p.id == postId)
    if (!post) {
        res.status(404).render('error.html', {
            title: 'Error: 404',
            content: 'Post not found'
        })
    } else {
        res.render('post.html', {
            post
        })
    }
})

blogRouter.get('/contact.html', (req: Request, res: Response) => {
    res.redirect(301, '/contact')
})
blogRouter.get('/contact', (req: Request, res: Response) => {
    res.render('contact.html')
})
