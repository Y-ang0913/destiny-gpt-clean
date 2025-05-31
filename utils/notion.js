import { Client } from '@notionhq/client'

const notion = new Client({ auth: process.env.NOTION_API_KEY })

export async function writeToNotion({ question, reply, time, source, note }) {
  await notion.pages.create({
    parent: { database_id: process.env.NOTION_DATABASE_ID },
    properties: {
      Name: { title: [{ text: { content: question.slice(0, 50) } }] },
      '用户输入': { rich_text: [{ text: { content: question } }] },
      '回复内容': { rich_text: [{ text: { content: reply } }] },
      '提问时间': { date: { start: time } },
      '来源渠道': { rich_text: [{ text: { content: source } }] },
      '系统备注': { rich_text: [{ text: { content: note } }] }
    }
  })
}
