import 'package:flutter/material.dart';
import '../widgets/user_background.dart';

class UserAiChatPage extends StatefulWidget {
  const UserAiChatPage({super.key});

  @override
  State<UserAiChatPage> createState() => _UserAiChatPageState();
}

class _UserAiChatPageState extends State<UserAiChatPage> {
  final TextEditingController _controller = TextEditingController();

  final List<Map<String, dynamic>> _messages = [
    {
      "text": "Hello 👋 I'm your AI legal assistant. How can I help you today?",
      "isUser": false,
    },
  ];

  void _sendMessage() {
    if (_controller.text.trim().isEmpty) return;

    setState(() {
      _messages.add({
        "text": _controller.text.trim(),
        "isUser": true,
      });
    });

    String userMessage = _controller.text.trim();
    _controller.clear();

    // Fake AI response (replace later with API call)
    Future.delayed(const Duration(milliseconds: 700), () {
      setState(() {
        _messages.add({
          "text": "AI response for: \"$userMessage\"",
          "isUser": false,
        });
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Scaffold(
      backgroundColor: Colors.transparent,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text("AI Assistant"),
        centerTitle: true,
      ),
      body: UserBackground(
        child: Column(
          children: [

          /// Chat Messages
            Expanded(
              child: ListView.builder(
                padding: const EdgeInsets.all(16),
                itemCount: _messages.length,
                itemBuilder: (context, index) {
                  final message = _messages[index];
                  final isUser = message["isUser"];

                  return Align(
                    alignment:
                        isUser ? Alignment.centerRight : Alignment.centerLeft,
                    child: Container(
                      margin: const EdgeInsets.symmetric(vertical: 6),
                      padding: const EdgeInsets.all(14),
                      constraints: const BoxConstraints(maxWidth: 280),
                      decoration: BoxDecoration(
                        color: isUser
                            ? cs.primary
                            : const Color(0xFF1B1F27),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Text(
                        message["text"],
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 14,
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),

          /// Input Field
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              color: const Color(0xFF151A22),
              child: SafeArea(
                child: Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: _controller,
                        style: const TextStyle(color: Colors.white),
                        decoration: const InputDecoration(
                          hintText: "Ask something...",
                          hintStyle: TextStyle(color: Colors.white54),
                          border: InputBorder.none,
                        ),
                        onSubmitted: (_) => _sendMessage(),
                      ),
                    ),
                    IconButton(
                      icon: Icon(Icons.send, color: cs.primary),
                      onPressed: _sendMessage,
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
