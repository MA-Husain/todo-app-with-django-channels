from rest_framework import viewsets, permissions, serializers, status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model
from rest_framework.views import APIView
from .models import TodoList, TodoItem, SharedTodoList
from .serializers import TodoListSerializer, TodoItemSerializer, SharedTodoListSerializer
# views.py
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404


User = get_user_model()


class TodoListViewSet(viewsets.ModelViewSet):
    queryset = TodoList.objects.all()
    serializer_class = TodoListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Only owner's own lists in listing endpoints
        return TodoList.objects.filter(owner=self.request.user)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def retrieve(self, request, *args, **kwargs):
        """Allow owner OR shared user to retrieve a list."""
        list_id = kwargs.get('pk')
        try:
            # Try to get as owner
            todo_list = TodoList.objects.get(pk=list_id, owner=request.user)
        except TodoList.DoesNotExist:
            # Try to get as shared user
            try:
                shared = SharedTodoList.objects.get(todo_list_id=list_id, user=request.user)
                todo_list = shared.todo_list  # <- accessible if shared
            except SharedTodoList.DoesNotExist:
                return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(todo_list)
        return Response(serializer.data)



class TodoItemViewSet(viewsets.ModelViewSet):
    serializer_class = TodoItemSerializer
    queryset = TodoItem.objects.all()

    def get_queryset(self):
        queryset = super().get_queryset()
        list_id = self.request.query_params.get('todo_list')
        if list_id:
            queryset = queryset.filter(todo_list_id=list_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save()


class SharedTodoListViewSet(viewsets.ModelViewSet):
    serializer_class = SharedTodoListSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return SharedTodoList.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        email = self.request.data.get('shared_with_email')

        if not email:
            raise serializers.ValidationError("Email is required.")

        # ✅ Prevent self-sharing
        if email.lower() == self.request.user.email.lower():
            raise serializers.ValidationError("You cannot share a list with yourself.")

        try:
            shared_user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError("User with this email does not exist.")

        todo_list_id = self.request.data.get('todo_list')
        if not todo_list_id:
            raise serializers.ValidationError("Todo list ID is required.")

        # ✅ Prevent duplicate share
        if SharedTodoList.objects.filter(user=shared_user, todo_list_id=todo_list_id).exists():
            raise serializers.ValidationError("This user already has access to the list.")

        serializer.save(user=shared_user, todo_list_id=todo_list_id)


class TodoListPermissionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        try:
            todo_list = TodoList.objects.get(pk=pk)
        except TodoList.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)

        if todo_list.owner == request.user:
            return Response({
                'permission': 'edit',
                'is_owner': True
            })

        shared = SharedTodoList.objects.filter(user=request.user, todo_list=todo_list).first()
        if shared:
            return Response({
                'permission': shared.permission,
                'is_owner': False
            })

        return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
