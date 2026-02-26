import 'package:flutter/material.dart';

class UserAppoinmentPage extends StatelessWidget {
  const UserAppoinmentPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Appointmet')),
      body: const Center(
        child: Text('User Appoinment Page'),
      ),
    );
  }
}
