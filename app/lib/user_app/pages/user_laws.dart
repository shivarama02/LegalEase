import 'package:flutter/material.dart';
import '../widgets/user_background.dart';

class UserLawsPage extends StatelessWidget {
  const UserLawsPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const UserBackground(
      child: Center(
        child: Text('User Laws Page'),
      ),
    );
  }
}
