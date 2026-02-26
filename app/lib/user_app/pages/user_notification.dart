import 'package:flutter/material.dart';
import '../widgets/user_background.dart';

class UserNotificationPage extends StatelessWidget {
  const UserNotificationPage({super.key});

  @override
  Widget build(BuildContext context) {
    return const UserBackground(
      child: Center(
        child: Text('User Notification Page'),
      ),
    );
  }
}
