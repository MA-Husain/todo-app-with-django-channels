from rest_framework import serializers
from .models import TodoList, TodoItem, SharedTodoList
from django.contrib.auth import get_user_model

User = get_user_model()

class TodoItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = TodoItem
        fields = '__all__'
        read_only_fields = ['list']

class TodoListSerializer(serializers.ModelSerializer):
    todos = TodoItemSerializer(many=True, read_only=True)

    class Meta:
        model = TodoList
        fields = ['id', 'title', 'created', 'updated', 'owner', 'todos']
        read_only_fields = ['owner']

class SharedTodoListSerializer(serializers.ModelSerializer):
    shared_by = serializers.SlugRelatedField(source='todo_list.owner', read_only=True, slug_field='first_name')
    shared_to = serializers.SlugRelatedField(source='user', read_only=True, slug_field='email')
    list = TodoListSerializer(source='todo_list', read_only=True)

    shared_with_first_name = serializers.CharField(source='user.first_name', read_only=True)
    shared_with_last_name = serializers.CharField(source='user.last_name', read_only=True)

    class Meta:
        model = SharedTodoList
        fields = ['id', 'list', 'shared_by', 'shared_to', 'shared_with_first_name', 'shared_with_last_name', 'permission']

