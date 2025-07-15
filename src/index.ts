import express from 'express'
import nunjucks from 'nunjucks'
import nunjucksDateFilter from 'nunjucks-date-filter'
import type { NextFunction, Request, Response } from 'express'
import { blogRouter } from './controllers/blogController.js'

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

app.use(blogRouter)

app.use(express.static('src/public'))

app.listen(port, () => {
    console.log(`Express blog application powered by nunjucks listening on port ${port}`)
}).on('error', (e) => {
    console.error(e.message)
    process.exit(1)
})
