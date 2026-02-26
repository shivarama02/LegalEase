import 'package:flutter/material.dart';

class UserCasesPage extends StatelessWidget {
	const UserCasesPage({super.key});

	@override
	Widget build(BuildContext context) {
		return Scaffold(
			appBar: AppBar(title: const Text('My Cases')),
			body: const Center(
				child: Text('User Cases Page'),
			),
		);
	}
}
