# users/tests.py
from django.test import TestCase
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model
from users.forms import CustomUserCreationForm, CustomUserChangeForm
from users.serializers import CreateUserSerializer
from users.managers import CustomUserManager

from rest_framework.test import APITestCase
from rest_framework import status


User = get_user_model()

class UserModelTests(TestCase):
    def test_create_user_success(self):
        user = User.objects.create_user(
            email="test@example.com",
            password="securepassword",
            first_name="Test",
            last_name="User"
        )
        self.assertEqual(user.email, "test@example.com")
        self.assertTrue(user.check_password("securepassword"))
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_create_superuser_success(self):
        admin = User.objects.create_superuser(
            email="admin@example.com",
            password="adminpass",
            first_name="Admin",
            last_name="User"
        )
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)

    def test_user_str_representation(self):
        user = User.objects.create_user(
            email="john@example.com", password="pass123", first_name="John", last_name="Doe"
        )
        self.assertEqual(str(user), "john@example.com")

    def test_get_full_name_property(self):
        user = User.objects.create_user(
            email="john@example.com", password="pass123", first_name="John", last_name="Doe"
        )
        self.assertEqual(user.get_full_name, "John Doe")

    def test_missing_email_raises_error(self):
        with self.assertRaisesMessage(ValueError, "Base User: and email address is required"):
            User.objects.create_user(
                first_name="No", last_name="Email", email=None, password="pass"
            )

    def test_invalid_email_format_raises_error(self):
        with self.assertRaises(ValueError):
            User.objects.create_user(
                first_name="Bad", last_name="Email", email="not-an-email", password="pass"
            )

    def test_missing_first_name_raises_error(self):
        with self.assertRaisesMessage(ValueError, "Users must submit a first name"):
            User.objects.create_user(
                first_name="", last_name="User", email="x@example.com", password="pass"
            )

    def test_missing_last_name_raises_error(self):
        with self.assertRaisesMessage(ValueError, "Users must submit a last name"):
            User.objects.create_user(
                first_name="X", last_name="", email="x@example.com", password="pass"
            )


class UserFormTests(TestCase):
    def test_valid_user_creation_form(self):
        form = CustomUserCreationForm(data={
            "email": "formuser@example.com",
            "first_name": "Form",
            "last_name": "User",
            "password1": "StrongPassword123!",
            "password2": "StrongPassword123!"
        })
        self.assertTrue(form.is_valid())

    def test_invalid_user_creation_form_mismatched_password(self):
        form = CustomUserCreationForm(data={
            "email": "formuser@example.com",
            "first_name": "Form",
            "last_name": "User",
            "password1": "Password123!",
            "password2": "WrongPassword"
        })
        self.assertFalse(form.is_valid())
        self.assertIn("password2", form.errors)


class UserSerializerTests(TestCase):
    def test_create_user_serializer(self):
        data = {
            "email": "serializer@example.com",
            "first_name": "Serial",
            "last_name": "Izer",
            "password": "supersecurepassword"
        }
        serializer = CreateUserSerializer(data=data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        user = serializer.save()
        self.assertEqual(user.email, data["email"])
        self.assertTrue(user.check_password(data["password"]))

class DjoserRegistrationTests(APITestCase):
    def test_user_registration(self):
        response = self.client.post("/api/v1/auth/users/", {
            "email": "djoser@example.com",
            "first_name": "Djo",
            "last_name": "Ser",
            "password": "S3cur3P@ssword!",
            "re_password": "S3cur3P@ssword!"
        })
        print(response.status_code, response.data)  # Optional for debugging
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)


