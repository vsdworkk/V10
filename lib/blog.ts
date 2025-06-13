import fs from "fs"
import path from "path"
import rehypePrettyCode from "rehype-pretty-code"
import rehypeStringify from "rehype-stringify"
import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import remarkRehype from "remark-rehype"
import { unified } from "unified"
import { Post, BlogPostData } from "@/types"

function calculateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const words = content.trim().split(/\s+/).length
  const readingTime = Math.ceil(words / wordsPerMinute)
  return readingTime
}

function parseFrontmatter(fileContent: string) {
  let frontmatterRegex = /---\s*([\s\S]*?)\s*---/
  let match = frontmatterRegex.exec(fileContent)
  let frontMatterBlock = match![1]
  let content = fileContent.replace(frontmatterRegex, "").trim()
  let frontMatterLines = frontMatterBlock.trim().split("\n")
  let metadata: any = {}

  frontMatterLines.forEach(line => {
    let [key, ...valueArr] = line.split(": ")
    let value = valueArr.join(": ").trim()
    value = value.replace(/^['"](.*)['"]$/, "$1") // Remove quotes

    // Handle arrays for categories and tags
    if (key.trim() === "categories" || key.trim() === "tags") {
      if (value.startsWith("[") && value.endsWith("]")) {
        // Parse array format: ["item1", "item2"]
        const arrayValue = value
          .slice(1, -1)
          .split(",")
          .map(item => item.trim().replace(/^['"](.*)['"]$/, "$1"))
          .filter(item => item.length > 0)
        metadata[key.trim()] = arrayValue
      } else {
        // Single value, convert to array
        metadata[key.trim()] = [value]
      }
    } else {
      metadata[key.trim()] = value
    }
  })

  return { data: metadata as Post, content }
}

function getMDXFiles(dir: string) {
  return fs.readdirSync(dir).filter(file => path.extname(file) === ".mdx")
}

export async function markdownToHTML(markdown: string) {
  const p = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rehypePrettyCode, {
      theme: {
        light: "min-light",
        dark: "min-dark"
      },
      keepBackground: false
    })
    .use(rehypeStringify)
    .process(markdown)

  return p.toString()
}

export async function getPost(slug: string): Promise<BlogPostData> {
  const filePath = path.join("content", `${slug}.mdx`)
  const source = fs.readFileSync(filePath, "utf-8")
  const { content: rawContent, data: metadata } = parseFrontmatter(source)
  const content = await markdownToHTML(rawContent)
  const defaultImage = `/og?title=${encodeURIComponent(metadata.title)}`
  const readingTime = calculateReadingTime(rawContent)

  return {
    source: content,
    ...metadata,
    image: metadata.image || defaultImage,
    readingTime,
    slug
  } as BlogPostData
}

async function getAllPosts(dir: string): Promise<BlogPostData[]> {
  const mdxFiles = getMDXFiles(dir)
  return Promise.all(
    mdxFiles.map(async file => {
      const slug = path.basename(file, path.extname(file))
      return await getPost(slug)
    })
  )
}

export async function getBlogPosts(): Promise<Post[]> {
  try {
    const posts = await getAllPosts(path.join(process.cwd(), "content"))
    return posts.map(({ source, ...post }) => post) // Remove source for listing
  } catch (error) {
    console.error("Error getting blog posts:", error)
    return []
  }
}

export async function getUniqueCategoriesAndTags(): Promise<{
  categories: string[]
  tags: string[]
}> {
  try {
    const posts = await getBlogPosts()
    const categories = new Set<string>()
    const tags = new Set<string>()

    posts.forEach(post => {
      post.categories?.forEach(cat => categories.add(cat))
      post.tags?.forEach(tag => tags.add(tag))
    })

    return {
      categories: Array.from(categories).sort(),
      tags: Array.from(tags).sort()
    }
  } catch (error) {
    console.error("Error getting categories and tags:", error)
    return { categories: [], tags: [] }
  }
}
