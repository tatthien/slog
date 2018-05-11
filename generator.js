const fs = require('fs')
const matter = require('gray-matter')
const mustache = require('mustache')
const formatDate = require('date-fns/format')
const yaml = require('js-yaml')
const rm = require('rimraf')
const hljs = require('highlight.js')
const md = require('markdown-it')({
  highlight (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs '+ lang +'"><code>' + hljs.highlight(lang, str).value + '</code></pre>';
      } catch (__) {}
    }
  } 
})

const PUBLIC_PATH = __dirname  + '/public'
const TEMPLATE_PATH = __dirname + '/templates'

// Template content
let layoutTemplate = fs.readFileSync(TEMPLATE_PATH + '/layout.html', 'utf-8')
let singleTemplate = fs.readFileSync(TEMPLATE_PATH + '/single.html', 'utf-8')

/**
 * Format post object
 * 
 * @param {Object} post 
 */
const formatPost = post => {
  post.content = md.render(post.content)
  post.data.published = formatDate(new Date(post.data.published), 'MMM DD, YYYY')
  post.data.updated = formatDate(new Date(post.data.updated), 'MMM DD, YYYY')
  return post
}

/**
 * Convert mardown file to html file
 * 
 * @param {String} folder 
 * @param {String} file 
 */
const writePost = (folder, file) => {
  fs.readFile(folder + '/' + file, 'utf-8', (err, data) => {
    if (err) throw error;
    
    let post = formatPost(matter(data))
    
    let html = mustache.render(singleTemplate, post)
    html = mustache.render(layoutTemplate, {
      title: post.data.title,
      class: {
        body: 'home',
        container: 'post'
      },
      content: html
    })

    let folderName = PUBLIC_PATH + '/' + folder

    // Create folder if it doesn't exist
    if (! fs.existsSync(folderName)) {
      fs.mkdirSync(folderName)
    }
    let fileName = folderName + '/' + file.replace('md', 'html')

    // Write the html content
    fs.writeFile(fileName, html, err => {
      if (err) throw err;
      console.log(`${fileName} has been created.`)
    })
  })
}

/**
 * Generate all markdown content to html
 * 
 * @param {String} folder 
 */
const generateStaticContent = folder => {
  rm.sync(PUBLIC_PATH + '/' + folder)
  fs.readdir(__dirname + '/' + folder, '', (err, files) => {
    files.forEach(file => {
      writePost(folder, file)
    })
  }) 
}

/**
 * Generate index.html
 */
const generateIndex = () => {
  // Read index.yml
  try {
    var index = yaml.safeLoad(fs.readFileSync('index.yml', 'utf-8'))
  } catch (e) {
    console.log(e)
  }

  let indexContent = ''
  for (let key in index.posts) {
    if (index.posts.hasOwnProperty(key)) {
      let year = index.posts[key]
      indexContent += '<div class="year"><h1>'+ key +'</h1>'
      year.forEach((item, i) => {
        indexContent += `<p>${++i}. <a href="/posts/${item.slug}.html">${item.title}</a></p>`
      })
      indexContent += '</div>'
    }
  }

  let html = mustache.render(layoutTemplate, {
    title: 'Home',
    class: {
      body: 'home',
      container: 'post-list'
    },
    content: indexContent
  })

  fs.writeFile('public/index.html', html, err => {
    if (err) throw err;
    console.log('public/index.html has been created.')
  })
}

/**
 * Start generating
 */
generateIndex()
generateStaticContent('posts')
generateStaticContent('pages')
