import express from 'express'
import nunjucks from 'nunjucks'
import fs from 'fs'
import path from 'path'
import nunjucksDateFilter from 'nunjucks-date-filter'
import type { NextFunction, Request, Response } from 'express'
// import rawPosts from './data/posts.json'
import slug from 'slug'

const rawPosts: Post[] = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, 'data/posts.json'), 'utf-8'))
const posts = rawPosts.map((p: Post, i: number) => {
    return {
        ...p,
        slug: slug(p.title),
        id: String(i + 1)
    }
})

const app = express()
const port = process.env.PORT || 3000

// TODO: use cors middleware

nunjucks
    .configure('src/views', {
        autoescape: true,
        express: app
    })
    .addFilter('date', nunjucksDateFilter)
    .addFilter('inArray', function (value, array) {
        return array.includes(value)
    })
    .addFilter('split', function (str, sep) {
        return str.split(sep)
    })

app.get('/index.html', (req: Request, res: Response) => {
    res.redirect(301, '/')
})
app.get('/', (req: Request, res: Response) => {
    res.render('index.html', {
        posts
    })
})

app.get('/post/:postId', (req: Request, res: Response) => {
    const postId = req.params.postId
    let post = posts.find((p: Post) => p.slug === postId)
    if (!post) post = posts.find((p: Post) => p.id == postId)
    if (!post) {
        res.sendStatus(404)
    } else {
        res.render('post.html', {
            post
        })
    }
})

app.get('/contact.html', (req: Request, res: Response) => {
    res.redirect(301, '/contact')
})
app.get('/contact', (req: Request, res: Response) => {
    res.render('contact.html')
})

app.use(express.static('src/public'))

app.listen(port, () => {
    console.log(`Express blog application powered by nunjucks listening on port ${port}`)
}).on('error', (e) => {
    console.error(e.message)
    process.exit(1)
})
