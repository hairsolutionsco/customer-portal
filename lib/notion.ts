/**
 * Notion Integration Module
 *
 * This module handles secure access to Notion content.
 * SECURITY: Always filter content by customer mapping to prevent data leaks.
 *
 * TODO: Add Notion credentials to .env:
 * - NOTION_API_KEY
 * - NOTION_HELP_DATABASE_ID
 */

import { Client } from '@notionhq/client'

interface NotionPage {
  id: string
  title: string
  content: string
  lastEdited: Date
}

class NotionClient {
  private client: Client | null = null

  constructor() {
    const apiKey = process.env.NOTION_API_KEY

    if (!apiKey) {
      console.warn('⚠️ NOTION_API_KEY not configured. Add to .env file.')
      return
    }

    this.client = new Client({ auth: apiKey })
  }

  /**
   * SECURITY: Get customer-specific Notion resources only
   * This function enforces that we only fetch pages explicitly mapped to the customer
   */
  async getCustomerNotionResources(userId: string): Promise<NotionPage[]> {
    if (!this.client) {
      console.warn('[Notion] Client not initialized')
      return []
    }

    const { prisma } = await import('./prisma')

    // Get all Notion page IDs mapped to this customer
    const mappings = await prisma.customerNotionResource.findMany({
      where: { userId },
    })

    if (mappings.length === 0) {
      return []
    }

    // Fetch each page individually (ensures we only get what's mapped)
    const pages = await Promise.all(
      mappings.map(async (mapping) => {
        try {
          const page = await this.client!.pages.retrieve({
            page_id: mapping.notionPageId,
          })

          const blocks = await this.client!.blocks.children.list({
            block_id: mapping.notionPageId,
          })

          // Convert blocks to markdown (simplified)
          const content = this.blocksToMarkdown(blocks.results)

          return {
            id: mapping.notionPageId,
            title: mapping.title,
            content,
            lastEdited: new Date(mapping.updatedAt),
          }
        } catch (error) {
          console.error(`[Notion] Error fetching page ${mapping.notionPageId}:`, error)
          return null
        }
      })
    )

    return pages.filter((p): p is NotionPage => p !== null)
  }

  /**
   * Get general help articles from a public knowledge database
   * This syncs articles to our database for better performance and filtering
   */
  async syncHelpArticles() {
    if (!this.client) {
      console.warn('[Notion] Client not initialized')
      return
    }

    const databaseId = process.env.NOTION_HELP_DATABASE_ID

    if (!databaseId) {
      console.warn('[Notion] NOTION_HELP_DATABASE_ID not configured')
      return
    }

    try {
      const { prisma } = await import('./prisma')

      // Query the database
      const response = await this.client.databases.query({
        database_id: databaseId,
        filter: {
          property: 'Published',
          checkbox: {
            equals: true,
          },
        },
      })

      // Process each page
      for (const page of response.results) {
        if (!('properties' in page)) continue

        const title = this.getPropertyValue(page.properties.Title)
        const category = this.getPropertyValue(page.properties.Category)
        const slug = this.slugify(title)

        // Fetch page content
        const blocks = await this.client.blocks.children.list({
          block_id: page.id,
        })

        const content = this.blocksToMarkdown(blocks.results)

        // Upsert to database
        await prisma.helpArticle.upsert({
          where: { notionPageId: page.id },
          update: {
            title,
            content,
            category,
            lastSynced: new Date(),
          },
          create: {
            notionPageId: page.id,
            title,
            slug,
            content,
            category,
            isPublished: true,
            lastSynced: new Date(),
          },
        })
      }

      console.log(`[Notion] Synced ${response.results.length} help articles`)
    } catch (error) {
      console.error('[Notion] Error syncing help articles:', error)
    }
  }

  /**
   * Get a specific Notion page (with security check)
   * Only returns page if user has access
   */
  async getPageForUser(userId: string, pageId: string): Promise<NotionPage | null> {
    if (!this.client) return null

    const { prisma } = await import('./prisma')

    // SECURITY: Verify user has access to this page
    const mapping = await prisma.customerNotionResource.findUnique({
      where: {
        userId_notionPageId: {
          userId,
          notionPageId: pageId,
        },
      },
    })

    if (!mapping) {
      console.warn(`[Notion] Access denied: User ${userId} tried to access page ${pageId}`)
      return null
    }

    try {
      const page = await this.client.pages.retrieve({ page_id: pageId })
      const blocks = await this.client.blocks.children.list({ block_id: pageId })
      const content = this.blocksToMarkdown(blocks.results)

      return {
        id: pageId,
        title: mapping.title,
        content,
        lastEdited: new Date(),
      }
    } catch (error) {
      console.error('[Notion] Error fetching page:', error)
      return null
    }
  }

  /**
   * Convert Notion blocks to markdown (simplified)
   * TODO: Enhance this for more block types
   */
  private blocksToMarkdown(blocks: any[]): string {
    return blocks
      .map((block) => {
        const type = block.type

        switch (type) {
          case 'paragraph':
            return this.richTextToMarkdown(block.paragraph.rich_text) + '\n\n'
          case 'heading_1':
            return '# ' + this.richTextToMarkdown(block.heading_1.rich_text) + '\n\n'
          case 'heading_2':
            return '## ' + this.richTextToMarkdown(block.heading_2.rich_text) + '\n\n'
          case 'heading_3':
            return '### ' + this.richTextToMarkdown(block.heading_3.rich_text) + '\n\n'
          case 'bulleted_list_item':
            return '- ' + this.richTextToMarkdown(block.bulleted_list_item.rich_text) + '\n'
          case 'numbered_list_item':
            return '1. ' + this.richTextToMarkdown(block.numbered_list_item.rich_text) + '\n'
          case 'code':
            const code = this.richTextToMarkdown(block.code.rich_text)
            return '```' + block.code.language + '\n' + code + '\n```\n\n'
          default:
            return ''
        }
      })
      .join('')
  }

  /**
   * Convert Notion rich text to plain markdown
   */
  private richTextToMarkdown(richText: any[]): string {
    return richText
      .map((text) => {
        let content = text.plain_text

        if (text.annotations.bold) content = `**${content}**`
        if (text.annotations.italic) content = `*${content}*`
        if (text.annotations.code) content = `\`${content}\``

        if (text.href) content = `[${content}](${text.href})`

        return content
      })
      .join('')
  }

  /**
   * Get property value from Notion database row
   */
  private getPropertyValue(property: any): string {
    switch (property.type) {
      case 'title':
        return property.title.map((t: any) => t.plain_text).join('')
      case 'rich_text':
        return property.rich_text.map((t: any) => t.plain_text).join('')
      case 'select':
        return property.select?.name || ''
      case 'multi_select':
        return property.multi_select.map((s: any) => s.name).join(', ')
      default:
        return ''
    }
  }

  /**
   * Create URL-friendly slug
   */
  private slugify(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim()
  }
}

export const notion = new NotionClient()

/**
 * Add a Notion page mapping for a customer (ADMIN only)
 * This is how you grant a customer access to specific Notion content
 */
export async function addCustomerNotionResource(
  userId: string,
  notionPageId: string,
  type: 'HELP_ARTICLE' | 'CARE_GUIDE' | 'PERSONAL_NOTE',
  title: string
) {
  const { prisma } = await import('./prisma')

  return prisma.customerNotionResource.create({
    data: {
      userId,
      notionPageId,
      type,
      title,
    },
  })
}
