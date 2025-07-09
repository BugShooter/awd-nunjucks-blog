# Nunjucks Blog App

This is a simple blog application built using Express and Nunjucks templating engine.

## Creating the Project

1. Create a new directory for the project:
```bash
mkdir nunjucks-blog-app
cd nunjucks-blog-app
```

2. Initialize a new Node.js project:
```bash
npm init -y
```

3. Install the required dependencies:
```bash
npm install express nunjucks dotenv
```
This command installs:
- `express` is a web framework for Node.js.
- `nunjucks` is a templating engine for rendering HTML templates.
- `dotenv` is used to load environment variables from a `.env` file.

4. Install development dependencies:
Install TypeScript and ts-node for TypeScript support, along with nodemon for automatic server restarts during development, and Prettier for code formatting: 
```bash
npm install --save-dev typescript ts-node @types/node @types/express nodemon
npm install --save-dev prettier @types/nunjucks prettier-plugin-jinja-template
```
or you can use shorthand:
```bash
npm i -D typescript ts-node @types/node @types/express nodemon 
npm i -D prettier @types/nunjucks prettier-plugin-jinja-template
```
This command installs:
- `typescript` is the TypeScript compiler.
- `ts-node` allows you to run TypeScript files directly without compiling them first.
- `prettier` is a code formatter that helps maintain consistent code style.
- `prettier-plugin-jinja-template` is used to format Jinja templates in `.html` files.
- `nodemon` is used to automatically restart the server when files change during development.
- `@types/node` provides TypeScript definitions for Node.js.
- `@types/express` provides TypeScript definitions for Express.
- `@types/nunjucks` provides TypeScript definitions for Nunjucks.

5. Create a `tsconfig.json` file:
```json
{
    "compilerOptions": {
        "rootDir": "./src",
        "outDir": "./dist",
        "target": "ES2020",
        "module": "commonjs",
        "strict": true,
        "esModuleInterop": true,
        "skipLibCheck": true,
        "forceConsistentCasingInFileNames": true,
        "resolveJsonModule": true
    }
}
```
This configuration file for TypeScript specifies:
- `target` specifies the ECMAScript target version to compile to.
- `module` specifies the module system to use.
- `strict` enables all strict type-checking options.
- `esModuleInterop` enables compatibility with CommonJS modules.
- `skipLibCheck` skips type checking of declaration files.
- `forceConsistentCasingInFileNames` ensures that file names are case-sensitive.
- `resolveJsonModule` allows importing JSON files as modules.

6. Create a `nodemon.json` file for development:

```json
{
    "watch": ["src"],
    "ext": "ts,json,html",
    "ignore": [
        "node_modules",
        "dist"
        ],
    "exec": "ts-node src/index.ts"
}
```
This configuration file for Nodemon specifies:
- watch specifies the directories to watch for changes
- ext specifies the file extensions to watch for changes
- ignore specifies directories to ignore
- exec specifies the command to run when changes are detected

7. Create a `prettier.rc` file for Prettier configuration:
```json
{
    "plugins": [
        "prettier-plugin-jinja-template"
    ],
    "overrides": [
        {
            "files": [
                "*.html"
            ],
            "options": {
                "parser": "jinja-template"
            }
        }
    ]
}

```
This configuration file for Prettier specifies:
- plugins specifies the Prettier plugins to use
- overrides specifies the file types and their corresponding parsers

8. Add scripts to `package.json` for building, developing, and starting the application:

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "nodemon src/index.ts",
    "watch": "tsc --watch",
    "format": "prettier --write ."
  }
}
```
This configuration adds the following scripts:
- `build`: Compiles TypeScript files to JavaScript.
- `start`: Starts the application using the compiled JavaScript files in the `dist` directory.
- `dev`: Starts the development server with Nodemon, watching for changes in TypeScript files.
- `watch`: Watches for changes in TypeScript files and recompiles them automatically.
- `format`: Formats the code using Prettier.

8. Create the project structure:
```bash
mkdir src
touch src/index.ts
mkdir src/public
mkdir src/data
touch src/data/posts.json
mkdir src/templates
```
9. Create a `.gitignore` file to exclude unnecessary files from version control:
```.gitignore
node_modules
dist
*.log
.env
```

10. Initialize a Git repository:
```bash
git init
git branch -M main
git add .
git commit -m "Initial commit"
# Add your remote repository URL here
# For example, if you have a GitHub repository, you can add it like this:
# git remote add origin <your-repo-url>
# git push -u origin main # -u sets the upstream branch
```

11. Download the starter template for the blog from the following link and place it in the `src/templates` directory:
Site: [Start Bootstrap Clean Blog](https://startbootstrap.com/previews/clean-blog)
Download link: https://github.com/StartBootstrap/startbootstrap-clean-blog/archive/gh-pages.zip
```bash
wget -O clean-blog.zip https://github.com/StartBootstrap/startbootstrap-clean-blog/archive/gh-pages.zip
unzip clean-blog.zip -d src
mv src/startbootstrap-clean-blog-gh-pages/* src/public/
rm clean-blog.zip
rm -rf src/startbootstrap-clean-blog-gh-pages
```

12. Create a simple Express server in `src/index.ts`:
```typescript
import express from 'express';
import nunjucks from 'nunjucks';

const app = express();
const port = process.env.PORT || 3000;

// Configure Nunjucks
nunjucks.configure('src/templates', {
    autoescape: true,
    express: app
});

// Serve static files from the public directory
app.use(express.static('src/public'));

// Define a route for the homepage
app.get('/', (req, res) => {
    res.render('index.html');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
```
This code sets up an Express server that uses Nunjucks as the templating engine. It serves static files from the `src/public` directory and renders the `index.html` template when the root URL is accessed.

13. Create a .env.local file in the root directory to store environment variables:
```.env.local
PORT=3000
```
install dotenv package to load environment variables from the `.env.local` file:
```bash
npm install dotenv
```

14. Create a sample blog post in `src/data/posts.json`:


15. Test the setup by running the development server:
```bash
npm run dev
```
You should see the server running at `http://localhost:3000`. Open this URL in your web browser to view the blog application.

## Tips & Problems

### Git Commands

This command adds all files in the current directory to Git, excluding the `src/public` directory.
The `:!src/public/**` part excludes all files in the `src/public` directory from being added to Git.
This is useful if you want to keep the public files out of version control, for example, if they are generated or not needed in the repository.
```bash
git add . ':!src/public/**'
```

### Nunjucks date filter
To format dates in Nunjucks, you can use the `date` filter. For example, to format a date in the `YYYY-MM-DD` format, you can use the following syntax:
```nunjucks
{{ post.date | date("YYYY-MM-DD") }}
```
To install the date filter, you can use the `nunjucks-date` package:
```bash
npm install nunjucks-date
```
You can import it in your `src/index.ts` file like this:
```typescript
const nunjucksDateFilter = require('nunjucks-date-filter');
```
If you are using TypeScript, you may need to install the type definitions for the package:

There is no official type definition for `nunjucks-date-filter`, but you can create a custom type definition file.
If you want to import nunjucks-date as ESM module, you need to add the module declaration in types/global.d.ts:
```typescript
declare module 'nunjucks-date-filter' {
    function nunjucksDateFilter(date: string | Date | number, format?: string): string;
    export = nunjucksDateFilter;
}
```
Then you can import it in your `src/index.ts` file:
```typescript
import nunjucksDateFilter from 'nunjucks-date-filter';
```

Add the date filter to Nunjucks
```typescript
nunjucks.addFilter('date', nunjucksDateFilter);
```

### ts-node don't see types/global.d.ts
If you have a `types/global.d.ts` file and `ts-node` is not recognizing it, you can specify the type roots in your `tsconfig.json` file:
```json
{
    "ts-node": {
        "files": true
    }
}
```
This tells `ts-node` to include all files in the project, including type definition files. 

Why ts-node doesn't see the `types/global.d.ts` file by default is because it only includes files that are explicitly referenced in the project or files that are part of the compilation process. By setting `files: true`, you ensure that all files, including type definitions, are included.
