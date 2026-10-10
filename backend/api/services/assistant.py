from django.conf import settings
from google import genai
from google.genai import types

SYSTEM_PROMPT = """Bạn là "Sensei AI", trợ lý học tiếng Nhật trong ứng dụng 日本語 Learning.

Quy tắc:
- Trả lời bằng tiếng Việt. Ví dụ tiếng Nhật phải kèm hiragana và nghĩa tiếng Việt.
- Giải thích ngắn gọn, đúng với trình độ của người học: {level}.
- Khi người học viết câu tiếng Nhật, hãy sửa lỗi và giải thích vì sao sai.
- Chỉ trả lời các câu hỏi liên quan đến học tiếng Nhật. Với chủ đề khác, nhẹ nhàng đưa cuộc trò chuyện về việc học.
- Trả lời bằng văn bản thuần, không dùng ký hiệu markdown như ** hoặc #. Khi cần liệt kê thì dùng dấu gạch đầu dòng "-".
"""


def ask_assistant(messages, level="N5"):
    client = genai.Client()

    contents = [
        types.Content(
            role="model" if m["role"] == "assistant" else "user",
            parts=[types.Part(text=m["content"])],
        )
        for m in messages
    ]

    response = client.models.generate_content(
        model=settings.ASSISTANT_MODEL,
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=SYSTEM_PROMPT.format(level=level or "N5"),
        ),
    )
    return response.text or ""