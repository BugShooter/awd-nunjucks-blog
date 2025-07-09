import express from 'express'
import nunjucks from 'nunjucks'
// const nunjucksDateFilter = require('nunjucks-date-filter');
import nunjucksDateFilter from 'nunjucks-date-filter'
import type { Request, Response } from 'express'
import postsData from './data/posts.json'

const app = express();
const port = process.env.PORT || 3000;

// TODO: use cors middleware

nunjucks.configure('src/templates', {
    autoescape: true,
    express: app
})
    .addFilter('date', nunjucksDateFilter)

app.get('/', (req: Request, res: Response) => {
    res.render('index.html', {
        postsData
    })
})

app.use(express.static('src/public'))

app.listen(port, () => {
    console.log(`Express blog application powered by nunjucks listening on port ${port}`)
}).on('error', (e) => {
    console.error(e.message)
    process.exit(1);
})
