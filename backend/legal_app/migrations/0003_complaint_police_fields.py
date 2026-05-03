"""Add police-complaint fields.

This migration is written defensively because SQLite schema changes may be left
partially applied if a previous migrate attempt crashed mid-way. In that case,
re-applying plain AddField operations can fail with "duplicate column".
"""

from django.db import migrations, models


def _column_exists(schema_editor, table_name: str, column_name: str) -> bool:
    connection = schema_editor.connection
    with connection.cursor() as cursor:
        try:
            description = connection.introspection.get_table_description(cursor, table_name)
            return any(getattr(col, 'name', None) == column_name for col in description)
        except Exception:
            # Fallback for SQLite and/or older Django internals
            cursor.execute(f"PRAGMA table_info({table_name})")
            return any(row[1] == column_name for row in cursor.fetchall())


def add_missing_columns(apps, schema_editor):
    Complaint = apps.get_model('legal_app', 'Complaint')
    ComplaintDraft = apps.get_model('legal_app', 'ComplaintDraft')

    def add_column(table: str, column: str, sql_type: str):
        if _column_exists(schema_editor, table, column):
            return
        qn = schema_editor.quote_name
        schema_editor.execute(f"ALTER TABLE {qn(table)} ADD COLUMN {qn(column)} {sql_type}")

    add_column(Complaint._meta.db_table, 'incident_time', 'time')
    add_column(Complaint._meta.db_table, 'police_station', 'varchar(255)')
    add_column(Complaint._meta.db_table, 'subject', 'varchar(255)')

    add_column(ComplaintDraft._meta.db_table, 'incident_time', 'time')
    add_column(ComplaintDraft._meta.db_table, 'police_station', 'varchar(255)')
    add_column(ComplaintDraft._meta.db_table, 'subject', 'varchar(255)')


class Migration(migrations.Migration):

    dependencies = [
        ('legal_app', '0002_emailotp_preverifiedlawyer'),
    ]

    operations = [
        migrations.SeparateDatabaseAndState(
            database_operations=[
                migrations.RunPython(add_missing_columns, migrations.RunPython.noop),
            ],
            state_operations=[
                migrations.AddField(
                    model_name='complaint',
                    name='incident_time',
                    field=models.TimeField(blank=True, null=True),
                ),
                migrations.AddField(
                    model_name='complaint',
                    name='police_station',
                    field=models.CharField(blank=True, null=True, max_length=255),
                ),
                migrations.AddField(
                    model_name='complaint',
                    name='subject',
                    field=models.CharField(blank=True, null=True, max_length=255),
                ),
                migrations.AddField(
                    model_name='complaintdraft',
                    name='incident_time',
                    field=models.TimeField(blank=True, null=True),
                ),
                migrations.AddField(
                    model_name='complaintdraft',
                    name='police_station',
                    field=models.CharField(blank=True, null=True, max_length=255),
                ),
                migrations.AddField(
                    model_name='complaintdraft',
                    name='subject',
                    field=models.CharField(blank=True, null=True, max_length=255),
                ),
            ],
        ),
    ]
