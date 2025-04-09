from django.db import models
from django.conf import settings

class TodoList(models.Model):
    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="owned_lists"
    )
    title = models.CharField(max_length=100)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)  # ✅ ADD THIS

    def __str__(self):
        return self.title


class SharedTodoList(models.Model):
    VIEW = 'view'
    EDIT = 'edit'

    PERMISSION_CHOICES = [
        (VIEW, 'View'),
        (EDIT, 'Edit'),
    ]

    todo_list = models.ForeignKey(TodoList, on_delete=models.CASCADE, related_name="shared_with")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="shared_lists")
    permission = models.CharField(max_length=10, choices=PERMISSION_CHOICES)

    class Meta:
        unique_together = ('todo_list', 'user')


class TodoItem(models.Model):
    todo_list = models.ForeignKey(TodoList, on_delete=models.CASCADE, related_name="items")
    body = models.CharField(max_length=300)
    completed = models.BooleanField(default=False)
    updated = models.DateTimeField(auto_now=True)
    created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.body
