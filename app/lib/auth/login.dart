import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class LoginPage extends StatefulWidget {
  const LoginPage({super.key});

  @override
  State<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends State<LoginPage> {

  int roleIndex = 0;
  bool showPassword = false;
  bool loading = false;

  final usernameController = TextEditingController();
  final passwordController = TextEditingController();
  final lawyerIdController = TextEditingController();

  final roles = ["User", "Lawyer"];

  static const indigo = Color(0xFF4F46E5);
  static const violet = Color(0xFF7C3AED);

  /// 🔴 CHANGE THIS
  final String baseUrl = "http://10.218.83.218:8000/api";

  Future<void> handleLogin() async {

    setState(() => loading = true);

    try {

      final role = roles[roleIndex].toLowerCase();

      final payload = {
        "role": role,
        "identifier": usernameController.text.trim(),
        "password": passwordController.text.trim(),
      };

      if (role == "lawyer") {
        payload["lawyer_id"] = lawyerIdController.text.trim();
      }

      final res = await http.post(
        Uri.parse("$baseUrl/auth/login/"),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode(payload),
      );

      final json = jsonDecode(res.body);

      if (res.statusCode != 200) {
        throw json["detail"] ?? "Login failed";
      }

      /// ✅ Success
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Login successful")),
      );

      /// 🔁 Navigate based on role
      if (json["role"] == "lawyer") {
        Navigator.pushReplacementNamed(context, "/lawyerDashboard");
      } else if (json["role"] == "user") {
        Navigator.pushReplacementNamed(context, "/userDashboard");
      } else {
        Navigator.pushReplacementNamed(context, "/");
      }

    } catch (e) {

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.toString())),
      );

    }

    setState(() => loading = false);
  }

  @override
  Widget build(BuildContext context) {

    return Scaffold(

      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),

          child: Column(
            children: [

              const SizedBox(height: 30),

              /// LOGO
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: const [
                  Icon(Icons.balance, color: indigo),
                  SizedBox(width: 6),
                  Text(
                    "LegalEase",
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),

              const SizedBox(height: 30),

              /// CARD
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(20),
                  boxShadow: [
                    BoxShadow(
                      blurRadius: 12,
                      color: Colors.black.withOpacity(0.05),
                    )
                  ],
                ),

                child: Column(
                  children: [

                    const Text(
                      "Welcome back",
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),

                    const SizedBox(height: 20),

                    /// ROLE TOGGLE
                    Container(
                      decoration: BoxDecoration(
                        color: Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        children: List.generate(roles.length, (index) {

                          final selected = roleIndex == index;

                          return Expanded(
                            child: GestureDetector(
                              onTap: () {
                                setState(() => roleIndex = index);
                              },
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 250),
                                padding: const EdgeInsets.symmetric(vertical: 10),
                                decoration: BoxDecoration(
                                  gradient: selected
                                      ? const LinearGradient(
                                          colors: [indigo, violet])
                                      : null,
                                  borderRadius: BorderRadius.circular(10),
                                ),
                                child: Center(
                                  child: Text(
                                    roles[index],
                                    style: TextStyle(
                                      color: selected
                                          ? Colors.white
                                          : Colors.grey[700],
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ),
                              ),
                            ),
                          );
                        }),
                      ),
                    ),

                    const SizedBox(height: 20),

                    /// USERNAME
                    _input("Username", usernameController),

                    const SizedBox(height: 15),

                    /// LAWYER ID
                    if (roles[roleIndex] == "Lawyer")
                      Column(
                        children: [
                          _input("Lawyer ID", lawyerIdController),
                          const SizedBox(height: 15),
                        ],
                      ),

                    /// PASSWORD
                    TextField(
                      controller: passwordController,
                      obscureText: !showPassword,
                      decoration: _inputDecoration("Password").copyWith(
                        suffixIcon: IconButton(
                          icon: Icon(
                            showPassword
                                ? Icons.visibility_off
                                : Icons.visibility,
                          ),
                          onPressed: () {
                            setState(() => showPassword = !showPassword);
                          },
                        ),
                      ),
                    ),

                    const SizedBox(height: 25),

                    /// BUTTON
                    GestureDetector(
                      onTap: loading ? null : handleLogin,
                      child: Container(
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        decoration: BoxDecoration(
                          gradient: const LinearGradient(
                            colors: [indigo, violet],
                          ),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Center(
                          child: loading
                              ? const CircularProgressIndicator(color: Colors.white)
                              : Text(
                                  "Sign in as ${roles[roleIndex]}",
                                  style: const TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                        ),
                      ),
                    ),

                    const SizedBox(height: 15),

                    /// SIGNUP
                    TextButton(
                      onPressed: () {
                        Navigator.pushNamed(context, "/signup");
                      },
                      child: const Text("Don't have an account? Sign up"),
                    )
                  ],
                ),
              )
            ],
          ),
        ),
      ),
    );
  }

  Widget _input(String hint, TextEditingController controller) {
    return TextField(
      controller: controller,
      decoration: _inputDecoration(hint),
    );
  }

  InputDecoration _inputDecoration(String hint) {
    return InputDecoration(
      hintText: hint,
      contentPadding: const EdgeInsets.symmetric(
        horizontal: 14,
        vertical: 12,
      ),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      focusedBorder: const OutlineInputBorder(
        borderRadius: BorderRadius.all(Radius.circular(12)),
        borderSide: BorderSide(color: indigo, width: 2),
      ),
    );
  }
}