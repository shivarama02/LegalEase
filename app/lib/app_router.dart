import 'package:flutter/material.dart';
import 'landing_page.dart';
// import your other pages
import 'auth/login.dart';
import 'auth/signup.dart';

class AppRouter {

  static Route<dynamic> onGenerateRoute(RouteSettings settings) {

    switch (settings.name) {

      case '/':
        return MaterialPageRoute(
          builder: (_) => const LandingPage(),
        );

      case '/login':
        return MaterialPageRoute(
          builder: (_) => const LoginPage(),
        );

      case '/signup':
        return MaterialPageRoute(
          builder: (_) => const SignupPage(),
        );

      default:
        return MaterialPageRoute(
          builder: (_) => Scaffold(
            body: Center(
              child: Text("No route defined for ${settings.name}"),
            ),
          ),
        );
    }
  }
}