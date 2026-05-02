import 'package:flutter/material.dart';
import 'app_router.dart';

void main() {
  runApp(const LegalEaseApp());
}

class LegalEaseApp extends StatelessWidget {
  const LegalEaseApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,

      title: "LegalEase",

      theme: ThemeData(
        brightness: Brightness.light,
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),

        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF4F46E5),
          brightness: Brightness.light,
        ),
      ),

      initialRoute: '/', // ✅ Landing page loads first

      onGenerateRoute: AppRouter.onGenerateRoute,
    );
  }
}