import 'package:flutter/material.dart';
import 'user_appoinment.dart';
import 'user_cases.dart';
import 'user_profile.dart';
import 'user_aichat.dart';
import 'user_chat.dart';
import 'user_laws.dart';
import 'user_notification.dart';
import '../widgets/user_app_bar.dart';
import '../widgets/user_background.dart';
import '../widgets/user_bottom_nav_bar.dart';

class UserHomePage extends StatefulWidget {
  const UserHomePage({super.key});

  @override
  State<UserHomePage> createState() => _UserHomePageState();
}

class _UserHomePageState extends State<UserHomePage> {
  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Scaffold(
      backgroundColor: const Color(0xFF0E1116),
      extendBody: true,
      extendBodyBehindAppBar: true,

      /// ================= DRAWER =================
      drawer: Drawer(
        backgroundColor: const Color(0xFF151A22),
        child: ListView(
          padding: const EdgeInsets.only(top: 40),
          children: [
            const Padding(
              padding: EdgeInsets.symmetric(horizontal: 16),
              child: Text(
                "LegalEase",
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: Colors.white,
                ),
              ),
            ),
            const SizedBox(height: 20),
            _drawerItem(
              icon: Icons.home,
              title: "Home",
              onTap: () {
                Navigator.pop(context);
                setState(() => _selectedIndex = 0);
              },
            ),
            _drawerItem(
              icon: Icons.calendar_month,
              title: "Appointment",
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(
                      builder: (_) => const UserAppoinmentPage()),
                );
              },
            ),
            _drawerItem(
              icon: Icons.folder,
              title: "My Cases",
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const UserCasesPage()),
                );
              },
            ),
            _drawerItem(
              icon: Icons.person,
              title: "Profile",
              onTap: () {
                Navigator.pop(context);
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const UserProfilePage()),
                );
              },
            ),
            _drawerItem(
              icon: Icons.logout,
              title: "Logout",
              onTap: () {
                Navigator.pop(context);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Logged out')),
                );
              },
            ),
          ],
        ),
      ),

      /// ================= APP BAR =================
      appBar: UserAppTopBar(
        onProfileTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (_) => const UserProfilePage()),
          );
        },
      ),

      /// ================= BODY =================
      body: UserBackground(
        child: SafeArea(
          child: _selectedIndex == 0
              ? Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [

                      const SizedBox(height: 20),

                      /// Welcome
                      Text(
                        "Welcome, Shivarama!",
                        style: TextStyle(
                          color: cs.primary,
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                        ),
                      ),

                      const SizedBox(height: 8),

                      const Text(
                        "Access legal information, generate complaints, find lawyers, and get AI-powered assistance.",
                        style: TextStyle(color: Colors.white70),
                      ),

                      const SizedBox(height: 30),

                      _dashboardCard(
                        icon: Icons.menu_book,
                        title: "Know about Laws",
                      ),

                      const SizedBox(height: 20),

                      _dashboardCard(
                        icon: Icons.newspaper,
                        title: "Latest News about Laws",
                      ),

                      const SizedBox(height: 20),

                      _dashboardCard(
                        icon: Icons.calendar_month,
                        title: "Calendar",
                      ),

                      const Spacer(),
                    ],
                  ),
                )
              : _buildOtherTabs(),
        ),
      ),

      /// ================= BOTTOM NAV =================
      bottomNavigationBar: UserBottomNavBar(
        selectedIndex: _selectedIndex,
        onTap: (i) => setState(() => _selectedIndex = i),
      ),
    );
  }

  /// ================= OTHER TABS =================
  Widget _buildOtherTabs() {
    switch (_selectedIndex) {
      case 1:
        return const UserLawsPage();
      case 2:
        return const UserAiChatPage();
      case 3:
        return const UserNotificationPage();
      case 4:
        return const UserChatPage();
      default:
        return const SizedBox();
    }
  }

  /// ================= DASHBOARD CARD =================
  Widget _dashboardCard({
    required IconData icon,
    required String title,
  }) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.06),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: Colors.white.withOpacity(0.1)),
      ),
      child: Row(
        children: [
          Icon(icon, color: Colors.blueAccent, size: 28),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              title,
              style: const TextStyle(
                fontSize: 18,
                color: Colors.white,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          const Icon(Icons.arrow_forward_ios,
              color: Colors.white38, size: 16),
        ],
      ),
    );
  }

  /// ================= DRAWER ITEM =================
  Widget _drawerItem({
    required IconData icon,
    required String title,
    required VoidCallback onTap,
  }) {
    return ListTile(
      leading: Icon(icon, color: Colors.white70),
      title: Text(
        title,
        style: const TextStyle(color: Colors.white70),
      ),
      onTap: onTap,
    );
  }
}
