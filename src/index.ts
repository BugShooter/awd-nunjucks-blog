import express from 'express'
import nunjucks from 'nunjucks'
import type { Request, Response } from 'express'

const app = express();
const port = process.env.PORT || 3000;

// TODO: use cors middleware

nunjucks.configure('src/templates', {
    autoescape: true,
    express: app
})

app.get('/', (req: Request, res: Response) => {
    res.render('src/public/index.html')
})

app.use(express.static('src/public'))

app.listen(port, () => {
    console.log(`Express blog application powered by nunjucks listening on port ${port}`)
}).on('error', (e) => {
    console.error(e.message)
    process.exit(1);
})
