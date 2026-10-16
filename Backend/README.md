# Zenve Vet — 100 demo users for MySQL

Copy `apps/accounts/management/commands/seed_demo_data.py` into your backend. Ensure `__init__.py` exists in `apps/accounts/management/` and `commands/`.

From the directory containing `manage.py`:

```powershell
python manage.py check
python manage.py migrate
python manage.py seed_demo_data
```

To remove only seeded demo accounts and recreate the dataset:

```powershell
python manage.py seed_demo_data --reset
```

It creates 100 fictional vet accounts with complete current `DoctorProfile` fields (specialty, city, state, bio, profile photo URL, banner URL, website, gallery, verification flag), one clinic per account, at least one pet-photo post per account, video posts for half the users, and clinical-case posts for a third.

Demo users use emails ending in `@demo.zenvevet.internal`. Newly created accounts use the temporary password `DemoVet123!ChangeMe`. Local development only; change this before sharing the environment.

Images and video are remote public URLs stored in MySQL, not local binary uploads. Browser access to the internet is required. The sample video URLs may not all match their post captions exactly. All people, profiles and case descriptions are fictional.
