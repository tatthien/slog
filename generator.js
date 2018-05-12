const fs = require('fs-extra')
const matter = require('gray-matter')
const mustache = require('mustache')
const formatDate = require('date-fns/format')
const yaml = require('js-yaml')
const hljs = require('highlight.js')

// Config markdown with highlight.js
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
 * Get site configuration
 */
const getConfig = () => {
  try {
    var config = yaml.safeLoad(fs.readFileSync(__dirname + '/config.yml'))
  } catch (e) {
    console.log(e)
  }
  return config
}
var config = getConfig()

/**
 * Get data for layout template
 * 
 * @param {Object} options 
 */
const getLayoutData = (options) => {
  let layoutData = {
    site_title: config.site_title,
    site_desc: config.site_desc,
    footer: config.footer,
    pages: config.pages
  }
  return Object.assign(options, layoutData)
}

const formatPostDate = date => {
  date = date.split('-')
  return formatDate(new Date(
    date[2],
    date[1] - 1,
    date[0]
  ), config.date_format)
}

/**
 * Format post object
 * 
 * @param {Object} post 
 */
const formatPost = post => {
  post.content = md.render(post.content)
  post.data.published = formatPostDate(post.data.published)
  post.data.updated = formatPostDate(post.data.updated)
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
    html = mustache.render(layoutTemplate, getLayoutData({
      title: post.data.title,
      class: {
        body: 'home',
        container: 'post'
      },
      content: html
    }))

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
  fs.readdir(__dirname + '/' + folder, '', (err, files) => {
    if (! fs.existsSync(__dirname + '/' + folder)) return
    files.forEach(file => {
      writePost(folder, file)
    })
  }) 
}

/**
 * Generate index.html
 */
const generateIndex = () => {
  // Read home.yml
  try {
    var home = yaml.safeLoad(fs.readFileSync(__dirname + '/home.yml', 'utf-8'))
  } catch (e) {
    console.log(e)
  }

  let indexContent = ''
  let posts = home.posts
  
  // Order posts by year
  Object.keys(posts).reverse().forEach(key => {
    if (posts.hasOwnProperty(key)) {
      let year = posts[key]
      indexContent += '<div class="year"><h1>'+ key +'</h1>'
      year.forEach((p, i) => {
        indexContent += `<p>${++i}. <a href="/posts/${p.slug}.html">${p.title}</a></p>`
      })
      indexContent += '</div>'
    }
  })

  let html = mustache.render(layoutTemplate, getLayoutData({
    title: 'Home',
    class: {
      body: 'home',
      container: 'post-list'
    },
    content: indexContent
  }))

  fs.writeFile(__dirname + '/public/index.html', html, err => {
    if (err) throw err;
  })
}

/**
 * Start generating
 */
fs.remove(__dirname + '/public', () => {
  fs.mkdir(__dirname + '/public')
  // Copy static to public/static
  fs.copy(__dirname + '/static', __dirname + '/public/static')
  generateIndex()
  generateStaticContent('posts')
  generateStaticContent('pages')
})
