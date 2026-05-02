import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

class SignupPage extends StatefulWidget {
  const SignupPage({super.key});

  @override
  State<SignupPage> createState() => _SignupPageState();
}

class _SignupPageState extends State<SignupPage> {
  int roleIndex = 0;
  bool showPassword = false;

  final roles = ['User', 'Lawyer'];

  final TextEditingController nameCtrl = TextEditingController();
  final TextEditingController emailCtrl = TextEditingController();
  final TextEditingController phoneCtrl = TextEditingController();
  final TextEditingController usernameCtrl = TextEditingController();
  final TextEditingController passwordCtrl = TextEditingController();
  final TextEditingController lawyerIdCtrl = TextEditingController();

  final String baseUrl = "http://192.168.0.104:8000/api";

  Future<void> signup() async {
    final role = roles[roleIndex];

    String url;
    Map<String, dynamic> body;

    if (role == "User") {
      url = "$baseUrl/auth/signup/user/";
      body = {
        "cname": nameCtrl.text,
        "email": emailCtrl.text,
        "phone": phoneCtrl.text,
        "username": usernameCtrl.text,
        "password": passwordCtrl.text,
      };
    } else {
      url = "$baseUrl/auth/signup/lawyer/";
      body = {
        "lname": nameCtrl.text,
        "email": emailCtrl.text,
        "phone": phoneCtrl.text,
        "username": usernameCtrl.text,
        "password": passwordCtrl.text,
        "lawyer_id": lawyerIdCtrl.text,
      };
    }

    try {
      final res = await http.post(
        Uri.parse(url),
        headers: {"Content-Type": "application/json"},
        body: jsonEncode(body),
      );

      final data = jsonDecode(res.body);

      if (res.statusCode == 200 || res.statusCode == 201) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text("Signup successful")),
        );
        Navigator.pushReplacementNamed(context, '/login');
      } else {
        throw data;
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text("Signup failed: $e")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final gradient = const LinearGradient(
      colors: [Color(0xFF4F46E5), Color(0xFF7C3AED)],
    );

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      body: Center(
        child: SingleChildScrollView(
          child: Container(
            margin: const EdgeInsets.all(20),
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  blurRadius: 10,
                  color: Colors.black.withOpacity(0.05),
                )
              ],
            ),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [

                /// LOGO
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        gradient: gradient,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Icon(Icons.balance, color: Colors.white),
                    ),
                    const SizedBox(width: 8),
                    const Text(
                      "LegalEase",
                      style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                      ),
                    )
                  ],
                ),

                const SizedBox(height: 20),

                const Text(
                  "Create Account",
                  style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                ),

                const SizedBox(height: 16),

                /// ROLE SWITCH
                Row(
                  children: List.generate(2, (i) {
                    return Expanded(
                      child: GestureDetector(
                        onTap: () => setState(() => roleIndex = i),
                        child: Container(
                          padding: const EdgeInsets.symmetric(vertical: 10),
                          decoration: BoxDecoration(
                            gradient: roleIndex == i ? gradient : null,
                            color: roleIndex != i ? Colors.grey.shade200 : null,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Center(
                            child: Text(
                              roles[i],
                              style: TextStyle(
                                color: roleIndex == i
                                    ? Colors.white
                                    : Colors.black,
                              ),
                            ),
                          ),
                        ),
                      ),
                    );
                  }),
                ),

                const SizedBox(height: 16),

                /// INPUTS
                _input(nameCtrl, "Full Name"),
                _input(emailCtrl, "Email"),
                _input(phoneCtrl, "Phone"),
                _input(usernameCtrl, "Username"),

                if (roleIndex == 1)
                  _input(lawyerIdCtrl, "Lawyer ID"),

                /// PASSWORD
                TextField(
                  controller: passwordCtrl,
                  obscureText: !showPassword,
                  decoration: InputDecoration(
                    hintText: "Password",
                    suffixIcon: IconButton(
                      icon: Icon(showPassword
                          ? Icons.visibility
                          : Icons.visibility_off),
                      onPressed: () =>
                          setState(() => showPassword = !showPassword),
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                  ),
                ),

                const SizedBox(height: 20),

                /// BUTTON
                GestureDetector(
                  onTap: signup,
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    decoration: BoxDecoration(
                      gradient: gradient,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Center(
                      child: Text(
                        "Sign up as ${roles[roleIndex]}",
                        style: const TextStyle(
                            color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 12),

                TextButton(
                  onPressed: () =>
                      Navigator.pushReplacementNamed(context, '/login'),
                  child: const Text("Already have account? Login"),
                )
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _input(TextEditingController c, String hint) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: TextField(
        controller: c,
        decoration: InputDecoration(
          hintText: hint,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
          ),
        ),
      ),
    );
  }
}