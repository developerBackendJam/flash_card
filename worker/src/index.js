const corsHeaders = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "POST, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type",
};

/**
 * Tạo system prompt chuyên biệt.
 * AI trò chuyện đa năng về MỌI chủ đề, ghi nhớ hội thoại và chỉ dùng từ vựng khi người dùng chủ động hỏi.
 */
function buildSystemPrompt(card) {
	const word = card?.front ?? card?.word ?? "";
	const ipa = card?.pronunciation ?? card?.ipa ?? "";
	const pos = card?.part_of_speech ?? card?.partOfSpeech ?? "";
	const meaning = card?.meaning ?? "";
	const exampleEn = card?.example_sentence ?? card?.exampleEn ?? "";
	const exampleVi = card?.example_translation ?? card?.exampleVi ?? "";

	let synonyms = "";
	if (Array.isArray(card?.synonyms)) {
		synonyms = card.synonyms.join(", ");
	} else if (typeof card?.synonyms === "string") {
		synonyms = card.synonyms.replace(/[{}"]/g, "").replace(/,/g, ", ");
	}

	const cardContext = word
		? `
## Ngữ cảnh học tập hiện tại (CHỈ THAM KHẢO KHI ĐƯỢC HỎI):
- Thẻ flashcard người dùng đang mở: "${word}" ${ipa ? `(${ipa})` : ""} - Loại từ: ${pos || "không rõ"} - Nghĩa: ${meaning || "không rõ"}
- Ví dụ: ${exampleEn || "chưa có"}${exampleVi ? ` (${exampleVi})` : ""}
- Từ đồng nghĩa: ${synonyms || "chưa có"}
`
		: "";

	return `Bạn là LexiBot — trợ lý AI thông minh, thân thiện, có khả năng trò chuyện sâu sắc và nhớ toàn bộ ngữ cảnh hội thoại với người dùng.

## NGUYÊN TẮC QUAN TRỌNG NHẤT:
1. **TRÒ CHUYỆN VỀ MỌI CHỦ ĐỀ**: Người dùng có thể trò chuyện với bạn về BẤT KỲ điều gì (đời sống, tâm sự, công nghệ, lập trình, khoa học, lịch sử, văn hóa, giải trí, toán học, ngoại ngữ...). Bạn hãy luôn cởi mở và nhiệt tình thảo luận theo đúng chủ đề người dùng đưa ra.
2. **TUYỆT ĐỐI KHÔNG ÉP TỪ VỰNG**: Mặc dù bạn nằm trong ứng dụng học flashcard, bạn **KHÔNG ĐƯỢC PHÉP** tự ý chèn hay bẻ lái cuộc trò chuyện sang từ vựng đang học nếu người dùng không hỏi. 
   - Nếu người dùng chào hỏi, hỏi về lập trình, hỏi về thời tiết, hỏi về cuộc sống... hãy trả lời thẳng vào câu hỏi đó một cách tự nhiên như một người bạn/chuyên gia.
   - CHỈ đề cập hoặc phân tích từ vựng đang học khi người dùng thực sự hỏi về nó hoặc yêu cầu hỗ trợ học tiếng Anh.
3. **TRÍ NHỚ & MẠCH HỘI THOẠI**: Luôn theo dõi các câu hỏi/câu trả lời trước đó trong cuộc hội thoại để hiểu ngữ cảnh, xưng hô đồng nhất và trả lời logic, liền mạch.

## TÍNH CÁCH & PHONG CÁCH
- Thân thiện, chu đáo, hiểu biết rộng và tự nhiên.
- Mặc định trả lời bằng tiếng Việt rõ ràng, lưu loát (trừ khi người dùng giao tiếp bằng tiếng Anh hoặc yêu cầu dùng tiếng Anh).
- Trình bày mạch lạc, có thể dùng gạch đầu dòng, ví dụ minh họa hoặc giải thích dễ hiểu khi cần.
${cardContext}`;
}

export default {
	async fetch(request, env) {

		// Xử lý CORS preflight
		if (request.method === "OPTIONS") {
			return new Response(null, {
				headers: corsHeaders,
			});
		}

		const url = new URL(request.url);

		if (url.pathname === "/api/chat" && request.method === "POST") {

			let body;
			try {
				body = await request.json();
			} catch {
				return Response.json(
					{ error: "Invalid JSON body" },
					{ status: 400, headers: corsHeaders }
				);
			}

			const { message, history = [], card } = body;

			if (!message || typeof message !== "string" || message.trim() === "") {
				return Response.json(
					{ error: "Message is required" },
					{ status: 400, headers: corsHeaders }
				);
			}

			const systemPrompt = buildSystemPrompt(card);

			// Xây dựng danh sách tin nhắn bao gồm ngữ cảnh lịch sử hội thoại
			const messagesForAI = [
				{
					role: "system",
					content: systemPrompt,
				},
			];

			// Lấy tối đa 12 lượt tin nhắn gần nhất để đảm bảo trí nhớ tốt mà không quá tải context
			if (Array.isArray(history)) {
				const recentHistory = history.slice(-12);
				for (const item of recentHistory) {
					if (item && item.content && typeof item.content === "string") {
						const role = item.role === "assistant" || item.role === "ai" ? "assistant" : "user";
						messagesForAI.push({
							role,
							content: item.content.trim(),
						});
					}
				}
			}

			// Thêm tin nhắn người dùng hiện tại (nếu chưa có trong history)
			const trimmedMessage = message.trim();
			const lastItem = messagesForAI[messagesForAI.length - 1];
			if (!lastItem || lastItem.role !== "user" || lastItem.content !== trimmedMessage) {
				messagesForAI.push({
					role: "user",
					content: trimmedMessage,
				});
			}

			let result;
			try {
				result = await env.AI.run(
					// Llama 3.3 70B FP8 Fast — context 128k tokens, hỗ trợ đa lượt hội thoại cực tốt
					"@cf/meta/llama-3.3-70b-instruct-fp8-fast",
					{
						messages: messagesForAI,
						max_tokens: 2048,
						temperature: 0.7,
					}
				);
			} catch (aiError) {
				console.error("AI inference error:", aiError);
				return Response.json(
					{ error: "AI inference failed", detail: String(aiError) },
					{ status: 502, headers: corsHeaders }
				);
			}

			const reply =
				result?.response ??
				result?.choices?.[0]?.message?.content ??
				"Xin lỗi, mình không thể tạo phản hồi lúc này.";

			return Response.json(
				{ reply },
				{ headers: corsHeaders }
			);
		}

		if (url.pathname === "/api/pronunciation" && request.method === "POST") {
			let body;
			try {
				body = await request.json();
			} catch {
				return Response.json(
					{ error: "Invalid JSON body" },
					{ status: 400, headers: corsHeaders }
				);
			}

			const { targetWord, spokenText, ipa = "", score = 0 } = body;

			if (!targetWord) {
				return Response.json(
					{ error: "targetWord is required" },
					{ status: 400, headers: corsHeaders }
				);
			}

			const cleanTarget = targetWord.trim();
			const cleanSpoken = (spokenText || "").trim();

			// Khởi tạo phản hồi thông minh bám sát đúng từ vựng đang học và những gì người dùng vừa đọc
			let feedback = "";
			let tip = "";
			let comparison = `Từ chuẩn: "${cleanTarget}" | Bạn đọc: "${cleanSpoken || "(chưa thu được)"}"`;

			if (!cleanSpoken) {
				feedback = `Chưa thu được âm thanh rõ ràng cho từ "${cleanTarget}". Bạn hãy kiểm tra lại micro và đọc to hơn nhé.`;
				tip = `Mẹo đọc từ "${cleanTarget}" ${ipa ? `(${ipa})` : ""}: Hãy lắng nghe loa phát âm mẫu và đọc dứt khoát từng âm tiết.`;
			} else if (cleanTarget.toLowerCase() === cleanSpoken.toLowerCase() || score >= 80) {
				feedback = `Tuyệt vời! Bạn đã phát âm từ "${cleanTarget}" rất chuẩn xác (${score}%). Âm sắc và ngữ điệu rất tự nhiên!`;
				tip = `Mẹo cho từ "${cleanTarget}" ${ipa ? `(${ipa})` : ""}: Tiếp tục duy trì độ tròn vành và bật hơi dứt khoát như vậy khi ghép vào câu.`;
			} else if (score >= 60) {
				feedback = `Bạn đọc thành "${cleanSpoken}", khá gần với từ "${cleanTarget}". Tuy nhiên máy phát hiện bạn có thể bị thiếu âm đuôi hoặc trọng âm chưa đủ rõ.`;
				tip = `Mẹo khẩu hình cho từ "${cleanTarget}" ${ipa ? `(${ipa})` : ""}: Hãy chú ý bật rõ âm cuối và nhấn đúng trọng âm của từ.`;
			} else {
				feedback = `Bạn đã đọc thành "${cleanSpoken}" thay vì "${cleanTarget}". Phát âm đang bị lệch sang một từ hoặc âm tiết khác.`;
				tip = `Mẹo khẩu hình cho từ "${cleanTarget}" ${ipa ? `(${ipa})` : ""}: Hãy bấm nút Loa 🔊 để nghe kỹ khẩu hình âm đầu và nguyên âm chính trước khi đọc lại.`;
			}

			// Gọi Cloudflare Worker AI Llama 3.3 70B để phân tích khẩu hình sâu hơn
			const prompt = `Bạn là Chuyên gia luyện phát âm tiếng Anh cho người Việt (Pronunciation Coach).
Học viên vừa đọc từ vựng tiếng Anh sau:

- Từ chuẩn cần đọc: "${cleanTarget}"
- Phiên âm IPA chuẩn: "${ipa || "chưa rõ"}"
- Từ máy nhận diện được từ giọng đọc: "${cleanSpoken || "(không nghe rõ)"}"
- Điểm so khớp: ${score}%

Nhiệm vụ của bạn:
1. "feedback": CHỈ RÕ CỤ THỂ LỖI SAI theo đúng những gì học viên đã đọc ("${cleanSpoken}") so với từ chuẩn ("${cleanTarget}"). Nếu đọc đúng thì khen ngợi âm nào họ làm tốt.
2. "tip": HƯỚNG DẪN MẸO KHẨU HÌNH CỤ THỂ CHO CHÍNH TỪ "${cleanTarget}" (cách đặt lưỡi, chu môi, bật hơi hoặc nhấn trọng âm cho từ này, tuyệt đối không viết chung chung).
3. "comparison": "Từ chuẩn: ${cleanTarget} | Bạn đọc: ${cleanSpoken}".

Trả về ĐÚNG định dạng JSON sau (không bọc trong thẻ markdown, không thêm giải thích ngoài JSON):
{
  "feedback": "...",
  "tip": "...",
  "comparison": "..."
}`;

			try {
				const aiResult = await env.AI.run(
					"@cf/meta/llama-3.3-70b-instruct-fp8-fast",
					{
						messages: [
							{
								role: "system",
								content: "Bạn là chuyên gia ngữ âm tiếng Anh, luôn trả về JSON hợp lệ với 3 trường: feedback, tip, comparison.",
							},
							{
								role: "user",
								content: prompt,
							},
						],
						max_tokens: 500,
						temperature: 0.3,
					}
				);

				// Xử lý an toàn kết quả trả về từ AI (chuỗi hoặc object)
				let textContent = "";
				if (typeof aiResult === "string") {
					textContent = aiResult;
				} else if (typeof aiResult?.response === "string") {
					textContent = aiResult.response;
				} else if (typeof aiResult?.response === "object" && aiResult.response !== null) {
					if (aiResult.response.feedback) feedback = aiResult.response.feedback;
					if (aiResult.response.tip) tip = aiResult.response.tip;
					if (aiResult.response.comparison) comparison = aiResult.response.comparison;
				} else if (typeof aiResult?.choices?.[0]?.message?.content === "string") {
					textContent = aiResult.choices[0].message.content;
				}

				if (textContent) {
					const jsonMatch = textContent.match(/\{[\s\S]*\}/);
					if (jsonMatch) {
						try {
							const parsed = JSON.parse(jsonMatch[0]);
							if (parsed.feedback && typeof parsed.feedback === "string") feedback = parsed.feedback;
							if (parsed.tip && typeof parsed.tip === "string") tip = parsed.tip;
							if (parsed.comparison && typeof parsed.comparison === "string") comparison = parsed.comparison;
						} catch (jsonParseErr) {
							console.warn("JSON parse error:", jsonParseErr);
						}
					}
				}
			} catch (aiErr) {
				console.warn("AI Pronunciation analysis fallback:", aiErr);
			}

			return Response.json(
				{
					targetWord: cleanTarget,
					spokenText: cleanSpoken,
					score,
					feedback,
					tip,
					comparison,
				},
				{ headers: corsHeaders }
			);
		}

		return Response.json(
			{ message: "LexiBot Chat & Pronunciation API is running 🚀" },
			{ headers: corsHeaders }
		);
	},
};