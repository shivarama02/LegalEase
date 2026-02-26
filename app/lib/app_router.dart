import 'package:flutter/material.dart';

import 'auth/login_page.dart';
import 'auth/signup_page.dart';

class AppRoutes {
	static const String home = '/';
	static const String login = '/login';
	static const String signup = '/signup';
	static const String userHome = '/user';
	static const String lawyerHome = '/lawyer';
	static const String adminHome = '/admin';
}

class AppRouter {
	static Route<dynamic> onGenerateRoute(RouteSettings settings) {
		switch (settings.name) {
			case AppRoutes.home:
				return _page(const _PlaceholderScreen(title: 'Home'));
			case AppRoutes.login:
				return _page(const LoginPage());
			case AppRoutes.signup:
				return _page(const SignUpPage());
			case AppRoutes.userHome:
				return _page(const _PlaceholderScreen(title: 'User Home'));
			case AppRoutes.lawyerHome:
				return _page(const _PlaceholderScreen(title: 'Lawyer Home'));
			case AppRoutes.adminHome:
				return _page(const _PlaceholderScreen(title: 'Admin Home'));
			default:
				return _page(UnknownRoutePage(requested: settings.name));
		}
	}

	static MaterialPageRoute<dynamic> _page(Widget child) =>
			MaterialPageRoute(builder: (_) => child);
}

class UnknownRoutePage extends StatelessWidget {
	const UnknownRoutePage({super.key, this.requested});
	final String? requested;
	@override
	Widget build(BuildContext context) {
		return Scaffold(
			appBar: AppBar(title: const Text('Unknown route')),
			body: Center(
				child: Text(
					'No route found for: ${requested ?? 'N/A'}',
					style: const TextStyle(fontSize: 16),
				),
			),
		);
	}
}

class _PlaceholderScreen extends StatelessWidget {
	const _PlaceholderScreen({required this.title});
	final String title;
	@override
	Widget build(BuildContext context) {
		return Scaffold(
			appBar: AppBar(title: Text(title)),
			body: Center(
				child: Text(
					'$title screen coming soon',
					style: const TextStyle(fontSize: 18),
				),
			),
		);
	}
}
