from rest_framework import serializers
from .models import DoctorProfile, Qualification, Experience


class QualificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Qualification
        fields = ['id', 'degree_name', 'institute_name', 'year_of_completion']


class ExperienceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Experience
        fields = ['id', 'hospital_name', 'designation', 'start_date', 'end_date', 'is_current', 'description']

    def validate(self, data):
        # Data validation to ensure chronological date alignment
        if data.get('end_date') and data['end_date'] < data['start_date']:
            raise serializers.ValidationError("End date cannot be earlier than start date.")
        return data


class DoctorProfileSerializer(serializers.ModelSerializer):
    # Deep nested relational data serialization sets
    qualifications = QualificationSerializer(many=True, read_only=True)
    experiences = ExperienceSerializer(many=True, read_only=True)

    # Direct field mapping links out of your registered user account record
    email = serializers.EmailField(source='user.email', read_only=True)
    name = serializers.CharField(source='user.username', read_only=True)  # Maps the account string to name row

    class Meta:
        model = DoctorProfile
        fields = [
            'id', 'name', 'email', 'specialization',
            'location', 'profile_photo', 'bio',
            'license_number', 'clinic_or_hospital',
            'is_verified', 'qualifications', 'experiences'
        ]
