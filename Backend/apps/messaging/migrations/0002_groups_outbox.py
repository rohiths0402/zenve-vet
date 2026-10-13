# Generated for group conversations and transactional outbox support.
import uuid
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


def create_legacy_receipts(apps, schema_editor):
    Message = apps.get_model('messaging', 'Message')
    Participant = apps.get_model('messaging', 'ConversationParticipant')
    Receipt = apps.get_model('messaging', 'MessageReceipt')
    db = schema_editor.connection.alias
    members_by_conversation = {}
    batch = []
    for message in Message.objects.using(db).iterator(chunk_size=1000):
        if message.conversation_id not in members_by_conversation:
            members_by_conversation[message.conversation_id] = list(
                Participant.objects.using(db).filter(
                    conversation_id=message.conversation_id, left_at__isnull=True
                ).values_list('user_id', flat=True))
        for recipient_id in members_by_conversation[message.conversation_id]:
            if recipient_id == message.sender_id:
                continue
            batch.append(Receipt(
                message_id=message.id, recipient_id=recipient_id,
                delivered_at=(message.delivered_at or message.created_at) if message.status >= 2 else None,
                read_at=(message.seen_at or message.created_at) if message.status >= 3 else None,
            ))
        if len(batch) >= 1000:
            Receipt.objects.using(db).bulk_create(batch, batch_size=1000, ignore_conflicts=True)
            batch = []
    if batch:
        Receipt.objects.using(db).bulk_create(batch, batch_size=1000, ignore_conflicts=True)


class Migration(migrations.Migration):
    dependencies = [
        ('messaging', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RemoveConstraint(
            model_name='message',
            name='message_unique_client_id',
        ),
        migrations.AlterField(
            model_name='conversation', name='direct_key',
            field=models.CharField(blank=True, max_length=80, null=True, unique=True),
        ),
        migrations.AddField(
            model_name='conversation', name='conversation_type',
            field=models.CharField(choices=[('DIRECT', 'Direct'), ('GROUP', 'Group')], default='DIRECT', max_length=10),
        ),
        migrations.AddField(
            model_name='conversation', name='title',
            field=models.CharField(blank=True, default='', max_length=120),
        ),
        migrations.AddField(
            model_name='conversation', name='created_by',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL,
                                    related_name='created_conversations', to=settings.AUTH_USER_MODEL),
        ),
        migrations.AddField(
            model_name='conversationparticipant', name='role',
            field=models.CharField(choices=[('OWNER', 'Owner'), ('ADMIN', 'Admin'), ('MEMBER', 'Member')], default='MEMBER', max_length=10),
        ),
        migrations.AddField(
            model_name='conversationparticipant', name='left_at',
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='message', name='client_msg_id',
            field=models.UUIDField(default=uuid.uuid4),
        ),
        migrations.AddConstraint(
            model_name='message',
            constraint=models.UniqueConstraint(fields=('conversation', 'sender', 'client_msg_id'), name='message_unique_client_id'),
        ),
        migrations.AddIndex(
            model_name='conversation',
            index=models.Index(fields=['conversation_type', '-last_message_at', '-id'], name='msg_conv_type_last_idx'),
        ),
        migrations.AddIndex(
            model_name='conversationparticipant',
            index=models.Index(fields=['conversation', 'left_at'], name='msg_part_conv_left_idx'),
        ),
        migrations.AddIndex(
            model_name='message',
            index=models.Index(fields=['conversation', 'created_at', 'id'], name='msg_message_history_idx'),
        ),
        migrations.CreateModel(
            name='MessageReceipt',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('delivered_at', models.DateTimeField(blank=True, null=True)),
                ('read_at', models.DateTimeField(blank=True, null=True)),
                ('message', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='receipts', to='messaging.message')),
                ('recipient', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='message_receipts', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'constraints': [models.UniqueConstraint(fields=('message', 'recipient'), name='message_receipt_unique')],
                'indexes': [models.Index(fields=['recipient', 'read_at'], name='msg_receipt_unread_idx')],
            },
        ),
        migrations.RunPython(create_legacy_receipts, migrations.RunPython.noop),
        migrations.CreateModel(
            name='OutboxEvent',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('event_id', models.UUIDField(default=uuid.uuid4, editable=False, unique=True)),
                ('event_type', models.CharField(max_length=60)),
                ('payload', models.JSONField(default=dict)),
                ('status', models.CharField(choices=[('PENDING', 'Pending'), ('PROCESSING', 'Processing'), ('PROCESSED', 'Processed'), ('FAILED', 'Failed')], default='PENDING', max_length=12)),
                ('attempts', models.PositiveSmallIntegerField(default=0)),
                ('next_attempt_at', models.DateTimeField(auto_now_add=True)),
                ('locked_until', models.DateTimeField(blank=True, null=True)),
                ('processed_at', models.DateTimeField(blank=True, null=True)),
                ('last_error', models.CharField(blank=True, default='', max_length=500)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
            ],
            options={'indexes': [models.Index(fields=['status', 'next_attempt_at', 'id'], name='msg_outbox_poll_idx')]},
        ),
    ]
