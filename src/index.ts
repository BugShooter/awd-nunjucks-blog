import express, { Request, Response, NextFunction } from 'express'
import nunjucks from 'nunjucks'
import nunjucksDateFilter from 'nunjucks-date-filter'
import { blogRouter } from './controllers/blogController.js'
import { adminRouter } from './controllers/adminController.js'
import errorHandlerMiddleware from './middlewares/errorHandlerMiddleware.js'
import methodOverrideMiddleware from './middlewares/methodOverrideMiddleware.js'

const app = express()
const port = process.env.PORT || 3000

// TODO: use cors middleware

app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(methodOverrideMiddleware) // for handling PUT and DELETE requests
app.use(express.json()) // for parsing application/json

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
app.use("/admin", adminRouter)

app.use(express.static('src/public'))

app.use(errorHandlerMiddleware())

app.use((req: Request, res: Response) => {
    res.status(404).render('error.html', {
        title: 'Error: 404',
        content: 'Not Found'
    })
})

app.listen(port, () => {
    console.log(`Express blog application powered by nunjucks listening on port ${port}`)
}).on('error', (e) => {
    console.error(e.message)
    process.exit(1)
})
