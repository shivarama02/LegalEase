import 'package:flutter/material.dart';

class UserAppTopBar extends StatelessWidget implements PreferredSizeWidget {
  const UserAppTopBar({super.key, this.onProfileTap});

  final VoidCallback? onProfileTap;

  @override
  Size get preferredSize => const Size.fromHeight(kToolbarHeight);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      backgroundColor: Colors.transparent, // FIXED
      surfaceTintColor: Colors.transparent,
      elevation: 0,
      scrolledUnderElevation: 0,
      shadowColor: Colors.transparent,
      automaticallyImplyLeading: false,
      iconTheme: const IconThemeData(color: Colors.white),

      leading: Builder(
        builder: (context) => IconButton(
          icon: const Icon(Icons.menu, color: Colors.white),
          onPressed: () => Scaffold.of(context).openDrawer(),
        ),
      ),

      actions: [
        Padding(
          padding: const EdgeInsets.only(right: 12),
          child: InkWell(
            borderRadius: BorderRadius.circular(20),
            onTap: onProfileTap,
            child: const CircleAvatar(
              foregroundImage:
                  AssetImage('assets/images/monkey.png'),
              child: Icon(Icons.person),
            ),
          ),
        ),
      ],
    );
  }
}
