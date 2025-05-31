// pages/api/log-to-notion.js

import { Client } from '@notionhq/client';

const notion = new Client({ auth: process.env.NOTION_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userInput, persona, response, timestamp, source, notes } = req.body;

  // 调用 OpenAI API（使用原生 fetch）
  try {
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: '你是命理师GPT，请基于用户提问提供专业分析。' },
          { role: 'user', content: userInput }
        ]
      })
    });

    const result = await openaiResponse.json();

    const aiReply = result.choices?.[0]?.message?.content || '[未生成回复]';

    // 写入 Notion 日志数据库
    const notionResponse = await notion.pages.create({
      parent: {
        database_id: process.env.NOTION_DATABASE_ID,
      },
      properties: {
        '用户输入': {
          title: [
            {
              text: {
                content: userInput,
              },
            },
          ],
        },
        '人格链': {
          multi_select: persona?.map((item) => ({ name: item })) || [],
        },
        '回复内容': {
          rich_text: [
            {
              text: {
                content: aiReply,
              },
            },
          ],
        },
        '提问时间': {
          date: {
            start: timestamp,
          },
        },
        '来源渠道': {
          rich_text: [
            {
              text: {
                content: source || '未知',
              },
            },
          ],
        },
        '系统备注': {
          rich_text: [
            {
              text: {
                content: notes || '',
              },
            },
          ],
        },
      },
    });

    res.status(200).json({
      message: '写入成功',
      reply: aiReply,
      notionResponse,
    });

  } catch (error) {
    console.error('日志写入失败:', error);
    res.status(500).json({ error: '日志写入失败', detail: error.message });
  }
}
