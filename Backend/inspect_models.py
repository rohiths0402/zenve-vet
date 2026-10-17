from django.apps import apps

for app_label in [
    "accounts", "connections", "messaging",
    "notifications", "posts", "stories"
]:
    print(f"\n=== {app_label} ===")
    for model in apps.get_app_config(app_label).get_models():
        fields = [
            f.name for f in model._meta.get_fields()
            if not f.auto_created or f.concrete
        ]
        print(model.__name__, ":", ", ".join(fields))
