import 'package:flutter/material.dart';

class LandingPage extends StatelessWidget {
  const LandingPage({super.key});

  static const indigo = Color(0xFF4F46E5);
  static const violet = Color(0xFF7C3AED);

  @override
  Widget build(BuildContext context) {

    return Scaffold(
      body: Stack(
        children: [

          /// Background Image
          Positioned.fill(
            child: Image.network(
              "https://plus.unsplash.com/premium_photo-1697730370455-0040cd34c580",
              fit: BoxFit.cover,
            ),
          ),

          /// Overlay
          Positioned.fill(
            child: Container(
              color: Colors.white.withOpacity(0.7),
            ),
          ),

          /// Content
          SafeArea(
            child: SingleChildScrollView(
              child: Column(
                children: [

                  /// HERO
                  _heroSection(context),

                  /// FEATURES
                  _featuresSection(),

                  /// STEPS
                  _stepsSection(),

                  /// ABOUT
                  _aboutSection(),

                  /// CONTACT
                  _contactSection(),

                  /// CTA
                  _ctaSection(context),

                  const SizedBox(height: 30),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  /// ================= HERO =================
  Widget _heroSection(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 30),
      child: Column(
        children: [

          const Icon(Icons.star, color: indigo, size: 20),

          const SizedBox(height: 10),

          const Text(
            "Trusted Legal Platform",
            style: TextStyle(color: indigo, fontWeight: FontWeight.w600),
          ),

          const SizedBox(height: 20),

          RichText(
            textAlign: TextAlign.center,
            text: TextSpan(
              text: "Your Complete ",
              style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: Colors.black),
              children: [
                TextSpan(
                  text: "Legal Platform",
                  style: TextStyle(
                    foreground: Paint()
                      ..shader = LinearGradient(
                        colors: [indigo, violet],
                      ).createShader(Rect.fromLTWH(0, 0, 200, 70)),
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          const Text(
            "Access legal information, generate complaints, find lawyers, and get AI-powered assistance.",
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey),
          ),

          const SizedBox(height: 25),

          /// Buttons
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [

              _gradientButton("Get Started", () {
                Navigator.pushNamed(context, "/login");
              }),

              const SizedBox(width: 10),

              _outlineButton("Browse Laws"),
            ],
          ),

          const SizedBox(height: 30),

          /// Stats
          Wrap(
            spacing: 10,
            runSpacing: 10,
            alignment: WrapAlignment.center,
            children: const [
              _StatCard("500+", "Laws"),
              _StatCard("200+", "Lawyers"),
              _StatCard("1000+", "Complaints"),
              _StatCard("24/7", "AI"),
            ],
          )
        ],
      ),
    );
  }

  /// ================= FEATURES =================
  Widget _featuresSection() {
    final features = [
      ["Legal Information", Icons.balance],
      ["AI Assistant", Icons.chat],
      ["Complaint Generator", Icons.description],
      ["Lawyer Directory", Icons.people],
      ["Secure", Icons.security],
      ["Easy Navigation", Icons.search],
    ];

    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [

          const Text("Features", style: TextStyle(color: indigo)),

          const SizedBox(height: 10),

          const Text(
            "Everything You Need",
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
          ),

          const SizedBox(height: 20),

          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: features.length,
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              childAspectRatio: 1.1,
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
            ),
            itemBuilder: (_, i) {

              return Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  boxShadow: [
                    BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 6)
                  ],
                ),
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(features[i][1] as IconData, color: indigo),
                    const SizedBox(height: 8),
                    Text(features[i][0] as String, textAlign: TextAlign.center),
                  ],
                ),
              );
            },
          )
        ],
      ),
    );
  }

  /// ================= STEPS =================
  Widget _stepsSection() {
    final steps = [
      ["01", "Create Account"],
      ["02", "Explore"],
      ["03", "Take Action"],
    ];

    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [

          const Text("How It Works", style: TextStyle(color: indigo)),

          const SizedBox(height: 20),

          Row(
            mainAxisAlignment: MainAxisAlignment.spaceEvenly,
            children: steps.map((s) {
              return Column(
                children: [
                  Text(s[0], style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 5),
                  Text(s[1]),
                ],
              );
            }).toList(),
          )
        ],
      ),
    );
  }

  /// ================= ABOUT =================
  Widget _aboutSection() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: const [

          Text("About Us", style: TextStyle(color: indigo)),

          SizedBox(height: 10),

          Text(
            "Making Law Accessible",
            style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
          ),

          SizedBox(height: 10),

          Text(
            "LegalEase helps users access legal info, generate complaints and connect with lawyers.",
            textAlign: TextAlign.center,
          )
        ],
      ),
    );
  }

  /// ================= CONTACT =================
  Widget _contactSection() {
    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        children: [

          const Text("Have Questions?"),

          const SizedBox(height: 10),

          _gradientButton("Contact Us", () {})
        ],
      ),
    );
  }

  /// ================= CTA =================
  Widget _ctaSection(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: const BoxDecoration(
        gradient: LinearGradient(colors: [indigo, violet]),
      ),
      child: Column(
        children: [

          const Text(
            "Ready to Get Started?",
            style: TextStyle(color: Colors.white, fontSize: 20),
          ),

          const SizedBox(height: 10),

          ElevatedButton(
            onPressed: () {
              Navigator.pushNamed(context, "/signup");
            },
            child: const Text("Create Account"),
          )
        ],
      ),
    );
  }

  /// ================= BUTTONS =================
  static Widget _gradientButton(String text, VoidCallback onTap) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
        decoration: BoxDecoration(
          gradient: const LinearGradient(colors: [indigo, violet]),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(text, style: const TextStyle(color: Colors.white)),
      ),
    );
  }

  static Widget _outlineButton(String text) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 18, vertical: 10),
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(text),
    );
  }
}

/// ================= STAT CARD =================
class _StatCard extends StatelessWidget {
  final String value;
  final String label;

  const _StatCard(this.value, this.label);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        children: [
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold)),
          Text(label, style: const TextStyle(fontSize: 12)),
        ],
      ),
    );
  }
}