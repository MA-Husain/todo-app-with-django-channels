# your_app/admin.py
from django.contrib import admin
from .models import TodoList, SharedTodoList, TodoItem

class TodoItemInline(admin.TabularInline):
    model = TodoItem
    extra = 0
    fields = ['body', 'completed', 'created']
    readonly_fields = ['created']
    show_change_link = True

@admin.register(TodoList)
class TodoListAdmin(admin.ModelAdmin):
    list_display = ['title', 'owner', 'created', 'updated']
    list_filter = ['created', 'updated']
    search_fields = ['title', 'owner__username']
    ordering = ['-created']
    inlines = [TodoItemInline]

@admin.register(SharedTodoList)
class SharedTodoListAdmin(admin.ModelAdmin):
    list_display = ['todo_list', 'user', 'permission']
    list_filter = ['permission']
    search_fields = ['todo_list__title', 'user__username']
    autocomplete_fields = ['todo_list', 'user']

@admin.register(TodoItem)
class TodoItemAdmin(admin.ModelAdmin):
    list_display = ['body', 'todo_list', 'completed', 'created']
    list_filter = ['completed', 'created']
    search_fields = ['body', 'todo_list__title']
    autocomplete_fields = ['todo_list']
