from django.core.management.base import BaseCommand
from django.utils import timezone
from legal_app.models import Lawyer

NAMES = [
    "gokul",
    "abhishek",
    "anandu",
    "yadhu",
    # add a 5th if desired
]

class Command(BaseCommand):
    help = "Populate the legal_app_lawyer table with sample lawyer records by names"

    def add_arguments(self, parser):
        parser.add_argument('--extra', nargs='*', default=[], help='Extra names to add beyond the defaults')

    def handle(self, *args, **options):
        names = NAMES + options.get('extra', [])
        created = 0
        for name in names:
            uname = name.lower().replace(' ', '')
            email = f"{uname}@example.com"
            # ensure uniqueness for username and email if they already exist
            base_uname = uname
            i = 0
            while Lawyer.objects.filter(username=uname).exists():
                i += 1
                uname = f"{base_uname}{i}"
                email = f"{uname}@example.com"

            phone = f"90000{timezone.now().strftime('%S%f')[:6]}"  # pseudo-unique
            lawyer, was_created = Lawyer.objects.get_or_create(
                username=uname,
                defaults={
                    'lname': name.title(),
                    'email': email,
                    'phone': phone,
                    'specialization': 'General',
                    'experience_years': 1,
                    'location': 'City',
                    'charge': 1000.00,
                    'lawyer_id': None,
                    'languages': 'English',
                    'bio': 'Sample lawyer',
                    'is_verified': False,
                    'photo_url': '',
                }
            )
            if was_created:
                created += 1
                self.stdout.write(self.style.SUCCESS(f"Created lawyer: {lawyer.username} ({lawyer.lname})"))
            else:
                self.stdout.write(self.style.WARNING(f"Already exists: {lawyer.username}"))
        self.stdout.write(self.style.SUCCESS(f"Done. Created: {created}, Total requested: {len(names)}"))
