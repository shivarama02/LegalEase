"""
Management command: create_all_rooms

Creates a ChatRoom for every (client_user, lawyer) pair that doesn't
already have one.  Run this once to backfill rooms for accounts that
were created before the auto-room-creation feature was added.

Usage:
    python manage.py create_all_rooms
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from legal_app.models import Lawyer, ChatRoom


class Command(BaseCommand):
    help = "Backfill ChatRooms for every existing user-lawyer pair."

    def handle(self, *args, **options):
        client_users = User.objects.filter(client_profile__isnull=False)
        lawyers = list(Lawyer.objects.select_related('user').all())

        created = 0
        skipped = 0

        for user in client_users:
            for lawyer in lawyers:
                _, was_created = ChatRoom.objects.get_or_create(
                    client=user, lawyer=lawyer
                )
                if was_created:
                    created += 1
                else:
                    skipped += 1

        self.stdout.write(
            self.style.SUCCESS(
                f"Done. Created {created} new rooms, {skipped} already existed."
            )
        )
