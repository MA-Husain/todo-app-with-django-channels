# todo/tests.py
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth import get_user_model
from .models import TodoList, TodoItem, SharedTodoList
from rest_framework.exceptions import PermissionDenied


User = get_user_model()

class TodoAPITests(APITestCase):
    def setUp(self):
        self.owner = User.objects.create_user(
            email="owner@example.com", password="password", first_name="Owner", last_name="User"
        )
        self.shared_user = User.objects.create_user(
            email="shared@example.com", password="password", first_name="Shared", last_name="User"
        )
        self.client = APIClient()
        self.client.force_authenticate(user=self.owner)

    def authenticate_owner(self):
        self.client.force_authenticate(user=self.owner)

    def authenticate_shared_user(self):
        self.client.force_authenticate(user=self.shared_user)

    def test_owner_can_create_list(self):
        response = self.client.post("/api/lists/", {"title": "Groceries"})
        self.assertEqual(response.status_code, 201)
        self.assertEqual(TodoList.objects.count(), 1)

    def test_owner_can_retrieve_own_list(self):
        todo_list = TodoList.objects.create(title="Work", owner=self.owner)
        response = self.client.get(f"/api/lists/{todo_list.id}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['title'], "Work")

    def test_owner_can_share_list(self):
        todo_list = TodoList.objects.create(title="Team", owner=self.owner)
        response = self.client.post("/api/shared-todolists/", {
            "todo_list": todo_list.id,
            "shared_with_email": "shared@example.com",
            "permission": "edit"
        })
        self.assertEqual(response.status_code, 201)
        self.assertEqual(SharedTodoList.objects.count(), 1)

    def test_shared_user_can_view_list(self):
        todo_list = TodoList.objects.create(title="Shared View", owner=self.owner)
        SharedTodoList.objects.create(todo_list=todo_list, user=self.shared_user, permission="view")
        self.authenticate_shared_user()
        response = self.client.get(f"/api/lists/{todo_list.id}/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['title'], "Shared View")

    def test_shared_user_cannot_edit_share_permission(self):
        todo_list = TodoList.objects.create(title="Secrets", owner=self.owner)
        share = SharedTodoList.objects.create(todo_list=todo_list, user=self.shared_user, permission="view")
        self.authenticate_shared_user()
        response = self.client.patch(f"/api/shared-todolists/{share.id}/", {"permission": "edit"})
        self.assertEqual(response.status_code, 403)

    def test_shared_user_cannot_unshare(self):
        todo_list = TodoList.objects.create(title="Secrets", owner=self.owner)
        share = SharedTodoList.objects.create(todo_list=todo_list, user=self.shared_user, permission="edit")
        self.authenticate_shared_user()
        response = self.client.delete(f"/api/shared-todolists/{share.id}/")
        self.assertEqual(response.status_code, 403)

    def test_owner_can_update_share_permission(self):
        todo_list = TodoList.objects.create(title="Team Edit", owner=self.owner)
        share = SharedTodoList.objects.create(todo_list=todo_list, user=self.shared_user, permission="view")
        response = self.client.patch(f"/api/shared-todolists/{share.id}/", {"permission": "edit"})
        self.assertEqual(response.status_code, 200)
        share.refresh_from_db()
        self.assertEqual(share.permission, "edit")

    def test_owner_can_unshare_user(self):
        todo_list = TodoList.objects.create(title="Remove Access", owner=self.owner)
        share = SharedTodoList.objects.create(todo_list=todo_list, user=self.shared_user, permission="view")
        response = self.client.delete(f"/api/shared-todolists/{share.id}/")
        self.assertEqual(response.status_code, 204)

    def test_create_todo_item(self):
        todo_list = TodoList.objects.create(title="Tasks", owner=self.owner)
        response = self.client.post("/api/items/", {
            "todo_list": todo_list.id,
            "body": "Write report"
        })
        self.assertEqual(response.status_code, 201)
        self.assertEqual(TodoItem.objects.count(), 1)

    def test_shared_user_with_edit_can_create_item(self):
        todo_list = TodoList.objects.create(title="Shared Edits", owner=self.owner)
        SharedTodoList.objects.create(todo_list=todo_list, user=self.shared_user, permission="edit")
        self.authenticate_shared_user()
        response = self.client.post("/api/items/", {
            "todo_list": todo_list.id,
            "body": "Add item"
        })
        self.assertEqual(response.status_code, 201)

    def test_shared_user_with_view_cannot_create_item(self):
        todo_list = TodoList.objects.create(title="Read Only", owner=self.owner)
        SharedTodoList.objects.create(todo_list=todo_list, user=self.shared_user, permission="view")
        self.authenticate_shared_user()
        response = self.client.post("/api/items/", {
            "todo_list": todo_list.id,
            "body": "Try adding"
        })
        self.assertEqual(response.status_code, 403)
    
    def test_shared_user_with_edit_can_update_item(self):
        todo_list = TodoList.objects.create(title="Shared Edit Update", owner=self.owner)
        item = TodoItem.objects.create(todo_list=todo_list, body="Original")
        SharedTodoList.objects.create(todo_list=todo_list, user=self.shared_user, permission="edit")
        self.authenticate_shared_user()
        response = self.client.patch(f"/api/items/{item.id}/", {"body": "Updated"})
        self.assertEqual(response.status_code, 200)
        item.refresh_from_db()
        self.assertEqual(item.body, "Updated")
    
    def test_shared_user_with_view_cannot_update_item(self):
        todo_list = TodoList.objects.create(title="Read Only Edit", owner=self.owner)
        item = TodoItem.objects.create(todo_list=todo_list, body="Original")
        SharedTodoList.objects.create(todo_list=todo_list, user=self.shared_user, permission="view")
        self.authenticate_shared_user()
        response = self.client.patch(f"/api/items/{item.id}/", {"body": "Try update"})
        self.assertEqual(response.status_code, 403)

    def test_shared_user_with_edit_can_delete_item(self):
        todo_list = TodoList.objects.create(title="Deletable", owner=self.owner)
        item = TodoItem.objects.create(todo_list=todo_list, body="To delete")
        SharedTodoList.objects.create(todo_list=todo_list, user=self.shared_user, permission="edit")
        self.authenticate_shared_user()
        response = self.client.delete(f"/api/items/{item.id}/")
        self.assertEqual(response.status_code, 204)
    
    def test_shared_user_with_view_cannot_delete_item(self):
        todo_list = TodoList.objects.create(title="Undeletable", owner=self.owner)
        item = TodoItem.objects.create(todo_list=todo_list, body="Don't delete")
        SharedTodoList.objects.create(todo_list=todo_list, user=self.shared_user, permission="view")
        self.authenticate_shared_user()
        response = self.client.delete(f"/api/items/{item.id}/")
        self.assertEqual(response.status_code, 403)



    def test_invalid_list_id(self):
        response = self.client.get("/api/lists/999/")
        self.assertEqual(response.status_code, 404)

    def test_duplicate_share_fails(self):
        todo_list = TodoList.objects.create(title="No Duplicates", owner=self.owner)
        SharedTodoList.objects.create(todo_list=todo_list, user=self.shared_user, permission="edit")
        response = self.client.post("/api/shared-todolists/", {
            "todo_list": todo_list.id,
            "shared_with_email": "shared@example.com",
            "permission": "view"
        })
        self.assertEqual(response.status_code, 400)
        self.assertIn("already has access", str(response.data).lower())

    def test_self_share_fails(self):
        todo_list = TodoList.objects.create(title="Self Share", owner=self.owner)
        response = self.client.post("/api/shared-todolists/", {
            "todo_list": todo_list.id,
            "shared_with_email": "owner@example.com",
            "permission": "view"
        })
        self.assertEqual(response.status_code, 400)
        self.assertIn("cannot share a list with yourself", str(response.data).lower())

    def test_permission_check_api(self):
        todo_list = TodoList.objects.create(title="Check Me", owner=self.owner)
        SharedTodoList.objects.create(todo_list=todo_list, user=self.shared_user, permission="view")

        # As owner
        response = self.client.get(f"/api/lists/{todo_list.id}/permission/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["permission"], "edit")
        self.assertTrue(response.data["is_owner"])

        # As shared user
        self.authenticate_shared_user()
        response = self.client.get(f"/api/lists/{todo_list.id}/permission/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["permission"], "view")
        self.assertFalse(response.data["is_owner"])
