import time

from django.core.management.base import BaseCommand, CommandError

from apps.messaging.outbox import process_batch


class Command(BaseCommand):
    help = 'Process durable messaging outbox events and retry transient failures.'

    def add_arguments(self, parser):
        parser.add_argument('--loop', action='store_true', help='Run continuously as a worker process.')
        parser.add_argument('--sleep', type=float, default=1.0, help='Seconds between polls in loop mode.')
        parser.add_argument('--batch-size', type=int, default=100, help='Maximum events processed per poll.')

    def handle(self, *args, **options):
        if options['sleep'] < 0.1 or options['batch_size'] < 1 or options['batch_size'] > 1000:
            raise CommandError('sleep must be >= 0.1 and batch-size must be between 1 and 1000.')
        while True:
            counts = process_batch(options['batch_size'])
            if any(counts.values()):
                self.stdout.write(str(counts))
            if not options['loop']:
                break
            time.sleep(options['sleep'])
