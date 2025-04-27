// import OpenAI from 'openai'; // <-- Remove this unused import

// 旧的直接调用 OpenAI 的函数 (保留注释或删除)
/*
async function getChatCompletion_direct(messages, apiKey, model, temperature, maxTokens) {
  if (!apiKey) {
    throw new Error('API Key is missing');
  }
  const openai = new OpenAI({ apiKey: apiKey, dangerouslyAllowBrowser: true });
  try {
    const completion = await openai.chat.completions.create({
      model: model,
      messages: messages,
      temperature: temperature,
      max_tokens: maxTokens,
    });
    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}
*/

// 新的调用后端代理的函数
async function getChatCompletion(messages, model, temperature, maxTokens) {
  console.log('[getChatCompletion] Preparing to call backend proxy /api/chat 喵~');
  try {
    const response = await fetch('/api/chat', { // 调用后端的 /api/chat 端点
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ // 发送所需的数据
        messages: messages,
        model: model,
        temperature: temperature,
        max_tokens: maxTokens // 注意 OpenAI Node 库用 max_tokens, 前端之前用的 maxTokens
      }),
    });

    if (!response.ok) {
      // 尝试解析后端返回的错误信息
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // 如果无法解析 JSON，使用状态文本
        throw new Error(`喵呜! Backend request failed: ${response.statusText}`);
      }
      throw new Error(`喵! Backend error: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('[getChatCompletion] Received response from backend proxy 喵~', data);
    return data.completion; // 后端返回的数据结构是 { completion: "..." }

  } catch (error) {
    console.error('调用后端聊天代理失败喵 (｡>﹏<｡):', error);
    throw error; // 将错误继续抛出，让调用者处理
  }
}

export { getChatCompletion }; 