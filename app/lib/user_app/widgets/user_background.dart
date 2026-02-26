import 'package:flutter/material.dart';

class UserBackground extends StatelessWidget {
  const UserBackground({
    super.key,
    required this.child,
  });

  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        Image.asset(
          'assets/images/background.png',
          fit: BoxFit.cover,
          errorBuilder: (context, error, stackTrace) => const SizedBox.shrink(),
        ),
        Container(
          color: Colors.black.withValues(alpha: 0.55),
        ),
        child,
      ],
    );
  }
}
