import 'package:flutter/material.dart';
import 'user_app/pages/user_home.dart';

void main() {
  runApp(const LegalEaseApp());
}

class LegalEaseApp extends StatelessWidget {
  const LegalEaseApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        useMaterial3: true,
        scaffoldBackgroundColor: const Color(0xFF0E1116),
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1E88E5),
          brightness: Brightness.dark,
        ),
      ),
      home: const UserHomePage(),
    );
  }
}
// HomePage and _ActionCard moved to user_app/pages/user_home.dart
